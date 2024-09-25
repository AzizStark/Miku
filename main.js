import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

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

// Create a geometry (cube)
// const geometry = new THREE.BoxGeometry();

// // Create a material and set its color
// const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

// Create a mesh (geometry + material)
// const cube = new THREE.Mesh(geometry, material);
// cube.castShadow = true; // Enable cube to cast shadows
// cube.position.x = -3;
// scene.add(cube);

// const cube2 = new THREE.Mesh(geometry, material);
// cube2.position.x = 5;
// cube2.castShadow = true;
// scene.add(cube2);

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

// const geometry2 = new THREE.OctahedronGeometry(1, 5);
// const material2 = new THREE.MeshStandardMaterial({
//   color: 0xffffff,
// });
// const circle = new THREE.Mesh(geometry2, material2);

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

// circle.castShadow = true;
// circle.position.x = 1.2;
// circle.position.y = 6;
// circle.position.z = 3;
// scene.add(circle);

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

// Load a GLB model
const loader = new FBXLoader();

let hatsuneModel = undefined;

// loader.load(
//   "./models/latest.fbx",
//   function (gltf) {
//     hatsuneModel = gltf;

//     hatsuneModel.traverse(function (node) {
//       if (node.isMesh) {
//         if (node.material) {
//           node.material.transparent = false;
//           node.material.opacity = 1;
//           node.material.depthWrite = true;
//         }
//       }
//     });

//     hatsuneModel.position.set(1, -2, 0); // Position the model near the cube
//     hatsuneModel.rotation.x = 0.6;
//     hatsuneModel.scale.set(2.7, 2.7, 2.7);
//     hatsuneModel.traverse(function (node) {
//       if (node.isMesh) {
//         node.castShadow = true;
//         node.receiveShadow = true;
//       }
//     });
//     scene.add(hatsuneModel);

//     // Load the FBX animation
//     loader.load("./models/Samba_Miku.fbx", function (anim) {
//       mixer = new THREE.AnimationMixer(hatsuneModel);
//       const action = mixer.clipAction(anim.animations[0]);
//       action.play();
//     });
//   },
//   undefined,
//   function (error) {
//     console.error(error);
//   }
// );

// loader.load(
//   "./models/boy_model.fbx",
//   function (gltf) {
//     hatsuneModel = gltf;

//     hatsuneModel.traverse(function (node) {
//       if (node.isMesh) {
//         if (node.material) {
//           node.material.transparent = false;
//           node.material.opacity = 1;
//           node.material.depthWrite = true;
//         }
//       }
//     });

//     hatsuneModel.position.set(1, -2, 0); // Position the model near the cube
//     hatsuneModel.rotation.x = 0.61;
//     hatsuneModel.scale.set(0.03, 0.03, 0.03);
//     hatsuneModel.traverse(function (node) {
//       if (node.isMesh) {
//         node.castShadow = true;
//         node.receiveShadow = true;
//       }
//     });
//     scene.add(hatsuneModel);

//     // Load the FBX animation
//     loader.load("./models/boy_model_animation.fbx", function (anim) {
//       mixer = new THREE.AnimationMixer(hatsuneModel);
//       const action = mixer.clipAction(anim.animations[0]);
//       action.play();
//     });
//   },
//   undefined,
//   function (error) {
//     console.error(error);
//   }
// );

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
    hatsuneModel.rotation.x = 0.55;
    hatsuneModel.scale.set(0.03, 0.03, 0.03);
    hatsuneModel.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    scene.add(hatsuneModel);

    // Load the FBX animation
    loader.load("./models/boy_model_2_animation.fbx", function (anim) {
      mixer = new THREE.AnimationMixer(hatsuneModel);
      const action = mixer.clipAction(anim.animations[0]);
      action.play();
    });
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

loader.load(
  "./models/acoustic.fbx",
  function (gltf) {
    const spekar = gltf;

    spekar.traverse(function (node) {
      if (node.isMesh) {
        if (node.material) {
          node.material.transparent = false;
          node.material.opacity = 1;
          node.material.depthWrite = true;
        }
      }
    });

    spekar.position.set(-4, 1.05, -2.2); // Position the model near the cube
    spekar.rotation.x = 0.56;
    spekar.scale.set(0.007, 0.007, 0.007);
    spekar.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    scene.add(spekar);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

loader.load(
  "./models/acoustic.fbx",
  function (gltf) {
    const spekar = gltf;

    spekar.traverse(function (node) {
      if (node.isMesh) {
        if (node.material) {
          node.material.transparent = false;
          node.material.opacity = 1;
          node.material.depthWrite = true;
        }
      }
    });

    spekar.position.set(6, 1.05, -2.2); // Position the model near the cube
    spekar.rotation.x = 0.56;
    spekar.scale.set(0.007, 0.007, 0.007);
    spekar.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    scene.add(spekar);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

setInterval(() => {
  if (colorChange[0] == 0xece144) {
    colorChange[0] = 0xffe1ff;
    colorChange[1] = 0xece144;
    pointLight3.color.setHex(0xff4466);
  } else {
    colorChange[0] = 0xece144;
    colorChange[1] = 0xffe1ff;
    pointLight3.color.setHex(0xffee00);
  }
  pointLight.color.setHex(colorChange[0]);
  pointLight2.color.setHex(colorChange[1]);
}, 1000);

// Animation loop
const clock = new THREE.Clock();
// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate the cube
  // cube.rotation.x += 0.01;
  // cube.rotation.z += 0.01;
  discoBall.rotation.x += 0.01;

  //hatsuneModel.rotation.y += 0.01;
  //cube.rotation.y += 0.01;
  //camera.rotation.x += 0.001;
  //camera.rotation.z += 0.001;

  // cube2.rotation.z += 0.01;

  // Update the animation mixer
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
