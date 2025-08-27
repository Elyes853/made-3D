import { Routes } from '@angular/router';
import {ProductsComponent} from "./components/products/products.component";
import {HomeComponent} from "./components/home/home.component";

export const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "products", component: ProductsComponent }
];
