import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BackendResult, BackendResultSharedCollectionsInformation } from '@models/backend';

@Injectable({
  providedIn: 'root'
})
export class SharedCollectionsService {

  constructor(
    public http: HttpClient
  ) { }

  getSharedCollectionsInfo() {
    return new Promise<BackendResult<BackendResultSharedCollectionsInformation>>((resolve, reject) => {
      this.http.get<BackendResult<BackendResultSharedCollectionsInformation>>('./api/shares')
        .subscribe((data) => {
          resolve(data);
        }, (error) => {
          reject(error);
        });
    });
  }

}
