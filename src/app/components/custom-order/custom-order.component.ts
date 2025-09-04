import { Component } from '@angular/core';
import {AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule, NgClass, NgFor, NgIf} from "@angular/common";
import {RouterLink} from "@angular/router";

export function minFiles(count = 1) {
  return (control: AbstractControl) => {
    const value = control.value as File[] | null;
    return (!value || value.length < count)
      ? {minFiles: {required: count, actual: value ? value.length : 0}}
      : null;
  };
}

@Component({
  selector: 'app-custom-order',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, ReactiveFormsModule, NgClass, CommonModule, RouterLink],
  templateUrl: './custom-order.component.html',
  styleUrl: './custom-order.component.scss'
})
export class CustomOrderComponent {
  states = ['New York', 'California', 'Texas', 'Florida']; // example

  orderForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]],
    email: ['', [Validators.required, Validators.email]],
    preferredContact: ['', Validators.required],
    state: ['', Validators.required],
    city: ['', Validators.required],
    address: ['', Validators.required],
    files: this.fb.control<File[]>([], { validators: [minFiles(1)], nonNullable: true }),
    note: [''],
    agreement: [false, Validators.requiredTrue]
  });

  statusMessage = '';
  loading = false;
  selectedFiles: File[] = [];

  constructor(private fb: FormBuilder) {}

  isInvalid(control: string) {
    const c = this.orderForm.get(control);
    return c?.invalid && (c.dirty || c.touched);
  }

  // onFileSelected(event: any) {
  //   const file: File = event.target.files[0];
  //   if (file) {
  //     this.selectedFiles = [file];
  //     this.orderForm.patchValue({ files: file });
  //   }
  // }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const newFiles = Array.from(input.files); // FileList -> File[]
    // Option A: replace the list
    this.selectedFiles = newFiles;
    this.orderForm.get('files')!.setValue(newFiles);
    console.log(this.orderForm.get('files'))

    // Option B: append to existing list instead (uncomment to use)
    // const current = this.orderForm.get('files')!.value || [];
    // const merged = [...current, ...newFiles];
    // this.selectedFiles = merged;
    // this.orderForm.get('files')!.setValue(merged);
  }


  submitOrder() {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.statusMessage = 'Submitting your order...';

    // TODO: send data + files to backend (FormData)
    setTimeout(() => {
      this.loading = false;
      this.statusMessage = 'Your custom order has been submitted successfully!';
    }, 2000);

    

  }




}
