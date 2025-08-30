import Database from 'better-sqlite3';
import { getDatabaseConfig } from './db-config';

// Define interfaces
export interface Product {
  id: number;
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
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: string;
  total_amount: number;
  status: string;
  created_at: string;
}

let db: Database.Database | null = null;

export function getDatabase() {
  if (!db) {
    const config = getDatabaseConfig();
    db = new Database(config.path);
    
    // Enable WAL mode for better performance and lower memory usage
    db.pragma('journal_mode = WAL');
    db.pragma('cache_size = -2000'); // 2MB cache instead of default
    db.pragma('temp_store = memory');
    db.pragma('mmap_size = 268435456'); // 256MB memory mapping
    
    // Create tables if they don't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image TEXT,
        category TEXT,
        featured BOOLEAN DEFAULT 0,
        bestseller BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        items TEXT NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS countdown (
        id INTEGER PRIMARY KEY,
        end_date DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Check if products table is empty and load from JSON
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
    
    if (productCount.count === 0) {
      console.log('🔄 Products table is empty, loading from JSON file...');
      const products = loadProductsFromJSON();
      
      if (products.length > 0) {
        const insertProduct = db.prepare(`
          INSERT INTO products (name, description, price, image, category, featured, bestseller) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        // Begin transaction for faster insertion
        const transaction = db.transaction(() => {
          for (const product of products) {
            insertProduct.run(
              product.name,
              product.description,
              product.price,
              product.image,
              product.category,
              product.featured ? 1 : 0,
              product.bestseller ? 1 : 0
            );
          }
        });
        
        transaction();
        console.log(`✅ Successfully loaded ${products.length} products from JSON file`);
      }
    } else {
      console.log(`📦 Database already contains ${productCount.count} products`);
    }
  }
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// Optimize product queries with prepared statements
const getProductsStmt = getDatabase().prepare(`
  SELECT id, name, description, price, image, category, featured, bestseller, createdAt, updatedAt 
  FROM products 
  ORDER BY createdAt DESC
`);

const getProductsByCategoryStmt = getDatabase().prepare(`
  SELECT id, name, description, price, image, category, featured, bestseller, createdAt, updatedAt 
  FROM products 
  WHERE category = ? 
  ORDER BY createdAt DESC
`);

export function getProducts(category?: string) {
  try {
    if (category) {
      return getProductsByCategoryStmt.all(category);
    }
    return getProductsStmt.all();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export function getProduct(id: number) {
  try {
    const stmt = getDatabase().prepare('SELECT * FROM products WHERE id = ?');
    return stmt.get(id);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export function addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const stmt = getDatabase().prepare(`
      INSERT INTO products (name, description, price, image, category, featured, bestseller) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(product.name, product.description, product.price, product.image, product.category, product.featured ? 1 : 0, product.bestseller ? 1 : 0);
    return result.lastInsertRowid;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

export function updateProduct(id: number, product: Partial<Product>) {
  try {
    const stmt = getDatabase().prepare(`
      UPDATE products 
      SET name = COALESCE(?, name), 
          description = COALESCE(?, description), 
          price = COALESCE(?, price), 
          image = COALESCE(?, image),
          category = COALESCE(?, category),
          featured = COALESCE(?, featured),
          bestseller = COALESCE(?, bestseller),
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(product.name, product.description, product.price, product.image, product.category, product.featured, product.bestseller, id);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export function deleteProduct(id: number) {
  try {
    const stmt = getDatabase().prepare('DELETE FROM products WHERE id = ?');
    return stmt.run(id);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

export function getOrders() {
  try {
    const stmt = getDatabase().prepare('SELECT * FROM orders ORDER BY created_at DESC');
    return stmt.all();
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export function addOrder(order: Omit<Order, 'id' | 'created_at'>) {
  try {
    const stmt = getDatabase().prepare(`
      INSERT INTO orders (customer_name, customer_email, customer_phone, items, total_amount, status) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(order.customer_name, order.customer_email, order.customer_phone, order.items, order.total_amount, order.status);
    return result.lastInsertRowid;
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
}

export function updateOrderStatus(id: number, status: string) {
  try {
    const stmt = getDatabase().prepare('UPDATE orders SET status = ? WHERE id = ?');
    return stmt.run(status, id);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

export function getCountdown() {
  try {
    const stmt = getDatabase().prepare('SELECT * FROM countdown ORDER BY id DESC LIMIT 1');
    return stmt.get();
  } catch (error) {
    console.error('Error fetching countdown:', error);
    throw error;
  }
}

export function setCountdown(endDate: string) {
  try {
    const stmt = getDatabase().prepare(`
      INSERT OR REPLACE INTO countdown (id, end_date) 
      VALUES (1, ?)
    `);
    return stmt.run(endDate);
  } catch (error) {
    console.error('Error setting countdown:', error);
    throw error;
  }
}

// Cleanup on process exit
process.on('exit', closeDatabase);
process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);
