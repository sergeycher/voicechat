export class RTCConnection {
  get hostname(): string {
    return window.location.hostname || 'localhost';
  }

  myUsername = '';
  connection!: RTCPeerConnection;

  constructor(private targetUsername: string) {
    // Create an RTCPeerConnection which knows to use our chosen
    // STUN server.

    const connection = new RTCPeerConnection({
      iceServers: [     // Information about ICE servers - Use your own!
        {
          urls: "turn:" + this.hostname,  // A TURN server
          username: "webrtc",
          credential: "turnserver"
        }
      ]
    });


    // Set up event handlers for the ICE negotiation process.

    connection.onicecandidate = this.handleICECandidateEvent;
    connection.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent;
    connection.onicegatheringstatechange = this.handleICEGatheringStateChangeEvent;
    connection.onsignalingstatechange = this.handleSignalingStateChangeEvent;
    connection.onnegotiationneeded = this.handleNegotiationNeededEvent;
    connection.ontrack = this.handleTrackEvent;

    this.connection = connection;
  }

  attach(stream: MediaStream) {
    // Add the tracks from the stream to the RTCPeerConnection
    try {
      stream.getTracks().forEach(
        track => this.connection.addTransceiver(track, {streams: [stream]})
      );
    } catch (err) {
      console.error(err as Error);
    }
  }

// Handles |icecandidate| events by forwarding the specified
// ICE candidate (created by our local ICE agent) to the other
// peer through the signaling server.
  private handleICECandidateEvent(event: RTCPeerConnectionIceEvent) {
    if (event?.candidate) {
      console.log("*** Outgoing ICE candidate: " + event.candidate.candidate);

      this.sendToServer({
        type: "new-ice-candidate",
        target: this.targetUsername,
        candidate: event.candidate
      });
    }
  }

// Handle |iceconnectionstatechange| events. This will detect
// when the ICE connection is closed, or failed.
//
// This is called when the state of the ICE agent changes.
  private handleICEConnectionStateChangeEvent() {
    console.log("*** ICE connection state changed to " + this.connection.iceConnectionState);

    switch (this.connection.iceConnectionState) {
      case "closed":
      case "failed":
        this.close();
        break;
    }
  }

  /**
   * Handle the |icegatheringstatechange| event. This lets us know what the
   *  ICE engine is currently working on: "new" means no networking has happened
   *  yet, "gathering" means the ICE engine is currently gathering candidates,
   *  and "complete" means gathering is complete. Note that the engine can
   *  alternate between "gathering" and "complete" repeatedly as needs and
   *  circumstances change.
   *
   *  We don't need to do anything when this happens, but we log it to the
   *  console so you can see what's going on when playing with the sample.
   */
  handleICEGatheringStateChangeEvent() {
    console.log("*** ICE gathering state changed to: " + this.connection.iceGatheringState);
  }

  // Set up a |signalingstatechange| event handler. This will detect when
  // the signaling connection is closed.
  //
  // NOTE: This will actually move to the new RTCPeerConnectionState enum
  // returned in the property RTCPeerConnection.connectionState when
  // browsers catch up with the latest version of the specification!
  handleSignalingStateChangeEvent() {
    console.log("*** WebRTC signaling state changed to: " + this.connection.signalingState);
    switch (this.connection.signalingState) {
      case "closed":
        this.close();
        break;
    }
  }

// Called by the WebRTC layer to let us know when it's time to
// begin, resume, or restart ICE negotiation.
  async handleNegotiationNeededEvent() {
    console.log("*** Negotiation needed");

    try {
      console.log("---> Creating offer");
      const offer = await this.connection.createOffer();

      // If the connection hasn't yet achieved the "stable" state,
      // return to the caller. Another negotiationneeded event
      // will be fired when the state stabilizes.

      if (this.connection.signalingState != "stable") {
        console.log("     -- The connection isn't stable yet; postponing...")
        return;
      }

      // Establish the offer as the local peer's current
      // description.

      console.log("---> Setting local description to the offer");
      await this.connection.setLocalDescription(offer);

      // Send the offer to the remote peer.

      console.log("---> Sending the offer to the remote peer");
      this.sendToServer({
        name: this.myUsername,
        target: this.targetUsername,
        type: "video-offer",
        sdp: this.connection.localDescription
      });
    } catch (err) {
      console.log("*** The following error occurred while handling the negotiationneeded event:");
      reportError(err);
    }
  }

  // Called by the WebRTC layer when events occur on the media tracks
  // on our WebRTC call. This includes when streams are added to and
  // removed from the call.
  //
  // track events include the following fields:
  //
  // RTCRtpReceiver       receiver
  // MediaStreamTrack     track
  // MediaStream[]        streams
  // RTCRtpTransceiver    transceiver
  //
  // In our case, we're just taking the first stream found and attaching
  // it to the <video> element for incoming media.
  handleTrackEvent(event: { streams: readonly unknown[] }) {
    console.log("*** Track event");
    // document.getElementById("received_video").srcObject = event.streams[0];
    // document.getElementById("hangup-button").disabled = false;
  }

  sendToServer(msg: { type: string } & Record<string, any>) {

  }

  close() {
    // var localVideo = document.getElementById("local_video");

    console.log("Closing the call");

    // Close the RTCPeerConnection

    if (this.connection) {
      console.log("--> Closing the peer connection");

      // Disconnect all our event listeners; we don't want stray events
      // to interfere with the hangup while it's ongoing.

      this.connection.ontrack = null;
      this.connection.onicecandidate = null;
      this.connection.oniceconnectionstatechange = null;
      this.connection.onsignalingstatechange = null;
      this.connection.onicegatheringstatechange = null;
      this.connection.onnegotiationneeded = null;

      // Stop all transceivers on the connection

      this.connection.getTransceivers().forEach(transceiver => {
        transceiver.stop();
      });

      // Stop the webcam preview as well by pausing the <video>
      // element, then stopping each of the getUserMedia() tracks
      // on it.

      // if (localVideo.srcObject) {
      //   localVideo.pause();
      //   localVideo.srcObject.getTracks().forEach(track => {
      //     track.stop();
      //   });
      // }

      // Close the peer connection

      this.connection.close();
    }
  }
}
