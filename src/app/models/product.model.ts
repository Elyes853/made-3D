export interface Variant {
  name: string; // e.g., "Color", "Size", "Shape"
  values: string[]; // e.g., ["Red", "Blue"], ["S", "M", "L"], ["Round", "Square"]
}



export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  images: string[];
  variants?: Variant[];
}



// export interface Variant {
//   name: string;    // e.g. "Color", "Size"
//   value: string;   // e.g. "White", "Black", "M"
//   images: string[]; // optional: variant-specific photos
// }
//
// export interface Product {
//   id: number;
//   name: string;
//   price: number;
//   description?: string;
//   images: string[];   // general product photos
//   variants?: Variant[];
// }

