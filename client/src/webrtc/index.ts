import {RTCConnection} from "./connection";

async function connectTo(username: string) {
  console.log("Inviting user " + username);

  const connection = new RTCConnection(username);

  // Get access to the webcam stream and attach it to the
  // "preview" box (id "local_video").
  let stream: MediaStream;

  try {
    stream = await navigator.mediaDevices.getUserMedia({audio: true});
    // document.getElementById("local_video").srcObject = webcamStream;
  } catch (err) {
    console.error(err as Error);
    return;
  }

  connection.attach(stream);
}
