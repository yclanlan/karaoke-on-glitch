/*
This example sets up a simple three.js scene which connects to a websocket server.

*/
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let scene, camera, renderer;

let ground;
let mouse;
let socket; // create a global socket object

let pointerDown = false; // keep track of whether the mouse pointer is down
let shiftDown = false;

let controls;

function init() {
  // create a scene in which all other objects will exist
  scene = new THREE.Scene();

  // create a camera and position it in space
  let aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
  camera.position.z = 5; // place the camera in space
  camera.position.y = 5;
  camera.lookAt(0, 0, 0);

  // the renderer will actually show the camera view within our <canvas>
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // add shadows
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

  let groundGeo = new THREE.BoxGeometry(10, 1, 10);
  let groundMat = new THREE.MeshPhongMaterial({ color: "yellow" });
  ground = new THREE.Mesh(groundGeo, groundMat);
  scene.add(ground);
  ground.receiveShadow = true;

  // add orbit controls
  controls = new OrbitControls(camera, renderer.domElement);

  setupEnvironment();
  establishWebsocketConnection();
  setupRaycastInteraction();

  loop();
}

function establishWebsocketConnection() {
  socket = io();

  socket.on("msg", (msg) => {
    console.log(
      "Got a message from friend with ID ",
      msg.from,
      "and data:",
      msg.data
    );
    addOtherPersonsDrawing(msg.data.x, msg.data.y, msg.data.z);
  });
}

// we'll reuse the geometry and material, so make them global
let geo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
let mat = new THREE.MeshPhongMaterial({ color: "blue" });
function addOtherPersonsDrawing(x, y, z) {
  let mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
}

// set up the raycaster and keyboard controls
function setupRaycastInteraction() {
  mouse = new THREE.Vector2(0, 0);

  // create a geometry and material which we'll reuse for each newly created mesh
  let geo = new THREE.IcosahedronGeometry(0.25, 0);
  let mat = new THREE.MeshPhongMaterial({ color: "red" });

  document.addEventListener(
    "pointermove",
    (ev) => {
      // three.js expects 'normalized device coordinates' (i.e. between -1 and 1 on both axes)
      mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;

      if (pointerDown && shiftDown) {
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObject(ground);

        if (intersects.length) {
          let point = intersects[0].point;
          console.log(point);
          socket.emit("msg", point);

          // add our own
          let mesh = new THREE.Mesh(geo, mat);
          scene.add(mesh);
          mesh.position.set(point.x, point.y, point.z);
          mesh.castShadow = true;
        }
      }
    },
    false
  );

  let raycaster = new THREE.Raycaster();
  document.addEventListener("pointerdown", (ev) => {
    pointerDown = true;
  });
  document.addEventListener("pointerup", (ev) => {
    pointerDown = false;
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key == "Shift") {
      shiftDown = true;
      controls.enabled = false;
    }
  });
  document.addEventListener("keyup", (ev) => {
    if (ev.key == "Shift") {
      shiftDown = false;
      controls.enabled = true;
    }
  });
}

function setupEnvironment() {
  //add a light
  let myColor = new THREE.Color(0xffaabb);
  let ambientLight = new THREE.AmbientLight(myColor, 0.5);
  scene.add(ambientLight);

  // add a directional light
  let myDirectionalLight = new THREE.DirectionalLight(myColor, 0.85);
  myDirectionalLight.position.set(-5, 3, -5);
  myDirectionalLight.lookAt(0, 0, 0);
  scene.add(myDirectionalLight);
  myDirectionalLight.castShadow = true;

  // add a background image
  const urls = [
    "https://cdn.glitch.global/91a61221-6cce-42c2-b580-f4b04e3ad87a/px.png?v=1682288791769",
    "https://cdn.glitch.global/91a61221-6cce-42c2-b580-f4b04e3ad87a/nx.png?v=1682288790985",
    "https://cdn.glitch.global/91a61221-6cce-42c2-b580-f4b04e3ad87a/py.png?v=1682288790299",
    "https://cdn.glitch.global/91a61221-6cce-42c2-b580-f4b04e3ad87a/ny.png?v=1682288789340",
    "https://cdn.glitch.global/91a61221-6cce-42c2-b580-f4b04e3ad87a/pz.png?v=1682288788572",
    "https://cdn.glitch.global/91a61221-6cce-42c2-b580-f4b04e3ad87a/nz.png?v=1682288787827",
  ];

  const textureCube = new THREE.CubeTextureLoader().load(urls);
  scene.background = textureCube;
}

function loop() {
  renderer.render(scene, camera);
  window.requestAnimationFrame(loop);
}

init();
