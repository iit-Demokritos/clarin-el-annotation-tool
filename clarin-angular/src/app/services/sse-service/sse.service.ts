import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SseService {
  private eventSource: EventSource;

  constructor(public zone:NgZone) { }

  getSSEvent(url: string):Observable<any> {
    return Observable.create(observer => {

      // const eventSource = new EventSource(url);
      const eventSource = this.getEventSource(url);

      eventSource.onmessage = event => {
        this.zone.run(() => {
          observer.next(event);
        })
      }

      /* eventSource.addEventListener('message', event => {
        this.zone.run(() => {
          observer.next(event);
        });
      });*/

      eventSource.onopen = (event) => {
       // console.error('Connection to server opened.', event);
      }

      eventSource.onerror = event => {
        var propagateError = true;
        switch (event['target']['readyState']) {
          case EventSource.CONNECTING: // 0
            propagateError = false;
            break;
          case EventSource.OPEN:       // 1
          case EventSource.CLOSED:     // 2
          default:
            break;
        }
        if (propagateError) {
          console.error("SseService: onerror():", event.target['readyState'], event);
          this.zone.run(() => {
            observer.error(event);
          })
        }
      }
    });
  }

  private getEventSource(url: string): EventSource {
    if (this.eventSource) {
      // console.error('SseService: EventSource closed.');
      this.eventSource.close();
    }
    this.eventSource = new EventSource(url);
    return this.eventSource;
  }
}
