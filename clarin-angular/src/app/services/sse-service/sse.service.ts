import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { MainService } from '../main/main.service';

@Injectable({
  providedIn: 'root'
})
export class SseService {

  constructor(public zone:NgZone) { }

  getSSEvent(url: string):Observable<any> {
    return Observable.create(observer => {

      const eventSource = new EventSource(url);

      eventSource.onmessage = event => {
        this.zone.run(() => {
          observer.next(event);
        })
      }

      eventSource.onerror = event => {
        this.zone.run(() => {
          observer.error(event);
        })
      }
    });
  }
}
