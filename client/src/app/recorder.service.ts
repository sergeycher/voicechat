import {Injectable} from "@angular/core";
import {Subject} from "rxjs";

@Injectable()
export class Recorder {
  sound = new Subject<string>();

  private audioChunks: Blob[] = [];
  private mime = 'audio/ogg';

  private mediaRecorder?: MediaRecorder;

  maxDuration = 8000;

  get active() {
    return this.mediaRecorder?.state === 'recording';
  }

  async init() {
    const stream = await navigator.mediaDevices.getUserMedia({audio: true});

    console.log('Recorder initialized');
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.addEventListener("dataavailable", event => {
      this.audioChunks.push(event.data)
    });

    mediaRecorder.addEventListener('stop', () => {
      this.flush();
    });

    this.mediaRecorder = mediaRecorder;
  }

  durationTimeout: any;

  start() {
    if (!this.active) {
      this.mediaRecorder?.start();
      this.durationTimeout = setTimeout(() => this.restart(), this.maxDuration);
    }
  }

  stop() {
    if (this.active) {
      clearTimeout(this.durationTimeout);
      this.mediaRecorder?.stop();
    }
  }

  private restart() {
    if (this.active) {
      this.stop();
      this.start();
    }
  }

  private flush() {
    const audioBlob = new Blob(this.audioChunks);
    this.audioChunks = [];

    const fileReader = new FileReader();

    fileReader.addEventListener('loadend', () => {
      this.sound.next(fileReader.result as string);
    });

    fileReader.readAsDataURL(audioBlob);
  }
}
