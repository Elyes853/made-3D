import {Component, OnInit} from '@angular/core';
import {Product} from "../../models/product.model";
import {ActivatedRoute} from "@angular/router";
import {ProductService} from "../../services/product.service";
import {JsonPipe, NgFor, NgIf} from "@angular/common";
import {CartService} from "../../services/cart.service";

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [NgFor, JsonPipe, NgIf],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  activeImage!: string;
  selectedOptions: Record<string, string> = {}; // Tracks selected option values

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProductById(id).subscribe(found => {
      if (found?.images?.length) {
        this.activeImage = found.images[0];
      }
      if (found) {
        this.product = found;
        console.log('Product loaded:', this.product);
      } else {
        console.log('Product not found for id', id);
      }
    });
  }


  setActiveImage(img: string) {
    this.activeImage = img;
  }

  selectOption(optionName: string, value: string) {
    this.selectedOptions[optionName] = value;
  }

  isSelected(optionName: string, value: string): boolean {
    return this.selectedOptions[optionName] === value;
  }

  addToCart() {
    if (!this.product) return;

    this.cartService.addToCart({
      id: this.product.id,
      name: this.product.name,
      price: this.product.price,
      image: this.product.images[0],
      variant: JSON.stringify(this.selectedOptions) // store chosen options
    });

    console.log('Added to cart:', this.product.name, this.selectedOptions);
  }
}
