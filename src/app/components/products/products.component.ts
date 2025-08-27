import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import {NgFor, NgStyle} from "@angular/common";

interface Product {
  image: string;
  category: string;
  title: string;
  description: string;
  price: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    NgStyle,
    NgFor
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})


export class ProductsComponent implements OnInit, OnDestroy {
  items = [
    { image: 'assets/images/chair1.png', subtitle: 'Summer Big Sale!', title: 'Up To 70% Off', description: 'ArmChair Brands.', buttonText: 'Shopping Now' },
    { image: 'assets/chair2.png', subtitle: 'New Collection', title: 'Modern Chairs', description: 'Comfortable and stylish.', buttonText: 'Discover' },
    { image: 'assets/chair3.png', subtitle: 'Special Discount', title: 'Buy 1 Get 1 Free', description: 'Limited time offer.', buttonText: 'Grab Now' }
  ];

  currentIndex = 0;
  interval: any;

  // for swipe
  startX = 0;
  isDragging = false;

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  startAutoSlide() {
    this.interval = setInterval(() => this.nextSlide(), 3000);
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

  // -------------------------------
  // SWIPE / DRAG HANDLERS
  // -------------------------------
  onTouchStart(event: TouchEvent) {
    this.startX = event.touches[0].clientX;
    this.isDragging = true;
    clearInterval(this.interval); // pause auto-slide while dragging
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.isDragging) return;
    const endX = event.changedTouches[0].clientX;
    this.handleSwipe(endX);
    this.isDragging = false;
    this.startAutoSlide(); // resume auto-slide
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
    if (Math.abs(deltaX) > 50) { // threshold so tiny moves don’t trigger
      if (deltaX > 0) {
        this.prevSlide(); // swipe right
      } else {
        this.nextSlide(); // swipe left
      }
    }
  }
}
