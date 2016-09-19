/// <reference path="../../typings/index.d.ts" />

import { Preprocessor } from './preprocessor';
import { ExtendedMesh } from './interfaces';
import { Building, District } from './blocks';
import { stats } from "./stats";

export class SceneManager {
  static objects: ExtendedMesh[] = [];
  static scene: THREE.Scene = new THREE.Scene();
  static preprocessor: Preprocessor;

  static raycaster = new THREE.Raycaster();
  static renderer: THREE.WebGLRenderer;
  static camera: THREE.PerspectiveCamera;
  static controls: THREE.OrbitControls;

  static intersectedBlock: ExtendedMesh;

  static cleanUp() {
    for (let obj of this.objects) {
      SceneManager.scene.remove(obj);
      SceneManager.scene.remove(obj.edges);

      obj.edges.geometry.dispose();
      obj.edges.material.dispose();

      obj.geometry.dispose();
      obj.material.dispose();
    }

    SceneManager.objects = [];
  }

  static initialize() {
    SceneManager.init();
    SceneManager.animate();
  }

  static init() {
    // create the scene and set the scene size
    let width = window.innerWidth;
    let height = window.innerHeight;

    // create a renderer and add it to the DOM
    SceneManager.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: <HTMLCanvasElement>document.getElementById('canvas') });
    SceneManager.renderer.setClearColor(0xcccccc, 1);
    SceneManager.renderer.setSize(width, height);
    SceneManager.renderer.domElement.addEventListener('mousemove', SceneManager.onDocumentMouseMove, false);
    document.body.appendChild(SceneManager.renderer.domElement);

    // create a camera, zoom it out from the model a bit, and add it to the scene.
    SceneManager.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000000);
    SceneManager.camera.position.set(70, 70, 150);
    SceneManager.scene.add(SceneManager.camera);

    // add light
    SceneManager.scene.add(new THREE.AmbientLight(0xcccccc));

    // create an event listener that resizes the renderer with the browser window.
    window.addEventListener('resize', () => {
      let width = window.innerWidth;
      let height = window.innerHeight;

      SceneManager.renderer.setSize(width, height);
      SceneManager.camera.aspect = width / height;
      SceneManager.camera.updateProjectionMatrix();
    });

    // Add OrbitControls so that we can pan around with the mouse.
    SceneManager.controls = new THREE.OrbitControls(SceneManager.camera, SceneManager.renderer.domElement);
  }

  // Renders the scene and updates the render as needed.
  static animate() {
    requestAnimationFrame(SceneManager.animate);

    SceneManager.renderer.render(SceneManager.scene, SceneManager.camera);
    SceneManager.controls.update();
    stats.update();
  }

  static determineVisibility(mesh: ExtendedMesh, building: Building, val: string) {
    switch (val) {
      case 'all':
        mesh.visible = mesh.edges.visible = true;
        break;
      case 'abstract':
        mesh.visible = mesh.edges.visible = building.data.abstract;
        break;
      case 'final':
        mesh.visible = mesh.edges.visible = building.data.final;
        break;
      case 'interface':
        mesh.visible = mesh.edges.visible = building.data.type === 'interface';
        break;
      case 'trait':
        mesh.visible = mesh.edges.visible = building.data.trait;
        break;
    }
  }

  static onDocumentMouseMove(event: MouseEvent) {
    event.preventDefault();

    let intersectColor = 0x00D66B;
    let coords = {
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: - (event.clientY / window.innerHeight) * 2 + 1
    };

    SceneManager.raycaster.setFromCamera(coords, SceneManager.camera);

    let intersections: THREE.Intersection[] = SceneManager.raycaster.intersectObjects(SceneManager.objects);
    let tracker = $('#tracker');

    if (intersections.length > 0) {
      if (SceneManager.intersectedBlock != intersections[0].object) {
        if (SceneManager.intersectedBlock) SceneManager.intersectedBlock.material.color.setHex(SceneManager.intersectedBlock.material.defaultColor);

        SceneManager.intersectedBlock = <ExtendedMesh>intersections[0].object;
        SceneManager.intersectedBlock.material.color.setHex(intersectColor);

        tracker.html(SceneManager.intersectedBlock.block.getTrackerText());
      }

      tracker.css({ top: `${event.clientY + 10}px`, left: `${event.clientX + 10}px`, display: 'block' });

      document.body.style.cursor = 'pointer';
    } else if (SceneManager.intersectedBlock) {
      SceneManager.intersectedBlock.material.color.setHex(SceneManager.intersectedBlock.material.defaultColor);
      SceneManager.intersectedBlock = null;

      tracker.css('display', 'none');

      document.body.style.cursor = 'auto';
    }
  }
}