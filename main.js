import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import * as PoseFormat from "pose-format";
import { Buffer } from "buffer/";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let mixer;
let colorChange = [0xece144, 0xffe1ff];

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.2,
  100
);
camera.position.z = 16;
camera.position.y = -8;
camera.position.x = 1.1;
camera.rotation.x = 0.6;

// Create a renderer and attach it to the DOM
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable shadow mapping
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

camera.position.set(0, 20, 100);
controls.update();

// Create a plane to receive the shadow
const planeGeometry = new THREE.PlaneGeometry(500, 500);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x117c13 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -1;
plane.position.y = -2;
plane.receiveShadow = true; // Enable plane to receive shadows
scene.add(plane);

// Create a plane to receive the shadow
const planeGeometry2 = new THREE.PlaneGeometry(500, 500);
const planeMaterial2 = new THREE.MeshStandardMaterial({ color: 0x522a3a });
const plane2 = new THREE.Mesh(planeGeometry2, planeMaterial2);
plane2.position.z = -3;
plane2.receiveShadow = true; // Enable plane to receive shadows
scene.add(plane2);

// Add a directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 5, 20);
directionalLight.castShadow = true; // Enable light to cast shadows
scene.add(directionalLight);

// Add a hemisphere light
const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x444444, 1); // Sky color, ground color, intensity
hemisphereLight.position.set(220, 200, 110);
scene.add(hemisphereLight);

// Create a reflective sphere (disco ball)
const sphereGeometry = new THREE.OctahedronGeometry(1, 4, 10);
const sphereMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 0.9,
  roughness: 0.44,
  emissive: true,
  emissiveIntensity: 1,
  // envMap: environmentMap
});
const discoBall = new THREE.Mesh(sphereGeometry, sphereMaterial);
discoBall.position.set(1.2, 6, 3);
scene.add(discoBall);

//Add a point light at the position of the circle
const pointLight = new THREE.SpotLight(colorChange[0], 202, 50); // Color, intensity, distance
pointLight.position.set(8, 1, 1);
pointLight.castShadow = true; // Enable light to cast shadows
scene.add(pointLight);

// Add a point light at the position of the circle
const pointLight2 = new THREE.SpotLight(colorChange[1], 202, 50); // Color, intensity, distance
pointLight2.position.set(-6, 1, 1);
pointLight2.castShadow = true; // Enable light to cast shadows
scene.add(pointLight2);

// Add a point light at the position of the circle
const pointLight3 = new THREE.SpotLight(0xaaccff, 102, 111); // Color, intensity, distance
pointLight3.position.set(-0.6, 6, 6);
pointLight3.castShadow = true; // Enable light to cast shadows
scene.add(pointLight3);

// =====================================

// Load a GLB model
const loader = new FBXLoader();

let hatsuneModel = undefined;

const response = await fetch("./models/library.pose");

const buffer = Buffer.from(await response.arrayBuffer());

const poseData = await PoseFormat.Pose.from(buffer);

const frames = poseData.body.frames;
const fps = poseData.body.fps;
const frameCount = frames.length;
const times = [];

const components = poseData.header.components;

console.log(components);
const jointNames = [];

// Extract joint names
components.forEach((component) => {
  if (component.name != "FACE_LANDMARKS") {
    jointNames.push(...component.points);
  }
});

for (let i = 0; i < frameCount; i++) {
  times.push(i / fps);
}

console.log(frames[0].people, fps, frameCount, times, components);

const jointPositions = {};

for (let i = 0; i < components.length; i++) {
  const component = components[i];
  for (let j = 0; j < component.points.length; j++) {
    const jointName = component.points[j];
    jointPositions[jointName] = []; // Initialize as an empty array
  }
}

jointNames.forEach((jointName) => {
  jointPositions[jointName] = [];
});

