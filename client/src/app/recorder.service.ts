import {Injectable} from "@angular/core";
import {Subject} from "rxjs";

@Injectable()
export class Recorder {
  active = true;

  sound = new Subject<string>();

  private audioChunks: Blob[] = [];
  private mime = 'audio/ogg';

  private flushNext = false;
  private mediaRecorder?: MediaRecorder;

  init() {
    return new Promise(acc => {
      navigator.mediaDevices.getUserMedia({audio: true}).then((stream) => {
        console.log('Recorder initialized');
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        mediaRecorder.addEventListener("dataavailable", event => {
          this.audioChunks.push(event.data);

          if (this.flushNext) {
            this.flush();
          }
        });

        this.mediaRecorder = mediaRecorder;

        acc(mediaRecorder);
      });
    })
  }

  start() {
    const TICK = 200;

    setInterval(() => {
      this.flushNext = true;
      this.mediaRecorder?.stop();
      this.mediaRecorder?.start();
    }, TICK);
  }

  private flush() {
    this.flushNext = false;

    const audioBlob = new Blob(this.audioChunks);
    this.audioChunks = [];

    const fileReader = new FileReader();

    fileReader.addEventListener('loadend', () => {
      if (!this.active) return;

      const base64String = fileReader.result;
      this.sound.next(base64String as string);
    });

    fileReader.readAsDataURL(audioBlob);
  }
}
