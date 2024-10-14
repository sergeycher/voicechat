import {Injectable} from "@angular/core";
import {delay, filter, Subject} from "rxjs";

@Injectable()
export class FakeSocket {
  private out = new Subject<{ type: string, data: any }>();
  private echo = this.out.pipe(delay(600));

  emit(type: string, data: string | null) {
    this.out.next({type, data});
  }

  on(type: string, handler: (data: string) => void) {
    this.echo.pipe(filter((d) => d.type === type)).subscribe(d => handler(d.data));
  }
}
