import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { Product } from '../../models/product.model';
import {NgFor, NgStyle} from "@angular/common";
import {Router, RouterLink} from "@angular/router";
import {ProductComponent} from "../product/product.component";
import {carouselItems, PRODUCTS} from "../../data/products";


@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    NgStyle,
    NgFor,
    ProductComponent,
    RouterLink,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})


export class ProductsComponent implements OnInit, OnDestroy {

  constructor(private router: Router) {}

  // -------------------------------
  // CAROUSEL DATA
  // -------------------------------


  items = carouselItems

  currentIndex = 0;
  interval: any;

  // swipe handling
  startX = 0;
  isDragging = false;

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  startAutoSlide() {
    this.interval = setInterval(() => this.nextSlide(), 5000);
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }

  onTouchStart(event: TouchEvent) {
    this.startX = event.touches[0].clientX;
    this.isDragging = true;
    clearInterval(this.interval);
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.isDragging) return;
    const endX = event.changedTouches[0].clientX;
    this.handleSwipe(endX);
    this.isDragging = false;
    this.startAutoSlide();
  }

  onMouseDown(event: MouseEvent) {
    this.startX = event.clientX;
    this.isDragging = true;
    clearInterval(this.interval);
  }

  onMouseUp(event: MouseEvent) {
    if (!this.isDragging) return;
    const endX = event.clientX;
    this.handleSwipe(endX);
    this.isDragging = false;
    this.startAutoSlide();
  }

  handleSwipe(endX: number) {
    const deltaX = endX - this.startX;
    if (Math.abs(deltaX) > 50) {
      deltaX > 0 ? this.prevSlide() : this.nextSlide();
    }
  }

  // -------------------------------
  // PRODUCT GRID DATA
  // -------------------------------

  products = PRODUCTS;






}
