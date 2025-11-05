import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Product} from "../../models/product.model";
import {ActivatedRoute} from "@angular/router";
import {ProductService} from "../../services/product.service";
import {JsonPipe, NgClass, NgFor, NgIf} from "@angular/common";
import {CartService} from "../../services/cart.service";

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [NgFor, JsonPipe, NgIf, NgClass],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush, // <-- add this line

})
export class ProductDetailsComponent implements OnInit, AfterViewInit {

  product: Product | null = null;
  activeImage!: string;
  selectedOptions: Record<string, string> = {}; // Tracks selected option values
  showToast = false;
  toastMessage = ""
  toastType!:string

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
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

  ngAfterViewInit() {
    if (!this.product?.images) return;

    this.product.images.forEach((src, i) => {
      setTimeout(() => {
        const img = new Image();
        img.src = src;
        img.decoding = 'async';
      }, i * 100); // load one every 100ms
    });
  }

  setActiveImage(img: string) {
    // Instantly update the active image
    this.activeImage = img;

    // Tell Angular to refresh just this component
    this.cdr.markForCheck();
  }

  selectOption(optionName: string, value: string) {
    this.selectedOptions[optionName] = value;
  }

  isSelected(optionName: string, value: string): boolean {
    return this.selectedOptions[optionName] === value;
  }

  addToCart() {
    if (!this.product) return;

    // If the product has variants, check that all are selected
    if (this.product.variants?.length) {
      const allSelected = this.product.variants.every(
        (variant: any) => this.selectedOptions[variant.name]
      );

      if (!allSelected) {
        this.showToastMessage("⚠️ Please choose all variants first", "warning");
        return;
      }
    }

    // Add to cart
    this.cartService.addToCart({
      id: this.product.id,
      name: this.product.name,
      price: this.product.price,
      image: this.product.images[0],
      variant: JSON.stringify(this.selectedOptions)
    });

    console.log('Added to cart:', this.product.name, this.selectedOptions);

    this.showToastMessage("✔ Added to cart", "success");
  }

// Reusable toast handler
  showToastMessage(message: string,  type: 'success' | 'warning' = 'success') {
    this.toastMessage = message;
    this.showToast = true;
    this.toastType = type
    setTimeout(() => this.showToast = false, 2000);
  }


}
