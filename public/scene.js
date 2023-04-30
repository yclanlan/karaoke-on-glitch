import * as THREE from "three";
import { FirstPersonControls } from "./libraries/firstPersonControls.js";
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FlakesTexture } from 'three/addons/textures/FlakesTexture.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

THREE.ColorManagement.enabled = false; // TODO: Confirm correct color management.


export class MyScene {

  constructor() {

    this.avatars = {};
    // create a scene in which all other objects will exist
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2( 0xE9F1FF, 0.03 );

    // create a camera and position it in space
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    this.camera.position.y = 0;
    this.camera.position.z = 0; 
    this.camera.lookAt(-5, 0, 0);

    


    // the renderer will actually show the camera view within our <canvas>
    this.renderer = new THREE.WebGLRenderer({ antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.renderer.outpout(window.innerWidth, window.innerHeight);

    // this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    document.body.appendChild(this.renderer.domElement);

    // add shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    


    this.clock = new THREE.Clock();


    this.renderScene = new RenderPass( this.scene, this.camera );

				this.bloomPass = new UnrealBloomPass ( new THREE.Vector2( window.innerWidth, window.innerHeight ), 2.5, 0.4, 0.85 );
        //bloomStrength,bloomThreshold,bloomRadius

				this.composer = new EffectComposer( this.renderer );
				this.composer.addPass( this.renderScene );
				this.composer.addPass( this.bloomPass );

        // add orbit controls
         this.controls = new FirstPersonControls(
         this.scene,
         this.camera,
         this.renderer,
        //  this.composer
         );
 

    this.setupEnvironment();
    this.frameCount = 0;
    this.loop();

  }
  

  
  
  setupEnvironment() {

    this.scene.background = new THREE.Color(0xffffff);
    this.scene.add(new THREE.GridHelper(10, 10));

    // add a ground
    let groundGeo = new THREE.BoxGeometry(100, 0.1, 100);
    let groundMat = new THREE.MeshPhongMaterial({ color: 0x000000 });
    let ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    // this.scene.add(ground);

    let WallHeight=20;
    let WallWidth=80;
    let wallGeo1 = new THREE.BoxGeometry(0.1, WallHeight, WallWidth);
    let wallGeo2 = new THREE.BoxGeometry(0.1, WallHeight, WallWidth);
    let wallGeo3 = new THREE.BoxGeometry(0.1, WallHeight, WallWidth);
    let wallGeo4 = new THREE.BoxGeometry(0.1, WallHeight, WallWidth);

    let wallMat = new THREE.MeshPhongMaterial({ color: 0x000000 });

    let wall1 = new THREE.Mesh(wallGeo1, wallMat);
    let wall2 = new THREE.Mesh(wallGeo2, wallMat);
    let wall3 = new THREE.Mesh(wallGeo3, wallMat);
    let wall4 = new THREE.Mesh(wallGeo4, wallMat);

    wall1.position.x=WallWidth/2;
    wall2.position.z=WallWidth/2;
    wall3.position.x=-WallWidth/2;
    wall4.position.z=-WallWidth/2;

    wall1.position.y=WallHeight/2;
    wall2.position.y=WallHeight/2;
    wall3.position.y=WallHeight/2;
    wall4.position.y=WallHeight/2;

    wall2.rotation.y=Math.PI/2;
    wall4.rotation.y=-Math.PI/2;

    wall1.receiveShadow = true;
    wall2.receiveShadow = true;
    wall3.receiveShadow = true;
    wall4.receiveShadow = true;

    this.scene.add(wall1,wall2,wall3,wall4);

    this.texture = new THREE.CanvasTexture( new FlakesTexture());
    this.texture.wrapS= THREE.RepeatWrapping;
    this.texture.wrapT= THREE.RepeatWrapping;
    this.texture.repeat.x=10;
    this.texture.repeat.y=6;
  
    this.discoCenterGroup = new THREE.Group();
    this.discoCenterGroup.position.set(-15,2,0);

    this.loader = new GLTFLoader();
    this.loader.load( './disco_ball_animated/scene2.glb',
     ( object ) => {
      // console.log(object);
      let model= object.scene;

        let newMaterial= {
        clearcoat: 1.0,
        clearcoatRoughness:0,
        metalness:0.9,
        roughness:0.5,
        // flatShading:true,
        color:0x818181,
        emissive:0xffffff,
        emissiveIntensity:0.5,
        normalMap:this.texture,
        normalScale: new THREE.Vector2(0.05,0.05)

        };


      model.scale.set(0.01,0.01,0.01);
      model.position.set(0,0,0);

      model.traverse((o) => {
        if (o.isMesh) o.material = new THREE.MeshPhysicalMaterial(newMaterial);
      });
      
  
      // object.scene.material.emissive = new THREE.Color( 0x00ffff );
      this.discoCenterGroup.add(object.scene);
      this.scene.add(this.discoCenterGroup);

     
    });
    
    //add video
    // const group = new THREE.Group();
    // group.add( new Element( 'SJOz3qjfQXU', 0, 0, 240, 0 ) );
    // group.add( new Element( 'Y2-xZ-1HE-Q', 240, 0, 0, Math.PI / 2 ) );
    // group.add( new Element( 'IrydklNpcFI', 0, 0, - 240, Math.PI ) );
    // group.add( new Element( '9ubytEsCaS0', - 240, 0, 0, - Math.PI / 2 ) );
    // scene.add( group );
  
   
    // Block iframe events when dragging camera
  
    // const blocker = document.getElementById( 'blocker' );
    // blocker.style.display = 'none';
  
    // controls.addEventListener( 'start', function () {
    //   blocker.style.display = '';
    // } );
    // controls.addEventListener( 'end', function () {
    //   blocker.style.display = 'none';
    // } );


    //add a light
    let myColor = new THREE.Color(0xffffff);
    let ambientLight = new THREE.AmbientLight(myColor, 5);
    this.scene.add(ambientLight);

    // add a directional light
    let myDirectionalLight = new THREE.DirectionalLight(myColor, 10);
    myDirectionalLight.position.set(-15, 1, 0);
    myDirectionalLight.target = this.discoCenterGroup;
    myDirectionalLight.castShadow = true;
    this.scene.add(myDirectionalLight);

    let directionaLightHelper = new THREE.DirectionalLightHelper( myDirectionalLight, 5 );
    this.scene.add( directionaLightHelper );

    //add spot light
    let spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set( 0, 10, 0 ); 
    spotLight.target = this.discoCenterGroup;  
    spotLight.castShadow = true;
    
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    
    spotLight.shadow.camera.near = 50;
    spotLight.shadow.camera.far = 100;
    // spotLight.shadow.camera.aspect = 10;
    // spotLight.shadow.camera.fov = 10;
    
    this.scene.add( spotLight );

    let spotLightHelper = new THREE.SpotLightHelper( spotLight );
    this.scene.add( spotLightHelper );

 

  
  }
  //////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////
  // Peers 👫

  addPeerAvatar(id) {
    console.log("Adding peer avatar to 3D scene.");
    this.avatars[id] = {};
    let videoElement = document.getElementById(id + "_video");
    let videoTexture = new THREE.VideoTexture(videoElement);
    let videoMaterial = new THREE.MeshBasicMaterial({
      map: videoTexture,
      overdraw: true,
      side: THREE.DoubleSide,
    });

    let otherMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
    let head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), [
      otherMat,
      otherMat,
      otherMat,
      otherMat,
      otherMat,
      otherMat,
      // videoMaterial,
    ]);

    // set position of head before adding to parent object
    head.position.set(0, 0, 0);

    // https://threejs.org/docs/index.html#api/en/objects/Group
    var group = new THREE.Group();
    group.add(head);

    // add group to scene
    this.scene.add(group);
    this.avatars[id].group = group;

  }

