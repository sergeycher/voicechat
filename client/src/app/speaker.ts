export class Speaker {
  private audioCtx = new AudioContext();
  private panner = new StereoPannerNode(this.audioCtx, {pan: 0});

  push(data: string) {
    const audio = new Audio(data);
    const track = new MediaElementAudioSourceNode(this.audioCtx, {
      mediaElement: audio,
    });
    track.connect(this.panner).connect(this.audioCtx.destination);
    audio.play();
    // this.buffer.push(a);
    // this.next();
  }
}
