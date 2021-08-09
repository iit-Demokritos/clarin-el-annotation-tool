import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SseService {

  constructor(public zone:NgZone) { }

  getSSEvent(url: string):Observable<any> {
    return Observable.create(observer => {

      const eventSource = new EventSource(url);

      // Petasis, 09/08/2021: Changed from onmessage to
      // addEventListener:
      // https://stackoverflow.com/questions/61613457/why-angular-observable-based-sseservice-works-just-once-receives-events-but-pro
      /*eventSource.onmessage = event => {
        this.zone.run(() => {
          observer.next(event);
        })
      }*/

      eventSource.addEventListener('message', event => {
        this.zone.run(() => {
          observer.next(event);
        });
      });

      eventSource.onerror = event => {
        this.zone.run(() => {
          observer.error(event);
        })
      }
    });
  }
}
