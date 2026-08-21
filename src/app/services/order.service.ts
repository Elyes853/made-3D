import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private orderUrl =
    'https://script.google.com/macros/s/AKfycbwsT-CCMi7V_CSuJJ4Ch6RS_32D1q_TzTr4IHxC4iwxLRXkZEUSMVvPJAh95nQdpbtZ_w/exec'; // Replace with your Apps Script URL
  private customOrderUrl = '';
  constructor(private http: HttpClient) {}

  // submitOrder(order: any): Observable<any> {
  //   return this.http.post(this.scriptUrl, order);
  // }

  submitOrder(order: any): Promise<{ status: string; message?: string }> {
    return fetch(this.orderUrl, {
      method: 'POST',
      // Plain-text content type keeps this a "simple" request so the browser
      // skips a CORS preflight (which the Apps Script endpoint can't answer).
      // Apps Script's doPost still reads e.postData.contents and JSON.parses
      // it itself, so the actual payload format is unaffected.
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(order),
    }).then((res) => res.json());
  }

  submitCustomOrder(order: any) {
    return fetch(this.orderUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
  }
}
