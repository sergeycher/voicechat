import {Injectable} from "@angular/core";

export type Message = { audio: HTMLAudioElement };

@Injectable()
export class AudioLog {
  private audioCtx = new AudioContext();
  private panner = new StereoPannerNode(this.audioCtx, {pan: 0});

  messages: Message[] = [];

  current?: Message;

  play(m: Message) {
    this.current?.audio.pause();

    this.current = m;

    this.current.audio.play();
  }

  push(data: string) {
    const audio = new Audio(data);
    const track = new MediaElementAudioSourceNode(this.audioCtx, {
      mediaElement: audio,
    });
    track.connect(this.panner).connect(this.audioCtx.destination);
    const msg = {audio};
    this.messages.push(msg);

    audio.addEventListener('ended', () => {
      const next = this.messages[this.messages.indexOf(msg) + 1];
      if (next) {
        this.play(next);
      }
    });

    if (!this.current || this.current.audio.ended) {
      this.play(msg);
    }
  }
}

