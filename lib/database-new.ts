import Database from 'better-sqlite3';
import { getDatabaseConfig } from './db-config';
import fs from 'fs';
import path from 'path';

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

// Function to load products from JSON file
function loadProductsFromJSON(): any[] {
  try {
    const jsonPath = path.join(process.cwd(), 'data', 'products.json');
    if (fs.existsSync(jsonPath)) {
      const jsonData = fs.readFileSync(jsonPath, 'utf8');
      const data = JSON.parse(jsonData);
      
      // Handle both array format and object with products array format
      let products;
      if (Array.isArray(data)) {
        // Direct array format
        products = data;
        console.log('📦 Loaded products from JSON file (direct array):', products.length, 'products');
      } else if (data.products && Array.isArray(data.products)) {
        // Wrapped in products object format
        products = data.products;
        console.log('📦 Loaded products from JSON file (wrapped):', products.length, 'products');
      } else {
        console.log('⚠️  Invalid JSON structure in products.json, using empty product list');
        return [];
      }
      
      return products;
    } else {
      console.log('⚠️  Products JSON file not found, using empty product list');
      return [];
    }
  } catch (error) {
    console.error('❌ Error loading products from JSON:', error);
    return [];
  }
}

// Function to export current database products to JSON file
export function exportProductsToJSON(): boolean {
  try {
    if (!db) {
      console.log('⚠️  Database not connected, cannot export products');
      return false;
    }
    
    // Get all products from database
    const products = db.prepare(`
      SELECT name, description, price, image, category, featured, bestseller 
      FROM products 
      ORDER BY createdAt DESC
    `).all() as Array<{
      name: string;
      description: string;
      price: number;
      image: string;
      category: string;
      featured: number;
      bestseller: number;
    }>;
    
    // Convert to the format expected by the JSON file
    const productsForExport = products.map(product => ({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      featured: product.featured === 1,
      bestseller: product.bestseller === 1
    }));
    
    // Write to JSON file
    const jsonPath = path.join(process.cwd(), 'data', 'products.json');
    const jsonContent = JSON.stringify(productsForExport, null, 2);
    fs.writeFileSync(jsonPath, jsonContent, 'utf8');
    
    console.log(`✅ Exported ${productsForExport.length} products to JSON file`);
    return true;
  } catch (error) {
    console.error('❌ Error exporting products to JSON:', error);
    return false;
  }
}

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

const getProductByIdStmt = getDatabase().prepare(`
  SELECT id, name, description, price, image, category, featured, bestseller, createdAt, updatedAt 
  FROM products 
  WHERE id = ?
`);

const addProductStmt = getDatabase().prepare(`
  INSERT INTO products (name, description, price, image, category, featured, bestseller) 
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const updateProductStmt = getDatabase().prepare(`
  UPDATE products 
  SET name = ?, description = ?, price = ?, image = ?, category = ?, featured = ?, bestseller = ?, updatedAt = CURRENT_TIMESTAMP 
  WHERE id = ?
`);

const deleteProductStmt = getDatabase().prepare('DELETE FROM products WHERE id = ?');

// Product functions
export function getProducts(): Product[] {
  return getProductsStmt.all() as Product[];
}

export function getProductsByCategory(category: string): Product[] {
  return getProductsByCategoryStmt.all(category) as Product[];
}

export function getProductById(id: number): Product | null {
  const result = getProductByIdStmt.get(id) as Product | undefined;
  return result || null;
}

export function addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const result = addProductStmt.run(
    product.name,
    product.description,
    product.price,
    product.image,
    product.category,
    product.featured ? 1 : 0,
    product.bestseller ? 1 : 0
  );
  
  // Export to JSON after adding product
  exportProductsToJSON();
  
  return {
    id: result.lastInsertRowid as number,
    ...product,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function updateProduct(id: number, product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): boolean {
  const existingProduct = getProductById(id);
  if (!existingProduct) return false;
  
  const result = updateProductStmt.run(
    product.name ?? existingProduct.name,
    product.description ?? existingProduct.description,
    product.price ?? existingProduct.price,
    product.image ?? existingProduct.image,
    product.category ?? existingProduct.category,
    product.featured !== undefined ? (product.featured ? 1 : 0) : existingProduct.featured ? 1 : 0,
    product.bestseller !== undefined ? (product.bestseller ? 1 : 0) : existingProduct.bestseller ? 1 : 0,
    id
  );
  
  // Export to JSON after updating product
  exportProductsToJSON();
  
  return result.changes > 0;
}

export function deleteProduct(id: number): boolean {
  const result = deleteProductStmt.run(id);
  
  // Export to JSON after deleting product
  exportProductsToJSON();
  
  return result.changes > 0;
}

// Order functions
export function getOrders(): Order[] {
  return getDatabase().prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as Order[];
}

export function getOrderById(id: number): Order | null {
  const result = getDatabase().prepare('SELECT * FROM orders WHERE id = ?').get(id) as Order | undefined;
  return result || null;
}

export function addOrder(order: Omit<Order, 'id' | 'created_at'>): Order {
  const result = getDatabase().prepare(`
    INSERT INTO orders (customer_name, customer_email, customer_phone, items, total_amount, status) 
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    order.customer_name,
    order.customer_email,
    order.customer_phone,
    order.items,
    order.total_amount,
    order.status
  );
  
  return {
    id: result.lastInsertRowid as number,
    ...order,
    created_at: new Date().toISOString()
  };
}

export function updateOrderStatus(id: number, status: string): boolean {
  const result = getDatabase().prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
  return result.changes > 0;
}

// Countdown functions
export function getCountdown(): { end_date: string } | null {
  const result = getDatabase().prepare('SELECT end_date FROM countdown ORDER BY id DESC LIMIT 1').get() as { end_date: string } | undefined;
  return result || null;
}

export function setCountdown(endDate: string): void {
  getDatabase().prepare('INSERT INTO countdown (end_date) VALUES (?)').run(endDate);
}

// Cleanup on process exit
process.on('exit', () => {
  if (db) {
    db.close();
  }
});

process.on('SIGINT', () => {
  if (db) {
    db.close();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (db) {
    db.close();
  }
  process.exit(0);
});