for (let i = 0; i < frameCount; i++) {
  const frame = frames[i];
  const people = frame.people;

  if (people && people.length > 0) {
    const personData = people[0];

    components.forEach((component) => {
      const componentName = component.name;
      const landmarks = personData[componentName];

      if (landmarks) {
        component.points.forEach((jointName, jointIndex) => {
          const jointData = landmarks[jointIndex];

          if (jointData && jointData.C > 0) {
            let x = jointData.X;
            let y = jointData.Y;
            let z = jointData.Z;

            // Coordinate adjustments
            // Swap Y and Z axes and invert Z
            let tempY = y;
            y = z;
            z = -tempY;

            // Scaling
            const scaleFactor = 0.01; // Adjust based on your model
            x *= scaleFactor;
            y *= scaleFactor;
            z *= scaleFactor;

            // Store positions
            jointPositions[jointName].push(x, y, z);
          } else {
            // Handle missing data
            const lastIndex = jointPositions[jointName].length - 3;
            if (lastIndex >= 0) {
              jointPositions[jointName].push(
                jointPositions[jointName][lastIndex],
                jointPositions[jointName][lastIndex + 1],
                jointPositions[jointName][lastIndex + 2]
              );
            } else {
              jointPositions[jointName].push(0, 0, 0);
            }
          }
        });
      }
    });
  } else {
    // No people detected in frame
    jointNames.forEach((jointName) => {
      const lastIndex = jointPositions[jointName].length - 3;
      if (lastIndex >= 0) {
        jointPositions[jointName].push(
          jointPositions[jointName][lastIndex],
          jointPositions[jointName][lastIndex + 1],
          jointPositions[jointName][lastIndex + 2]
        );
      } else {
        jointPositions[jointName].push(0, 0, 0);
      }
    });
  }
}

const jointToBoneMap = {
  // Head and Neck
  // NOSE: "head",
  NECK: "CC_Base_NeckTwist02", // If NECK is available in your pose data

  // Shoulders
  LEFT_SHOULDER: "upperarm_twist_01_l",
  RIGHT_SHOULDER: "upperarm_twist_01_r",

  // Elbows
  LEFT_ELBOW: "lowerarm_l",
  RIGHT_ELBOW: "lowerarm_r",

  // Wrists
  WRIST: "hand",
  LEFT_WRIST: "hand_l",
  RIGHT_WRIST: "hand_r",

  // Spine
  PELVIS: "pelvis", // If PELVIS is available in your pose data
  // SPINE: "spine_01", // Map higher spine joints if available

  // Hips
  // LEFT_HIP: "thigh_l",
  // RIGHT_HIP: "thigh_r",

  // Knees
  // LEFT_KNEE: "calf_l",
  // RIGHT_KNEE: "calf_r",

  // Ankles
  // LEFT_ANKLE: "foot_l",
  // RIGHT_ANKLE: "fooINDEX
  // MIDDLE_FINGER_MCP: "middle_01_l",
  // MIDDLE_FINGER_PIP: "middle_02_l",
  // MIDDLE_FINGER_DIP: "middle_03_l",
  // // MIDDLE_FINGER_TIP: "middle_03_l",

  // INDEX_FINGER_MCP: "index_01_l",
  // INDEX_FINGER_PIP: "index_02_l",
  // INDEX_FINGER_DIP: "index_03_l",

  // RING_FINGER_MCP: "ring_01_l",
  // RING_FINGER_PIP: "ring_02_l",
  // RING_FINGER_DIP: "ring_03_l",

  WRIST: "hand",
  LEFT_WRIST: "hand_l",
  RIGHT_WRIST: "hand_r",

  // Add more mappings as necessary
};
const tracks = [];

console.log("Joint Name", jointPositions);

for (const jointName in jointPositions) {
  console.log("Joint Name", jointName);
  const positions = jointPositions[jointName];
  const boneName = jointToBoneMap[jointName] || jointName;
  const trackName = `${boneName}.position`;

  const positionTrack = new THREE.VectorKeyframeTrack(
    trackName,
    times,
    positions
  );
  tracks.push(positionTrack);
}

console.log(tracks);

const animationClip = new THREE.AnimationClip("PoseAnimation", -1, tracks);

loader.load(
  "./models/boy_model_2.fbx",
  function (gltf) {
    hatsuneModel = gltf;

    hatsuneModel.traverse(function (node) {
      if (node.isMesh) {
        if (node.material) {
          node.material.transparent = false;
          node.material.opacity = 1;
          node.material.depthWrite = true;
        }
      }
    });

    hatsuneModel.position.set(1, -2.01, 0); // Position the model near the cube
    // hatsuneModel.rotation.x = 0.55;
    hatsuneModel.scale.set(0.035, 0.035, 0.035);

    hatsuneModel.traverse(function (node) {
      if (node.isBone) {
        console.log(node.name);
      }
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    scene.add(hatsuneModel);

    const skeletonHelper = new THREE.SkeletonHelper(hatsuneModel);
    scene.add(skeletonHelper);

    mixer = new THREE.AnimationMixer(hatsuneModel);
    const action = mixer.clipAction(animationClip);
    action.play();
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// Animation loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  if (mixer) {
    mixer.update(clock.getDelta());
  }
  // Render the scene from the perspective of the camera
  renderer.render(scene, camera);
}

// Start the animation loop
animate();

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
