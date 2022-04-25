import { Injectable } from "@angular/core";
import { finalize, Observable } from "rxjs";

export interface KeyState {
  value: string,
  pressed: boolean,
  released: boolean
}

@Injectable()
export class KeyboardService {

  listenKey(value: string): Observable<KeyState> {

    let downListener: (event: KeyboardEvent) => void;
    let upListener: (event: KeyboardEvent) => void;

    //Attach event listeners
    return new Observable<KeyState>(observer => {

      downListener = (event) => {
        if (event.code !== value) {
          return;
        }
        observer.next({ value, pressed: true, released: false });
      };

      upListener = (event) => {
        if (event.code !== value) {
          return;
        }
        observer.next({ value, pressed: false, released: true });
      };

      window.addEventListener("keydown", downListener, false);
      window.addEventListener("keyup", upListener, false);

    }).pipe(
      finalize(() => {
        window.removeEventListener("keydown", downListener);
        window.removeEventListener("keyup", upListener);
      })
    );
  }

}
