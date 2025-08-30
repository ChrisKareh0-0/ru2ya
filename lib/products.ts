import { getDatabase, Product } from './database';

export type { Product };

export function getProducts(): Product[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM products ORDER BY createdAt DESC');
  return stmt.all() as Product[];
}

export function getProductById(id: number): Product | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
  const product = stmt.get(id) as Product | undefined;
  return product || null;
}

export function getFeaturedProducts(): Product[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM products WHERE featured = 1 ORDER BY createdAt DESC');
  return stmt.all() as Product[];
}

export function getBestsellers(): Product[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM products WHERE bestseller = 1 ORDER BY createdAt DESC');
  return stmt.all() as Product[];
}

export function getBestsellersCount(): number {
  const db = getDatabase();
  const stmt = db.prepare('SELECT COUNT(*) as count FROM products WHERE bestseller = 1');
  const result = stmt.get() as { count: number };
  return result.count;
}

export function addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO products (name, description, price, image, category, featured, bestseller)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    productData.name,
    productData.description,
    productData.price,
    productData.image,
    productData.category,
    productData.featured ? 1 : 0,
    productData.bestseller ? 1 : 0
  );
  
  const newProduct = getProductById(result.lastInsertRowid as number);
  if (!newProduct) {
    throw new Error('Failed to create product');
  }
  return newProduct;
}

export function updateProduct(id: number, productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Product {
  const db = getDatabase();
  
  // Build dynamic update query
  const updates: string[] = [];
  const values: any[] = [];
  
  if (productData.name !== undefined) {
    updates.push('name = ?');
    values.push(productData.name);
  }
  if (productData.description !== undefined) {
    updates.push('description = ?');
    values.push(productData.description);
  }
  if (productData.price !== undefined) {
    updates.push('price = ?');
    values.push(productData.price);
  }
  if (productData.image !== undefined) {
    updates.push('image = ?');
    values.push(productData.image);
  }
  if (productData.category !== undefined) {
    updates.push('category = ?');
    values.push(productData.category);
  }
  if (productData.featured !== undefined) {
    updates.push('featured = ?');
    values.push(productData.featured ? 1 : 0);
  }
  if (productData.bestseller !== undefined) {
    updates.push('bestseller = ?');
    values.push(productData.bestseller ? 1 : 0);
  }
  
  updates.push('updatedAt = CURRENT_TIMESTAMP');
  values.push(id);
  
  const stmt = db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...values);
  
  const updatedProduct = getProductById(id);
  if (!updatedProduct) {
    throw new Error('Failed to update product');
  }
  return updatedProduct;
}

export function deleteProduct(id: number): boolean {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM products WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function getProductsCount(): number {
  const db = getDatabase();
  const stmt = db.prepare('SELECT COUNT(*) as count FROM products');
  const result = stmt.get() as { count: number };
  return result.count;
}

export function getCategories(): string[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category');
  const categories = stmt.all() as { category: string }[];
  return categories.map(c => c.category);
}

export function searchProducts(query: string): Product[] {
  const db = getDatabase();
  const searchTerm = `%${query}%`;
  const stmt = db.prepare(`
    SELECT * FROM products 
    WHERE name LIKE ? OR description LIKE ? OR category LIKE ?
    ORDER BY createdAt DESC
  `);
  return stmt.all(searchTerm, searchTerm, searchTerm) as Product[];
}