import {Component, ElementRef, ViewChild} from '@angular/core';
import {NavigationEnd, Router, RouterLink, RouterOutlet} from '@angular/router';
import {filter, skip} from 'rxjs/operators';
import {trackPixel} from './services/pixel';
import {NgIf} from "@angular/common";
import {CartService} from "./services/cart.service";
import {CartSidebarComponent} from "./components/cart-sidebar/cart-sidebar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, RouterLink, CartSidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  isMenuOpen = false;
  cartCount = 0;
  cartBump = false;

  private cartBumpTimeout?: ReturnType<typeof setTimeout>;

  constructor(private cartService: CartService, router: Router) {
    // The first PageView is sent by the pixel snippet in index.html;
    // track the in-app navigations after it.
    router.events
      .pipe(filter((e) => e instanceof NavigationEnd), skip(1))
      .subscribe(() => trackPixel('PageView'));
  }

  ngOnInit() {
    this.cartService.cart$.subscribe((items) => {
      const newCount = items.reduce((sum, item) => sum + item.quantity, 0);
      if (newCount > this.cartCount) {
        this.triggerCartBump();
      }
      this.cartCount = newCount;
    });
  }

  private triggerCartBump() {
    this.cartBump = false;
    clearTimeout(this.cartBumpTimeout);
    // restart the animation even if it's already mid-flight
    requestAnimationFrame(() => {
      this.cartBump = true;
      this.cartBumpTimeout = setTimeout(() => (this.cartBump = false), 600);
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
