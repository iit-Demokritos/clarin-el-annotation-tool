import { HttpClient, HttpHeaders, HttpParams, HttpParamsOptions } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EuropeanaSearchParameters, EuropeanaSearchResults } from "@models/services/europeana";
import { BackendResult } from "@models/backend";

@Injectable({
  providedIn: 'root'
})
export class EuropeanaService {

  constructor(public http: HttpClient) { }

  search(searchParams: EuropeanaSearchParameters):
    Promise<BackendResult<EuropeanaSearchResults>> {
    // console.error("EuropeanaService: search():", searchParams);
    return new Promise<BackendResult<EuropeanaSearchResults>>(
      (resolve, reject) => {
        this.http.get<BackendResult<EuropeanaSearchResults>>('/importapi/europeana/search', {
          params: new HttpParams({fromObject: searchParams}),
          headers: new HttpHeaders({
            'Content-Type': 'application/json'
          })
        })
          .subscribe((data) => {
            resolve(data);
          }, (error) => {
            reject();
          });
      });
  }; /* search */
}
