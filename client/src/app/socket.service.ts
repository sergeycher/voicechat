import {Injectable} from "@angular/core";
import {io} from "socket.io-client";

@Injectable()
export class SocketService {
  socket = io(`ws://localhost:3000`);

  emit(type: string, data: string | null) {
    this.socket.emit(type, data);
  }

  on(type: string, handler: (data: string) => void) {
    this.socket.on(type, handler);
  }
}
