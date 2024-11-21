import * as PoseFormat from "pose-format";

// fetch the pose file
const response = await fetch("./models/output 2.pose");

//  load it in the buffer
const buffer = Buffer.from(await response.arrayBuffer());

// read from buffer
const poseData = await PoseFormat.Pose.from(buffer);

//components
const components = poseData.header.components;

console.log("POSE DATA:", poseData);
console.log("POSE DATA:", poseData.body.frames);
console.log("COMPONENTS DATA:", components);
