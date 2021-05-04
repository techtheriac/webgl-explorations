import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import imagesLoaded from "imagesloaded";
import FontFaceObserver from "fontfaceobserver";
import fragment from "../shaders/fragment.glsl";
import vertex from "../shaders/vertex.glsl";

import cityScape from "../images/city_scape.jpg";
import { MeshBasicMaterial } from "three";

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

    // All promises
    const allDone = [fontOpen, fontPlayfair, preloadImage];

    Promise.all(allDone).then(() => {
      this.addImages();
      this.setPosition();
      this.resize();
      this.setUpResize();
      this.addObjects();
      this.render();
    });

    this.images = [...document.querySelectorAll("img")];
  }

  addImages() {
    this.imageStore = this.images.map((image) => {
      let { top, left, width, height } = image.getBoundingClientRect();

      let geometry = new THREE.PlaneBufferGeometry(width, height, 1, 1);
      let material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
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

    //console.log(this.imageStore);
  }

  setPosition() {
    this.imageStore.forEach((o) => {
      o.mesh.position.y = -o.top + this.height / 2 - o.height / 2;
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

  addObjects() {
    this.geometry = new THREE.PlaneBufferGeometry(200, 400, 10, 10);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        cityScapeTexture: { value: new THREE.TextureLoader().load(cityScape) },
      },
      side: THREE.DoubleSide,
      fragmentShader: fragment,
      vertexShader: vertex,

      wireframe: true,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  render() {
    this.time += 0.25;
    // this.mesh.rotation.x = this.time / 2000;
    // this.mesh.rotation.y = this.time / 1000;

    this.material.uniforms.time.value = this.time;

    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch({
  dom: document.querySelector("#container"),
});
