// src/app/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  variant?: string;
  quantity: number;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private storageKey = 'cart';
  private cart: CartItem[] = [];

  // Observable for live updates (good for badge/cart component)
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor() {
    this.loadCart();
    // Listen for cross-tab changes
    window.addEventListener('storage', (event) => {
      if (event.key === this.storageKey) {
        this.loadCart();
      }
    });
  }

  private loadCart() {
    const data = localStorage.getItem(this.storageKey);
    this.cart = data ? JSON.parse(data) : [];
    this.cartSubject.next(this.cart);
  }

  private saveCart() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
    this.cartSubject.next(this.cart);
  }

  getCart() {
    return [...this.cart]; // copy to avoid mutation
  }

  getCartCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  addToCart(product: Omit<CartItem, 'quantity'>) {
    const existing = this.cart.find(
      (item) => item.id === product.id && item.variant === product.variant
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({ ...product, quantity: 1 });
    }

    this.saveCart();
  }

  removeFromCart(productId: number, variant?: string) {
    this.cart = this.cart.filter(
      (item) => !(item.id === productId && item.variant === variant)
    );
    this.saveCart();
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  updateQuantity(productId: number, variant: string | undefined, quantity: number) {
    const existing = this.cart.find(
      (item) => item.id === productId && item.variant === variant
    );

    if (existing) {
      existing.quantity = quantity;
      if (existing.quantity <= 0) {
        this.removeFromCart(productId, variant);
      } else {
        this.saveCart();
      }
    }
  }

}
