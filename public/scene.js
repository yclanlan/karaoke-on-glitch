import * as THREE from "three";
import { FirstPersonControls } from "./libraries/firstPersonControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FlakesTexture } from 'three/addons/textures/FlakesTexture.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';


THREE.ColorManagement.enabled = false;

export class MyScene {

  constructor() {

    this.avatars = {};
    this.gui = new GUI();
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2( 0x64B4FD, 0.005 );
    this.cssScene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.lookAt(-5 ,0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.shadowMap.type = THREE.VSMShadowMap; 

    // orginal version
    document.body.appendChild( this.renderer.domElement);

    this.controls = new FirstPersonControls(
    this.scene,
    this.camera,
    this.renderer,
    );        

    this.renderScene = new RenderPass( this.scene, this.camera );

    this.params = {
      exposure: 0.5,
      bloomStrength: 2,
      bloomThreshold: 0,
      bloomRadius: 0,
      scene: 'Scene with Glow',
    },
        //////////////////////////////////////////
				this.bloomPass = new UnrealBloomPass ( 
          new THREE.Vector2( window.innerWidth, window.innerHeight ), 
          0, //bloomStrength
          0, //bloomThreshold
          0  //bloomRadius
          );
        this.bloomPass.strength = this.params.bloomStrength;
        this.bloomPass.threshold = this.params.bloomThreshold;
				this.bloomPass.radius = this.params.bloomRadius;
        // this.bloomPass.exposure = this.params.exposure;

				this.bloomComposer = new EffectComposer( this.renderer );
				this.bloomComposer.addPass( this.renderScene );
				this.bloomComposer.addPass( this.bloomPass )

    this.setupEnvironment();
    this.frameCount = 0;
    this.loop();

    window.addEventListener('resize', ()=> {this.onWindowResize()}, false );
    // window.addEventListener('resize', this.onWindowResize, false );
    // window.addEventListener('resize', function(){console.log(this)}, false );
    // window.addEventListener('resize', ()=>{console.log(this)}, false );

    this.videoCollection=[
      './500.mp4',
      './Jay.mp4',
      './Adele.mp4',
      './blackpink.mp4',
      './sodagreen.mp4'
    ]

    //Create your video texture:
    this.video = document.getElementById('video');
    this.video.src= this.videoCollection[0];

    this.video.play();
      this.video.volume=0.1;
      // this.video.pause();

      this.videoTexture = new THREE.VideoTexture(this.video);
      this.videoTexture.needsUpdate = true;
      this.videoMaterial = new THREE.MeshStandardMaterial( {

        map: this.videoTexture, 
        overdraw: true,
        side: THREE.DoubleSide, 
        toneMapped: false,
        
      } );
      this.videoMaterial.needsUpdate = true;

  }
  
  setupEnvironment() {

    ////////////////// ground //////////////////
    
    this.loader3 = new GLTFLoader();
    this.loader3.load( './sceneObject/carpet.glb',
      ( object ) => {
      
      let model= object.scene;

      model.scale.set(0.1,0.1,0.1);
      model.position.set(0,15,0);
      model.castShadow=true;
      model.receiveShadow = true;
      
      this.scene.add(model)});



    ////////////////// axesHelper //////////////////

    const axesHelper = new THREE.AxesHelper( 10 );
    axesHelper.setColors(0xffffff,0x00FFFF,0xFF00000);
    // this.scene.add(axesHelper);
    // X:white ,Y:blue, Z:red



    ////////////////// DiscoBall //////////////////

    this.discoCenterGroup = new THREE.Group();
    this.discoCenterGroup.position.set(-5,4,0);

    this.loader = new GLTFLoader();
    this.loader.load( './sceneObject/disco_ball_animated/scene2.glb',

     ( object ) => {
      // console.log(object);
      let model= object.scene;

      model.scale.set(0.03,0.03,0.03);
      model.position.set(0,0,0);
      model.receiveShadow = true;
      model.casteShadow = true;

      this.texture = new THREE.CanvasTexture( new FlakesTexture());
      this.texture.wrapS= THREE.RepeatWrapping;
      this.texture.wrapT= THREE.RepeatWrapping;
      this.texture.repeat.x=10;
      this.texture.repeat.y=6;

      let newMaterial= {
        clearcoat: 1.0,
        clearcoatRoughness:0,
        metalness:0.7,
        roughness:0.5,
        flatShading:true,
        color:0x818181,
        // emissive:0xffffff,
        // emissiveIntensity:0,
        normalMap:this.texture,
        normalScale: new THREE.Vector2(0.05,0.05)

        };

      model.traverse((o) => {
        if (o.isMesh) o.material = new THREE.MeshPhysicalMaterial(newMaterial);
      });
      
      this.discoCenterGroup.add(object.scene);
      this.scene.add(this.discoCenterGroup);
    });


    ////////////////// furniture //////////////////

    this.furnitureCenterGroup = new THREE.Group();
    this.furnitureCenterGroup.position.set(0,2.3,-3);

    this.loader2 = new GLTFLoader();
    this.loader2.load( './sceneObject/room_furnishings/ktv.glb',
     ( object ) => {
      
      let model= object.scene;

      model.scale.set(0.02,0.03,0.02);
      model.position.set(0,0,0);
      model.castShadow=true;
      model.receiveShadow = true;

      this.furnitureCenterGroup.add(object.scene);
      this.scene.add(this.furnitureCenterGroup);



      ////////////////// background //////////////////

      this.backgroundSceneGroup= new THREE.Group();
      this.backgroundSceneTexture = new THREE.TextureLoader().load( "./karaoke.jpg" );
      this.backgroundSceneMaterial = new THREE.MeshStandardMaterial( {
        map: this.backgroundSceneTexture,         
        side: THREE.DoubleSide, 
      } );

      this.backgroundSceneGeo=new THREE.SphereGeometry(20,30,30);
      this.backgroundSceneMesh= new THREE.Mesh(this.backgroundSceneGeo,this.backgroundSceneMaterial);
      this.backgroundSceneMesh.position.set(0,4.5,0);
      this.backgroundSceneGroup.add(this.backgroundSceneMesh);
      this.backgroundSceneGroup.rotation.y=0.45*Math.PI;
      this.scene.add(this.backgroundSceneGroup);
      console.log(this.backgroundSceneGroup);


      ////////////////// ball //////////////////
      let spheregeometry = new THREE.IcosahedronGeometry( 0.5, 5 );

      for ( let i = 0; i < 100; i ++ ) {
        let color = new THREE.Color();
        color.setHSL( Math.random(), 0.7, Math.random() * 0.2 + 0.05 );

        let spherematerial = new THREE.MeshBasicMaterial( { color: color } );
        let sphere = new THREE.Mesh( spheregeometry, spherematerial );

        sphere.position.x = (Math.random()-0.5) * 8 ;
        sphere.position.y = (Math.random()-0.0) * 10 ;
        sphere.position.z = (Math.random()-0.5) * 8 ;
        // X:white ,Y:blue, Z:red
        sphere.position.normalize().multiplyScalar( Math.random() * 30.0 + 2.0 );
        sphere.scale.setScalar( Math.random()  - 0.5 );

        // sphere.receiveShadow = true;
        // sphere.casteShadow = true;
        this.scene.add( sphere );

      }


      // Create screen
      this.screen = new THREE.PlaneGeometry(4*3.5, 3*3.5);
      this.videoScreen = new THREE.Mesh(this.screen, this.videoMaterial);
      this.videoScreen.rotation.y= Math.PI/2;
      this.videoScreen.position.x=-15.5;
      this.videoScreen.position.y=3;
      this.scene.add(this.videoScreen); 

      this.screenBox=new THREE.BoxGeometry(4*3.5+0.5, 3*3.5+0.5,1);
      this.screenBoxMesh=new THREE.Mesh(this.screenBox,new THREE.MeshStandardMaterial({color:0x000000}) );
      this.screenBoxMesh.rotation.y=Math.PI/2;
      this.screenBoxMesh.position.set(-16.5,3,0);
      this.scene.add(this.screenBoxMesh); 


      this.stageGeo=new THREE.BoxGeometry(4*3.5+0.5, 3*3.5+0.5,1);
      this.stageMesh=new THREE.Mesh(this.stageGeo,new THREE.MeshStandardMaterial({color:0x000000}) )
      this.stageMesh.rotation.x=Math.PI/2;
      this.stageMesh.rotation.z=Math.PI/2;
      this.stageMesh.position.set(-16.5,-3,0);
      this.scene.add(this.stageMesh); 


      
      this.gui.add(this.video,'volume',0,1,0.01).name('volume');      
      this.gui.add(
        {currentSong:''},'currentSong',
        [ "500","jay","Adele","blackpink","sodagreen"]).setValue(" Change Song ").name('track').onChange((e)=>{
        console.log("e="+e);
        this.video.src = './' + e + '.mp4';
        document.getElementById("video").play();
        // mySocket.emit("playSong", e + '.mp4');
        // console.log(this.gui.children[0]);
        
        console.log(this.gui.children[1].object);
      })

      // this.gui.onChange( function(value ){
      //   var value = this.video.src;
      //   console.log(value);
      //   if (value == "500"){
      //     this.video.src=this.videoCollection[0];
      //     this.video.play();
      //   }

      //   else if(value=="sodagreen"){
      //     this.video.src=this.videoCollection[1]
      //     this.video.play();

      //   }
      // });

     
    });

      




    ////////////////// light //////////////////
   
    // this.ambientLight = new THREE.AmbientLight(0x818181);
    // this.scene.add(this.ambientLight);
    // this.scene.add( new THREE.AmbientLight( 0x404040 ) );

    // this.pointLight = new THREE.PointLight( 0xffffff, 1 );
    // this.camera.add( this.pointLight );

    // pink
    this.myDirectionalLight1 = new THREE.DirectionalLight(0xFF37C4, 0.5);
    this.myDirectionalLight1.position.set(-15, 1, 0);
    this.myDirectionalLight1.target = this.discoCenterGroup;
    this.myDirectionalLight1.receiveShadow = true;
    this.myDirectionalLight1.castShadow = true;
    this.scene.add(this.myDirectionalLight1);
    this.helper1 = new THREE.DirectionalLightHelper( this.myDirectionalLight1, 5 );
    // this.scene.add( this.helper1 );

    //yellow
    this.myDirectionalLight2 = new THREE.DirectionalLight(0xFF9D40, 0.5);
    this.myDirectionalLight2.position.set(-20, 0, 15);
    this.myDirectionalLight2.target = this.discoCenterGroup;
    this.myDirectionalLight2.receiveShadow = true;
    this.myDirectionalLight2.castShadow = true;
    this.scene.add(this.myDirectionalLight2);
    this.helper2 = new THREE.DirectionalLightHelper( this.myDirectionalLight2, 5 );
    // this.scene.add( this.helper2 );

    // blue
    this.myDirectionalLight3 = new THREE.DirectionalLight(0x2810FF, 0.5);
    this.myDirectionalLight3.position.set(-20, 20, 10);
    this.myDirectionalLight3.target = this.discoCenterGroup;
    this.myDirectionalLight3.receiveShadow = true;
    this.myDirectionalLight3.castShadow = true;
    this.scene.add(this.myDirectionalLight3);
    this.helper3 = new THREE.DirectionalLightHelper( this.myDirectionalLight3, 5 );
    // this.scene.add( this.helper3 );

    //white
    this.myDirectionalLight4 = new THREE.DirectionalLight(0xffffff, 0.25);
    this.myDirectionalLight4.position.set(0, 0, 0);
    this.myDirectionalLight4.target = this.discoCenterGroup;
    this.myDirectionalLight4.receiveShadow = true;
    this.myDirectionalLight4.castShadow = true;
    this.scene.add(this.myDirectionalLight4);


    //add spot light
    // let spotLight1 = new THREE.SpotLight({
    // color:0xFFCA00,
    // intensity: 1.2,
    // });
  
    // spotLight1.position.set( -7, 3, 0); 
    // spotLight1.target = this.furnitureCenterGroup; 
    // this.scene.add( spotLight1 );
  
    // let spotLightHelper = new THREE.SpotLightHelper( spotLight1 );
    // this.scene.add( spotLightHelper );
  
  }


  //////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////

  // Peers 👫

  addPeerAvatar(id) {
    console.log("Adding peer avatar to 3D scene.");
    this.avatars[id] = {};


    let otherMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
    let head = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.5), 
    [
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

  onWindowResize() {
    console.log(this);
    console.log(this.camera);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    
    this.camera.updateProjectionMatrix();
  
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  
    };



  //////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////
  // Rendering 🎥

  loop() {

    this.frameCount++;
    this.controls.update();

    this.discoCenterGroup.rotation.y = this.frameCount/2;
    // update client volumes every 25 frames
    if (this.frameCount % 25 === 0) {
      this.updateClientVolumes();

      this.myDirectionalLight1.intensity = 1*Math.random();
      this.myDirectionalLight2.intensity = 1*Math.random();
      this.myDirectionalLight3.intensity = 1*Math.random();
    }

    this.myDirectionalLight1.position.z=20*Math.sin(this.frameCount/40);
    this.myDirectionalLight2.position.z=20+20*Math.sin(this.frameCount/20);
    this.myDirectionalLight3.position.x=-20+10*Math.sin(this.frameCount/20);
    
    // this.backgroundSceneGroup.rotation.y = this.frameCount/2;
    // this.myDirectionalLight4.intensity = Math.random();
  
    this.movingdistance = 9;

  if(this.camera.position.x > this.movingdistance ){
    this.camera.position.x = this.movingdistance ;
  }
  
  if(this.camera.position.x < -this.movingdistance){
    this.camera.position.x = -this.movingdistance ;
  }
  
  if(this.camera.position.z > this.movingdistance ){
    this.camera.position.z = this.movingdistance ;
  }
  
  if(this.camera.position.z < -this.movingdistance){
    this.camera.position.z = -this.movingdistance;
  }

    this.bloomComposer.render();
    requestAnimationFrame(() => this.loop());
    

  }


  
}