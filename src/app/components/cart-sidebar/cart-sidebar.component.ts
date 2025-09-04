// import { Component } from '@angular/core';
// import {CartItem, CartService} from "../../services/cart.service";
// import {NgFor, NgIf} from "@angular/common";
//
// @Component({
//   selector: 'app-cart-sidebar',
//   standalone: true,
//   imports: [NgIf,NgFor],
//   templateUrl: './cart-sidebar.component.html',
//   styleUrl: './cart-sidebar.component.scss'
// })
// export class CartSidebarComponent {
//
//
//   isOpen = false;
//   items: CartItem[] = [];
//   total = 0;
//
//   constructor(private cartService: CartService) {
//     this.cartService.cart$.subscribe(cart => {
//       console.log('Cart updated:', cart); // <--- check in console
//       this.items = cart;
//       this.total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
//     });
//   }
//
//   toggleSidebar() {
//     this.isOpen = !this.isOpen;
//   }
//
//   removeItem(item: CartItem) {
//     this.cartService.removeFromCart(item.id, item.variant);
//   }
// }
//
//



import { Component } from '@angular/core';
import { CartItem, CartService } from '../../services/cart.service';
import { NgFor, NgIf } from '@angular/common';
import {Router} from "@angular/router";

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.scss']
})
export class CartSidebarComponent {
  isOpen = false;
  items: CartItem[] = [];
  total = 0;

  constructor(private cartService: CartService,
              private router: Router) {
    this.cartService.cart$.subscribe(cart => {
      this.items = cart;
      this.total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    });
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  closeSidebar() {
    this.isOpen = false;
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.id, item.variant);
  }

  checkout() {
    this.closeSidebar();
    this.router.navigate(["/placeorder"])

  }

  parseVariant(variant: string | null): string {
    if (!variant) return '';
    try {
      const obj = JSON.parse(variant);
      // Convert {Color: 'Red', Size: 'M'} → 'Color: Red, Size: M'
      return Object.entries(obj).map(([key, value]) => `${key}: ${value}`).join(', ');
    } catch (e) {
      return variant; // fallback if parsing fails
    }
  }
}
