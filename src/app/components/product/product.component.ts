import {Component, EventEmitter, input, Input, Output} from '@angular/core';
import {NgIf} from "@angular/common";
import {Router, RouterModule} from "@angular/router";
import {CartService} from "../../services/cart.service";

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [NgIf, RouterModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {

  constructor(private router:Router,
              private cartService: CartService) {
  }


  @Input() images!: string[];
  @Input() name!: string;
  @Input() price!: number;
  @Input() id!: number
  @Output() addedToCart = new EventEmitter<string>();



  hovered = false;
  loaded: boolean[] = [false, false];
  showToast = false


  ngOnInit() {
    // Preload the alt image so the first hover is smooth
    if (this.images?.[1]) {
      const pre = new Image();
      pre.src = this.images[1];
    }
  }

  onMouseEnter() {
    // Only try to show alt if it exists
    if (this.images?.[1]) this.hovered = true;
  }

  onMouseLeave() {
    this.hovered = false;
  }

  onLoad(idx: number) {
    this.loaded[idx] = true; // lets us fade in only after the alt is loaded
  }

  viewDetails() {
    this.router.navigate(['/details/', this.id]);
  }

  addToCart() {
    // Use the @Input() properties directly
    this.cartService.addToCart({
      id: this.id,
      name: this.name,
      price: this.price,
      image: this.images?.[0],
      variant: JSON.stringify({}) // store chosen options
      // No variant selected here in the product card
    });

    console.log('Added to cart:', this.name);

    this.addedToCart.emit(this.name);

    // Emit event to parent with product name
    this.addedToCart.emit(this.name);
    console.log("emit")
  }
}
