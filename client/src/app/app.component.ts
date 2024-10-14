import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {NgIf} from "@angular/common";
import {Speaker} from "./speaker";
import {Recorder} from "./recorder.service";
import {SocketService} from "./socket.service";
import {FakeSocket} from "./fake-socket.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf],
  providers: [SocketService, FakeSocket, Recorder],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private socket = inject(SocketService);
  protected recorder = inject(Recorder);

  constructor() {
    this.recorder.sound.subscribe(s => {
      this.socket.emit("voice", s);
    });

    setTimeout(async () => {
      await this.recorder.init();
      this.start();
    }, 1000);
  }

  title = 'client';

  started = false;

  start() {
    this.recorder.start();

    const buffer = new Speaker();

    this.socket.on("voice", (data) => {
      buffer.push(data);
    });

    this.started = true;
  }
}
