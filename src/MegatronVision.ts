import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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
  video: HTMLVideoElement;

  constructor(el: HTMLDivElement, options?: LooseObject) {
    this.container = el;
    this.options = {
      autoPlay: true,
      muted: true,
      loop: false,
      endedCallback: ()=> {

      }
    }
    this.options = { ...this.options, ...options};

   
    this.setupWorld();
    this.renderFrame();

    this.video = this.createVideo(this.options.src);
    this.video.addEventListener("loadedmetadata",this.setupVideo);
    this.video.addEventListener("ended",this.options.endedCallback);
    this.setupVideo = this.setupVideo.bind(this);
  }

  setupVideo = () => {
    let videoWidth = this.video.videoWidth;
    let videoHeight = this.video.videoHeight;
    let aspect = videoWidth / videoHeight;

    let texture = new THREE.VideoTexture( this.video );
    const material = new THREE.MeshLambertMaterial( { map:texture, side: THREE.BackSide } );
    const product = new THREE.BoxGeometry(  50*aspect, 50, 50* aspect );
    const productMesh = new THREE.Mesh(product, material);
    this.scene.add(productMesh);

    if(this.options.autoPlay) {
      this.video.play();
    }
  
  }

  setupWorld = () => {
    this.scene = new THREE.Scene();

    const fov = 45;
    const aspect = this.container.offsetWidth / this.container.offsetHeight;  // the canvas default
    const near = 0.1;
    const far = 500;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(0, 0, 50);
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

    //setup controls
    let controls = new OrbitControls( this.camera, this.renderer.domElement);
    controls.minDistance = 0;
    controls.maxDistance = 500;
  }

  renderFrame = () => {
    this.requestId = requestAnimationFrame(this.renderFrame);
    this.renderer.clear();
    this.renderer.render( this.scene, this.camera );
  }

  createVideo = (source:string) => {
    var el = document.createElement("video");
    el.style.display = "none";
    el.crossOrigin = "anonymous";
    el.muted = this.options.muted;
    el.loop = this.options.loop;
    el.src = source;
    return el;
  }

  destroy = () => {
    cancelAnimationFrame(this.requestId);
    this.video.removeEventListener("loadedmetadata",this.setupVideo);
    this.video.removeEventListener("ended",this.options.endedCallback);
    this.video = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.container = null;
  }

}

export default MegatronVision