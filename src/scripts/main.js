import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import imagesLoaded from "imagesloaded";
import FontFaceObserver from "fontfaceobserver";
import gsap from "gsap";
import fragment from "../shaders/fragment.glsl";
import vertex from "../shaders/vertex.glsl";
import Scroll from "./scroll";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import cityScape from "../images/city_scape.jpg";

export default class Sketch {
  constructor(options) {
    this.container = options.dom;
    this.height = this.container.offsetHeight;
    this.width = this.container.offsetWidth;
    this.time = 0;
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      70,
      this.width / this.height,
      100,
      2000
    );
    this.camera.position.z = 600;
    this.camera.fov = 2 * Math.atan(this.height / 2 / 600) * (180 / Math.PI);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    const fontOpen = new Promise((resolve) => {
      new FontFaceObserver("Open Sans").load().then(() => {
        resolve();
      });
    });

    const fontPlayfair = new Promise((resolve) => {
      new FontFaceObserver("Playfair Display").load().then(() => {
        resolve();
      });
    });

    const preloadImage = new Promise((resolve, reject) => {
      imagesLoaded(
        document.querySelectorAll("img"),
        { background: true },
        resolve
      );
    });

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // All promises
    const allDone = [fontOpen, fontPlayfair, preloadImage];

    this.currentScroll = 0;

    Promise.all(allDone).then(() => {
      this.scroll = new Scroll();
      this.addImages();
      this.setPosition();

      this.mouseMovement();
      this.resize();
      this.setUpResize();
      //this.addObjects();
      this.composerPass();
      this.render();
    });

    this.images = [...document.querySelectorAll("img")];
  }

  composerPass() {
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    //custom shader pass
    var counter = 0.0;
    this.myEffect = {
      uniforms: {
        tDiffuse: { value: null },
        scrollSpeed: { value: null },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix 
            * modelViewMatrix 
            * vec4( position, 1.0 );
        }
        `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        varying vec2 vUv;
        uniform float scrollSpeed;
        void main(){
          vec2 newUV = vUv;
          float area = smoothstep(0.4,0.,vUv.y);
          newUV.x -= (vUv.x - 0.5)*0.1*area*scrollSpeed;
          gl_FragColor = texture2D( tDiffuse, newUV);
          //area = pow(area,4.);
          //newUV.x -= (vUv.x - 0.5)*0.1*area*scrollSpeed;
         // gl_FragColor = vec4(area,0.,0.,1.);
        }
        `,
    };

    this.customPass = new ShaderPass(this.myEffect);
    this.customPass.renderToScreen = true;

    this.composer.addPass(this.customPass);
  }

  mouseMovement() {
    window.addEventListener(
      "mousemove",
      (event) => {
        this.mouse.x = (event.clientX / this.width) * 2 - 1;
        this.mouse.y = -(event.clientY / this.height) * 2 + 1;

        // update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);

        if (intersects.length > 0) {
          // console.log(intersects[0]);
          let obj = intersects[0].object;
          obj.material.uniforms.hover.value = intersects[0].uv;
        }
      },
      false
    );
  }

  addImages() {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        uImage: {},
        hover: { value: new THREE.Vector2(0.5, 0.5) },
        hoverState: { value: 0 },
        cityScapeTexture: { value: new THREE.TextureLoader().load(cityScape) },
      },
      side: THREE.DoubleSide,
      fragmentShader: fragment,
      vertexShader: vertex,
    });

    this.materials = [];

    this.imageStore = this.images.map((image) => {
      let { top, left, width, height } = image.getBoundingClientRect();

      let geometry = new THREE.PlaneBufferGeometry(width, height, 10, 10);
      // In threeJs you can add texture directly from DOM elements
      let texture = new THREE.Texture(image);
      texture.needsUpdate = true;
      // Wer can't use the same exact material so we clone it
      let material = this.material.clone();
      this.materials.push(material);
      material.uniforms.uImage.value = texture;

      image.addEventListener("mouseenter", () => {
        gsap.to(material.uniforms.hoverState, {
          duration: 1,
          value: 1,
        });
      });

      image.addEventListener("mouseout", () => {
        gsap.to(material.uniforms.hoverState, {
          duration: 1,
          value: 0,
        });
      });

      let mesh = new THREE.Mesh(geometry, material);
      this.scene.add(mesh);

      return {
        image,
        mesh,
        top,
        left,
        width,
        height,
      };
    });
  }

  setPosition() {
    this.imageStore.forEach((o) => {
      o.mesh.position.y =
        this.currentScroll - o.top + this.height / 2 - o.height / 2;
      o.mesh.position.x = o.left - this.width / 2 + o.width / 2;
    });
  }

  setUpResize() {
    window.addEventListener("resize", this.resize);
  }

  resize = () => {
    this.height = this.container.offsetHeight;
    this.width = this.container.offsetWidth;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  };

  render() {
    this.time += 0.25;

    // Smooth scroll to avoid mesh lag on scroll
    // Keeping the scroll logic here means the meshes
    // and page scroll are rendered at the same requestAnimation frame
    this.scroll.render();
    this.currentScroll = this.scroll.scrollToRender;
    this.setPosition();
    // Interpolates between the scroll speed value of 0 and 1
    // this.scroll.speedTarget comes from the custom scroll library
    this.customPass.uniforms.scrollSpeed.value = this.scroll.speedTarget;
    // this.mesh.rotation.x = this.time / 2000;
    // this.mesh.rotation.y = this.time / 1000;
    this.materials.forEach((m) => {
      m.uniforms.time.value = this.time;
    });

    this.composer.render();
    // this.material.uniforms.time.value = this.time;
    //this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch({
  dom: document.querySelector("#container"),
});
