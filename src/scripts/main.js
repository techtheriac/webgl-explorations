import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import fragment from "../shaders/fragment.glsl";
import vertex from "../shaders/vertex.glsl";

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
      0.01,
      10
    );
    this.camera.position.z = 1;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.resize();
    this.setUpResize();
    this.addObjects();
    this.render();
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
    console.log("resizing");
  };

  addObjects() {
    this.geometry = new THREE.PlaneBufferGeometry(0.5, 0.5, 50, 50);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
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
    this.time += 0.5;
    this.mesh.rotation.x = this.time / 2000;
    this.mesh.rotation.y = this.time / 1000;

    this.material.uniforms.time.value = this.time;

    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch({
  dom: document.querySelector("#container"),
});