  removePeerAvatar(id) {
    console.log("Removing peer avatar from 3D scene.");
    this.scene.remove(this.avatars[id].group);
    delete this.avatars[id];
  }

  updatePeerAvatars(peerInfoFromServer) {
    for (let id in peerInfoFromServer) {
      if (this.avatars[id]) {
        let pos = peerInfoFromServer[id].position;
        let rot = peerInfoFromServer[id].rotation;

        this.avatars[id].group.position.set(pos[0], pos[1], pos[2]);
        this.avatars[id].group.quaternion.set(rot[0], rot[1], rot[2], rot[3]);
      }
    }
  }

  updateClientVolumes() {
    for (let id in this.avatars) {
      let audioEl = document.getElementById(id + "_audio");
      if (audioEl && this.avatars[id].group) {
        let distSquared = this.camera.position.distanceToSquared(
          this.avatars[id].group.position
        );

        if (distSquared > 500) {
          audioEl.volume = 0;
        } else {
          // https://discourse.threejs.org/t/positionalaudio-setmediastreamsource-with-webrtc-question-not-hearing-any-sound/14301/29
          let volume = Math.min(1, 10 / distSquared);
          audioEl.volume = volume;
        }
      }
    }
  }

  //////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////
  // Interaction 🤾‍♀️

  getPlayerPosition() {
    return [
      [this.camera.position.x, this.camera.position.y, this.camera.position.z],
      [
        this.camera.quaternion._x,
        this.camera.quaternion._y,
        this.camera.quaternion._z,
        this.camera.quaternion._w,
      ],
    ];
  }

  //////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////
  // Rendering 🎥

  loop() {

    this.frameCount++;
    this.controls.update();
    this.discoCenterGroup.rotation.y = this.frameCount/5;
    // update client volumes every 25 frames
    if (this.frameCount % 25 === 0) {
      this.updateClientVolumes();
    }

    this.renderer.render(this.scene, this.camera);
    // console.log(this.camera.rotation);
    // this.renderer.render(this.renderScene, this.camera);
    // this.renderScene.update();
    requestAnimationFrame(() => this.loop());
    
    // this.composer.render();

  }
  
}