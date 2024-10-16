import {ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal} from "@angular/core";
import {AudioLog, Message} from "../audioLog";

@Component({
  selector: "audio-log-message",
  template: `
    <div class="progressbar" [style.width]="progress()"></div>
    <div class="content" (click)="log.play(message())">{{ duration() }}</div>`,
  styleUrls: ["./message.component.less"],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageComponent implements OnInit {
  log = inject(AudioLog);

  message = input.required<Message>();

  duration = signal(0);
  time = signal(0);

  progress = computed(() => {
    const duration = this.duration();
    const time = this.time();
    return clamp((!duration) ? 0 : (time / duration * 100), 0, 100) + '%';
  });

  ngOnInit() {
    const {audio} = this.message();

    audio.addEventListener('loadedmetadata', () => {
      this.duration.set(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      this.time.set(audio.currentTime);
    })
  }
}

function clamp(number: number, boundOne: number, boundTwo?: number) {
  if (boundTwo == null) {
    return Math.max(number, boundOne) === boundOne ? number : boundOne;
  }

  if (Math.min(number, boundOne) === number) {
    return boundOne;
  }

  if (Math.max(number, boundTwo) === number) {
    return boundTwo;
  }

  return number;
}
