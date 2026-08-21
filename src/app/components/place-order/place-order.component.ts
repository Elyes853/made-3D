import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CartItem, CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { RouterLink } from '@angular/router';
import { LithophaneService } from '../../services/lithophane.service';

@Component({
  selector: 'app-place-order',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    CommonModule,
    RouterLink,
  ],
  templateUrl: './place-order.component.html',
  styleUrl: './place-order.component.scss',
})
export class PlaceOrderComponent implements OnInit {
  statusMessage = '';
  loading = false;
  items: CartItem[] = [];
  shipping = 8; // fixed shipping fee
  subtotal = 0;
  total = 0;

  order = {
    name: '',
    phone: '',
    email: '',
    address: '',
  };

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private lithophaneService: LithophaneService,
    private fb: FormBuilder,
  ) {
    this.items = this.cartService.getCart();
    this.calculateTotal();
    this.shippingForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{8,}$/)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      note: [''],
    });
  }

  ngOnInit() {}

  increaseQuantity(item: CartItem) {
    item.quantity += 1;
    this.cartService.updateQuantity(item.id, item.variant, item.quantity);
    this.calculateTotal();
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity -= 1;
      this.cartService.updateQuantity(item.id, item.variant, item.quantity);
    } else {
      this.cartService.removeFromCart(item.id, item.variant);
      this.items = this.cartService.getCart();
    }
    this.calculateTotal();
  }

  calculateTotal() {
    this.subtotal = this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    this.total = this.subtotal + this.shipping;
  }

  // checkout() {
  //   if (this.shippingForm.invalid) {
  //     this.shippingForm.markAllAsTouched();
  //     return;
  //   }
  //   const { firstName, lastName, phone, email, address, state, city, note } = this.shippingForm.value;
  //   const orderPayload1 = {
  //     firstName: firstName,    // 👈 top-level field
  //     lastName : lastName,
  //     phone:phone,
  //     email:email,
  //     address:address,
  //     state:state,
  //     city:city,
  //     note:note,
  //     items: this.items,
  //     total: this.total,
  //   }
  //
  //   const orderPayload = {
  //     customer: this.shippingForm.value,   // ✅ includes firstName, lastName, phone, email, address...
  //     items: this.items,
  //     subtotal: this.subtotal,
  //     shipping: this.shipping,
  //     total: this.total,
  //   };
  //
  //   this.orderService.submitOrder(orderPayload1).then(() => {
  //     alert('Order submitted successfully!');
  //     this.cartService.clearCart();
  //     this.items = [];
  //     this.calculateTotal();
  //     this.shippingForm.reset();
  //   }).catch(() => {
  //     alert('Error submitting order');
  //   });
  // }

  /** Returns true if the item is a lithophane */
  isLithophane(item: CartItem): boolean {
    return !!item.variant?.startsWith('litho:');
  }

  /** Extracts the lithophane image and shape for a cart item (used in checkout payload) */
  private getLithophaneData(
    item: CartItem,
  ): { imageBase64: string; colorImageBase64: string | null; shape: string } | null {
    if (!item.variant?.startsWith('litho:')) return null;
    // variant format: litho:<uuid>:<shape>
    const parts = item.variant.split(':');
    const id = parts[1];
    const shape = parts[2] ?? 'square';
    const imageBase64 = this.lithophaneService.getImage(id);
    if (!imageBase64) return null;
    const colorImageBase64 = this.lithophaneService.getImage(id + '_color');
    return { imageBase64, colorImageBase64, shape };
  }

  checkout() {
    if (this.shippingForm.invalid) {
      this.shippingForm.markAllAsTouched();
      this.statusMessage = 'Some fields are still missing.';
      return;
    }
    //console.log('Form value:', this.shippingForm.value);

    this.loading = true;
    this.statusMessage = '⏳ Placing your order...';

    const { firstName, lastName, phone, email, address, state, city, note } =
      this.shippingForm.value;

    // Collect lithophane images keyed by item name
    const lithophaneImages: Record<
      string,
      { imageBase64: string; colorImageBase64: string | null; shape: string }
    > = {};
    this.items.forEach((item) => {
      const data = this.getLithophaneData(item);
      if (data) {
        lithophaneImages[item.name] = data;
      }
    });

    const orderPayload = {
      firstName,
      lastName,
      phone,
      email,
      address,
      state,
      city,
      note,
      items: this.items.map((item) => ({
        ...item,
        // Strip the large image thumbnail to keep payload small
        image: item.variant?.startsWith('litho:')
          ? '[lithophane - see images]'
          : item.image,
      })),
      total: this.total,
      ...(Object.keys(lithophaneImages).length > 0 && { lithophaneImages }),
    };

    this.orderService
      .submitOrder(orderPayload)
      .then((res) => {
        this.loading = false;
        if (res.status === 'success') {
          this.statusMessage = '✅ Order submitted successfully!';
          this.cartService.clearCart();
          this.items = [];
          this.calculateTotal();
          this.shippingForm.reset();
        } else {
          this.statusMessage =
            '❌ ' + (res.message || 'Error submitting order');
        }
      })
      .catch(() => {
        this.loading = false;
        this.statusMessage = '❌ Error submitting order';
      });
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.id, item.variant);
    this.items = this.cartService.getCart(); // refresh list after delete
    this.calculateTotal();
  }

  shippingForm: FormGroup;

  // isInvalid(controlName: string): boolean {
  //   const control = this.shippingForm.get(controlName);
  //   return !!(control && control.invalid && (control.touched || control.dirty));
  // }

  isInvalid(controlName: string): boolean {
    const control = this.shippingForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  states = [
    'Ariana',
    'Béja',
    'Ben Arous',
    'Bizerte',
    'Gabès',
    'Gafsa',
    'Jendouba',
    'Kairouan',
    'Kasserine',
    'Kebili',
    'Kef',
    'Mahdia',
    'Manouba',
    'Médenine',
    'Monastir',
    'Nabeul',
    'Sfax',
    'Sidi Bouzid',
    'Siliana',
    'Sousse',
    'Tataouine',
    'Tozeur',
    'Tunis',
    'Zaghouan',
  ];
}
