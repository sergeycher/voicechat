import {Component, HostListener, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {NgIf} from "@angular/common";
import {AudioLog} from "./audioLog";
import {Recorder} from "./recorder.service";
import {SocketService} from "./socket.service";
import {FakeSocket} from "./fake-socket.service";
import {MessageComponent} from "./messages/message.component";
import {BehaviorSubject, debounceTime, delay, distinctUntilChanged, of, switchMap} from "rxjs";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, MessageComponent],
  providers: [SocketService, FakeSocket, Recorder, AudioLog],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private socket = inject(SocketService);
  protected recorder = inject(Recorder);
  protected speaker = inject(AudioLog);

  started = false;

  key = 'ControlRight';

  private recording$ = new BehaviorSubject(false)

  constructor() {
    this.recorder.sound.subscribe(s => {
      this.socket.emit("voice", s);
    });

    setTimeout(async () => {
      await this.recorder.init();
      this.start();
    }, 1000);

    this.recording$.pipe(
      distinctUntilChanged(),
      switchMap(recording => {
        return recording ? of(recording) : of(recording).pipe(delay(500))
      })
    ).subscribe(recording => recording ? this.recorder.start() : this.recorder.stop());
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.code === this.key) {
      this.recording$.next(true);
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (event.code === this.key) {
      this.recording$.next(false);
    }
  }

  start() {
    this.socket.on("voice", (data) => {
      this.speaker.push(data);
    });

    this.started = true;
  }
}
