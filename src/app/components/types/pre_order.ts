export type ProductDetail =
  | { icon: string; description: string }
  | { color: string };

export interface SpecsItem {
  Finish: string;
  Connectivity: string;
  Display: string;
  Security: string[];
  "System requirements": string;
  "Digital assets supported": string;
  "Size & weights": string;
  "In the box": string[];
}
export interface SpecsItem2 {
  "Chip model": string;
  "Fabrication process": string;
  Core: string;
  "Flash Memory": string;
  ROM: string;
  RAM: string;
  Interface: string;
}

export interface itemType {
  id: number;
  slug: string;
  product_name: string;
  product_images: string[];
  outOfStock: boolean;
  quantity: number;
  description: string;
  message: string;
  product_details: ProductDetail[];
  price: number;
  specs: {
    main: string;
    items?: SpecsItem[];
    items2?: SpecsItem2[];
  };
}

export interface Item {
  id: number;
  slug: string;
  product_name: string;
  price: number;
  amount: number;
  complete: boolean;
  image: string;
  anonymous: boolean;
}

export interface formValueTypes {
  firstName: string;
  lastName: string;
  location: string;
  state: string;
  tel: string;
  email: string;
  region: string;
}
