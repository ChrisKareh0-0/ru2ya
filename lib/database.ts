// Type definitions for database entities
export interface Product {
  id: number | string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  featured: boolean;
  bestseller: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  orderId: string;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

