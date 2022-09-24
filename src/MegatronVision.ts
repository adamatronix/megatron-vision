import * as THREE from 'three';
import debounce from 'lodash.debounce';
import gsap from 'gsap';
import Stats from 'three/examples/jsm/libs/stats.module';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface LooseObject {
  [key: string]: any
}
class MegatronVision {
  options:LooseObject;
  container:HTMLDivElement;
  requestId:number;
  scene: THREE.Scene;
  controls: any;
  bounding: any;
  onResizeFunction: any;
  onScrollFunction: any;
  stats:Stats;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  video: HTMLVideoElement;
  cameraRotation: any;

  constructor(el: HTMLDivElement, options?: LooseObject) {
    this.container = el;
    this.options = {
      autoPlay: true,
      muted: true,
      stats: false,
      loop: false,
      orbit: false,
      endedCallback: ()=> {

      }
    }
    this.options = { ...this.options, ...options};
    this.stats = this.options.stats ? this.setupStats() : null;
    this.cameraRotation = {
      x: 0,
      y: 0
    }
   
    this.setupWorld();
    this.renderFrame();
    this.onScroll();

    this.onResizeFunction = debounce(this.onResize,600);
    window.addEventListener('resize', this.onResizeFunction);
    this.onScrollFunction = debounce(this.onScroll,600);
    window.addEventListener('scroll', this.onScrollFunction);
    this.container.addEventListener('mousemove', this.onMouseMove)
    this.container.addEventListener('fullscreenchange', this.onScroll);
    this.video = this.createVideo(this.options.src);
    this.video.addEventListener("loadedmetadata",this.setupVideo);
    this.video.addEventListener("ended",this.options.endedCallback);
    this.setupVideo = this.setupVideo.bind(this);
  }

  setupStats = () => {
    const stats = Stats();
    stats.setMode(0);

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0';
    stats.domElement.style.top = '0';
    this.container.appendChild(stats.domElement);

    return stats;
  }

  setupVideo = () => {
    let videoWidth = this.video.videoWidth;
    let videoHeight = this.video.videoHeight;
    let aspect = videoWidth / videoHeight;
    let texture = new THREE.VideoTexture( this.video );
    const material = new THREE.MeshLambertMaterial( { map:texture, side: THREE.BackSide } );
    const product = new THREE.BoxGeometry(  50*aspect, 50, 50* aspect );
    const productMesh = new THREE.Mesh(product, material);
    productMesh.scale.x = -1;
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

    this.renderer = new THREE.WebGLRenderer({ powerPreference: "high-performance", antialias: true, alpha: true});
    this.renderer.setClearColor( 0x000000, 0 );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.clear();
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( this.container.offsetWidth, this.container.offsetHeight );
    this.container.appendChild( this.renderer.domElement );

    //setup controls

    if(this.options.orbit) {
      this.controls = new OrbitControls( this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.minDistance = 0;
      this.controls.maxDistance = 75;
      this.controls.enablePan = false;
    }
    
  }

  renderFrame = () => {
    this.requestId = requestAnimationFrame(this.renderFrame);
    this.renderer.clear();

    if(this.options.orbit) {
      this.controls.update();
    }
    this.camera.rotation.set(this.cameraRotation.x, this.cameraRotation.y, 0)
    this.camera.updateProjectionMatrix();
    
    this.renderer.render( this.scene, this.camera );
    this.stats ? this.stats.update() : null;
  }

  createVideo = (source:string) => {
    var el = document.createElement("video");
    el.style.display = "none";
    el.crossOrigin = "anonymous";
    el.muted = this.options.muted;
    el.loop = this.options.loop;
    el.preload = "auto";
    el.src = source;
    return el;
  }

  onMouseMove = (e:any) => {
    const y = e.clientY - this.bounding.top;
    const x = e.clientX - this.bounding.left;
    const centerY = this.bounding.height / 2;
    const centerX = this.bounding.width / 2;

    const xDeg = (y - centerY) / centerY;
    const yDeg = (x - centerX) / centerX;

    gsap.to(this.cameraRotation, { x: (xDeg * -10) * Math.PI / 180, y: (yDeg * -10) * Math.PI / 180, duration: 1})
  }

  onResize = () => {
    if(this.renderer && this.camera) {
      const width = this.container.offsetWidth;
      const height = this.container.offsetHeight
      this.renderer.setSize( width, height );
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

    }
  }

  onScroll = () => {
    this.bounding = this.container.getBoundingClientRect()
  }

  destroy = () => {
    this.video.pause();
    cancelAnimationFrame(this.requestId);
    window.removeEventListener('resize', this.onResizeFunction);
    window.removeEventListener('scroll', this.onScrollFunction);
    this.container.removeEventListener('mousemove', this.onMouseMove);
    this.container.removeEventListener('fullscreenchange', this.onScroll);
    this.video.removeEventListener("loadedmetadata",this.setupVideo);
    this.video.removeEventListener("ended",this.options.endedCallback);
    this.video = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.container.innerHTML = '';
  }

}

export default MegatronVision