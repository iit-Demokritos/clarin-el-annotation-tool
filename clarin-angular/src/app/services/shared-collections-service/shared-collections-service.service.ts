import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { SharedCollectionInformation } from '@models/collection';
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

  confirm(data: SharedCollectionInformation, confirmed=null) {
    var body = {
      id:                data.id,
      confirmed:         confirmed ? confirmed : data.confirmed,
      collection_id:     data.collection_id,
      from_email:        data.from_email,
      to_email:          data.to_email,
      confirmation_code: data.confirmation_code
    };
    return new Promise<BackendResult<SharedCollectionInformation>>((resolve, reject) => {
      this.http.patch<BackendResult<SharedCollectionInformation>>('./api/shares/' + data.id, body)
        .subscribe((data) => {
          resolve(data);
        }, (error) => {
          reject(error);
        });
    });
  }; /* confirm */

}
