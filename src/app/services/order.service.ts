import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private orderUrl = 'https://script.google.com/macros/s/AKfycbwtfyoh8wPHSGpvVh_HAcQtYErGaWmOCdgnbbltIx2EIYyIt8vazyD3MZqpoEecbQUKTg/exec'; // Replace with your Apps Script URL
  private customOrderUrl = ""
  constructor(private http: HttpClient) { }

  // submitOrder(order: any): Observable<any> {
  //   return this.http.post(this.scriptUrl, order);
  // }

  submitOrder(order: any) {
    return fetch(this.orderUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(order)
    });
  }


  submitCustomOrder(order: any) {
    return fetch(this.orderUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(order)
    });
  }






}
