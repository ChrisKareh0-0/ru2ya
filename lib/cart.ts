import { Product } from './products';

export interface CartItem {
  product: Product;
  quantity: number;
}

export class CartManager {
  private items: CartItem[] = [];
  private readonly STORAGE_KEY = 'ru2ya_cart';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          this.items = JSON.parse(stored);
        }
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.items = [];
    }
  }

  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
      }
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  addItem(product: Product, quantity: number = 1): void {
    const existingItem = this.items.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ product, quantity });
    }
    
    this.saveToStorage();
  }

  removeItem(productId: number): void {
    this.items = this.items.filter(item => item.product.id !== productId);
    this.saveToStorage();
  }

  updateQuantity(productId: number, quantity: number): void {
    const item = this.items.find(item => item.product.id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = quantity;
        this.saveToStorage();
      }
    }
  }

  getItems(): CartItem[] {
    return [...this.items];
  }

  getTotalItems(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalPrice(): number {
    return this.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  clear(): void {
    this.items = [];
    this.saveToStorage();
  }
}