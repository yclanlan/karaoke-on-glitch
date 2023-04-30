			import * as THREE from 'three';

			// import Stats from 'three/addons/libs/stats.module.js';
			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
			import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
			import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
			import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

			THREE.ColorManagement.enabled = false; // TODO: Confirm correct color management.

			let camera;
      // stats;
			let composer, renderer, mixer, clock;

			const params = {
				exposure: 1.5,
				bloomStrength: 3,
				bloomThreshold: 0,
				bloomRadius: 0
			};

			init();

			function init() {

				// const container = document.getElementById( 'container' );

				// stats = new Stats();
				// container.appendChild( stats.dom );

				clock = new THREE.Clock();

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
				renderer.toneMapping = THREE.ReinhardToneMapping;
				document.body.appendChild( renderer.domElement );

				const scene = new THREE.Scene();

				camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 100 );
				camera.position.set( - 5, 2.5, - 3.5 );
				scene.add( camera );

				const controls = new OrbitControls( camera, renderer.domElement );
				controls.maxPolarAngle = Math.PI * 0.5;
				controls.minDistance = 1;
				controls.maxDistance = 10;

				scene.add( new THREE.AmbientLight( 0x404040 ) );

				const pointLight = new THREE.PointLight( 0xffffff, 1 );
        //add light to camera!
				camera.add( pointLight );

				const renderScene = new RenderPass( scene, camera );

				const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
				bloomPass.threshold = params.bloomThreshold;
				bloomPass.strength = params.bloomStrength;
				bloomPass.radius = params.bloomRadius;

				composer = new EffectComposer( renderer );
				composer.addPass( renderScene );
				composer.addPass( bloomPass );

				new GLTFLoader().load( './disco_ball/scene.gltf', function ( gltf ) {

					const model = gltf.scene;
					scene.add( model );
					mixer = new THREE.AnimationMixer( model );

					const clip = gltf.animations[ 0 ];
					mixer.clipAction( clip.optimize() ).play();
					animate();

				} );

				

				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {

				const width = window.innerWidth;
				const height = window.innerHeight;

				camera.aspect = width / height;
				camera.updateProjectionMatrix();

				renderer.setSize( width, height );
				composer.setSize( width, height );

			}

			function animate() {

				requestAnimationFrame( animate );

				const delta = clock.getDelta();

				mixer.update( delta );

				// stats.update();

				composer.render();

			}