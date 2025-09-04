import { Routes } from '@angular/router';
import {ProductsComponent} from "./components/products/products.component";
import {HomeComponent} from "./components/home/home.component";
import {ProductDetailsComponent} from "./components/product-details/product-details.component";
import {PlaceOrderComponent} from "./components/place-order/place-order.component";
import {CustomOrderComponent} from "./components/custom-order/custom-order.component";

export const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "products", component: ProductsComponent },
  { path: "details/:id", component: ProductDetailsComponent },
  { path: "placeorder", component: PlaceOrderComponent},
  { path: "custom", component: CustomOrderComponent},
];
