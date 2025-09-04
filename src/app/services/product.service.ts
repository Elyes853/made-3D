import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { PRODUCTS } from "../data/products";
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private products = PRODUCTS;

  getProducts(): Observable<Product[]> {
    return of(this.products);
  }

  getProductById(id: number): Observable<Product | undefined> {
    const product = this.products.find(p => p.id === id);
    return of(product);
  }
}
