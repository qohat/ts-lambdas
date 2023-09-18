// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
<<<<<<< HEAD
import { Product } from "../model/product";
=======
import { Product } from "../model/Product";
>>>>>>> adb801b (initial)

export interface ProductStore {
  getProduct: (id: string) => Promise<Product | undefined>;
  putProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProducts: () => Promise<Product[] | undefined>;
}
