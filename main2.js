  // Set up Three.js scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);  // Set background color

  const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
  );
  camera.position.z = 3;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Resize handler
  window.addEventListener('resize', onWindowResize, false);
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // Add light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  // Create simple 3D character (stick figure)
  const joints = {};
  const bones = [];

  // Define body parts
  const jointNames = [
    'nose', 'leftEye', 'rightEye', 'leftEar', 'rightEar',
    'leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow',
    'leftWrist', 'rightWrist', 'leftHip', 'rightHip',
    'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'
  ];

  // Create joints as spheres
  const jointGeometry = new THREE.SphereGeometry(0.05, 8, 8);
  const jointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

  jointNames.forEach(name => {
    const joint = new THREE.Mesh(jointGeometry, jointMaterial);
    scene.add(joint);
    joints[name] = joint;
  });

  // Create bones as lines between joints
  const boneMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
  const bonePairs = [
    ['leftShoulder', 'upperarm_twist_01_l'],
    ['leftShoulder', 'leftElbow'],
    ['leftElbow', 'lowerarm_l'],
    ['rightShoulder', 'rightElbow'],
    ['rightElbow', 'rightWrist'],
    ['leftShoulder', 'leftHip'],
    ['rightShoulder', 'rightHip'],
    ['leftHip', 'rightHip'],
    ['leftHip', 'leftKnee'],
    ['leftKnee', 'leftAnkle'],
    ['rightHip', 'rightKnee'],
    ['rightKnee', 'rightAnkle']
  ];

  bonePairs.forEach(pair => {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(), new THREE.Vector3()
    ]);
    const bone = new THREE.Line(geometry, boneMaterial);
    scene.add(bone);
    bones.push({ bone, joints: pair });
  });

  // Webcam setup
  const video = document.getElementById('video');

  async function setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Webcam not available.');
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'user',
        width: 640,
        height: 480
      }
    });
    video.srcObject = stream;
    return new Promise(resolve => {
      video.onloadedmetadata = () => {
        video.play();
        resolve(video);
      };
    });
  }

  // Load PoseNet model
  let net;
  async function loadPoseNet() {
    net = await posenet.load();
  }

  // Main animation loop
  async function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);

    if (net && video.readyState === video.HAVE_ENOUGH_DATA) {
      const pose = await net.estimateSinglePose(video, {
        flipHorizontal: true
      });
      updateCharacterPose(pose);
    }
  }

  // Update character pose based on PoseNet keypoints
  function updateCharacterPose(pose) {
    const keypoints = pose.keypoints;

    // Map PoseNet keypoints to Three.js joints
    keypoints.forEach(kp => {
      if (kp.score > 0.5 && joints[kp.part]) {
        const { x, y } = kp.position;
        const scale = 0.007; // Adjust scale to fit the scene
        joints[kp.part].position.x = (x - video.width / 2) * scale;
        joints[kp.part].position.y = -(y - video.height / 2) * scale;
        joints[kp.part].visible = true;
      } else if (joints[kp.part]) {
        joints[kp.part].visible = false;
      }
    });

    // Update bones positions
    bones.forEach(({ bone, joints: [jointA, jointB] }) => {
      const posA = joints[jointA].position;
      const posB = joints[jointB].position;

      if (joints[jointA].visible && joints[jointB].visible) {
        const positions = bone.geometry.attributes.position.array;
        positions[0] = posA.x;
        positions[1] = posA.y;
        positions[2] = posA.z;
        positions[3] = posB.x;
        positions[4] = posB.y;
        positions[5] = posB.z;
        bone.geometry.attributes.position.needsUpdate = true;
        bone.visible = true;
      } else {
        bone.visible = false;
      }
    });
  }

  // Start the application
  async function main() {
    await setupCamera();
    await loadPoseNet();
    animate();
  }
  main();