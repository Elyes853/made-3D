import {Component, OnInit} from '@angular/core';
import {CommonModule, NgClass, NgFor, NgIf} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {CartItem, CartService} from "../../services/cart.service";
import {OrderService} from "../../services/order.service";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-place-order',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, ReactiveFormsModule, NgClass, CommonModule, RouterLink],
  templateUrl: './place-order.component.html',
  styleUrl: './place-order.component.scss'
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
    address: ''
  };

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private fb: FormBuilder) {
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
      note: ['']
    });
  }

  ngOnInit() {
  }

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
    this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
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

    const orderPayload = {
      firstName,
      lastName,
      phone,
      email,
      address,
      state,
      city,
      note,
      items: this.items,
      total: this.total
    };

    this.orderService
      .submitOrder(orderPayload)
      .then(() => {
        this.loading = false;
        this.statusMessage = '✅ Order submitted successfully!';
        this.cartService.clearCart();
        this.items = [];
        this.calculateTotal();
        this.shippingForm.reset();
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
    "Ariana",
    "Béja",
    "Ben Arous",
    "Bizerte",
    "Gabès",
    "Gafsa",
    "Jendouba",
    "Kairouan",
    "Kasserine",
    "Kebili",
    "Kef",
    "Mahdia",
    "Manouba",
    "Médenine",
    "Monastir",
    "Nabeul",
    "Sfax",
    "Sidi Bouzid",
    "Siliana",
    "Sousse",
    "Tataouine",
    "Tozeur",
    "Tunis",
    "Zaghouan"
  ];
}
