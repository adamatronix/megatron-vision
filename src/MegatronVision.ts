import * as THREE from 'three';

interface LooseObject {
  [key: string]: any
}
class MegatronVision {
  options:LooseObject;
  container:HTMLDivElement;
  requestId:number;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  constructor(el: HTMLDivElement, options?: LooseObject) {
    this.container = el;
    this.options = {}
    this.options = { ...this.options, ...options};

    this.setupWorld();
    this.renderFrame();

  }

  setupWorld = () => {
    this.scene = new THREE.Scene();

    const fov = 45;
    const aspect = this.container.offsetWidth / this.container.offsetHeight;  // the canvas default
    const near = 0.1;
    const far = 500;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(0, 100, 0);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
		this.camera.updateProjectionMatrix();

    const ambient = new THREE.AmbientLight( 0xcccccc );
	  this.scene.add( ambient );

    const light = new THREE.PointLight( 0xffffff, 0.2);
    light.castShadow = true;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 3000;
    light.shadow.mapSize.width = 2024;
    light.shadow.mapSize.height = 2024;
    // move the light back and up a bit
    light.position.set( -10, 20, -10 );
    this.scene.add(light);

    this.renderer = new THREE.WebGLRenderer({ antialias: true});
    this.renderer.setClearColor( 0x000000, 0 );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.clear();
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( this.container.offsetWidth, this.container.offsetHeight );
    this.container.appendChild( this.renderer.domElement );
  }

  renderFrame = () => {
    this.requestId = requestAnimationFrame(this.renderFrame);
    this.renderer.clear();
    this.renderer.render( this.scene, this.camera );
  }


}

export default MegatronVision