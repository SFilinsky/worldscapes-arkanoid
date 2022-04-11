import { Observable, tap } from "rxjs";

export function once<T>(action: (data: T) => void) {
  let done = false;
  return (source$: Observable<T>) => source$.pipe(
    tap(data => {
      if (!done) {
        done = true;
        action(data);
      }
    })
  );
}
