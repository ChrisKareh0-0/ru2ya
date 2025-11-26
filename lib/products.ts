import { connectDB } from './mongodb';
import Product, { IProduct } from './models/Product';

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

function toProduct(doc: IProduct): Product {
    return {
        id: doc._id?.toString() || doc.id || '',
        name: doc.name,
        description: doc.description,
        price: doc.price,
        image: doc.image,
        category: doc.category,
        featured: doc.featured,
        bestseller: doc.bestseller,
        createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    };
}

export async function getProducts(): Promise<Product[]> {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return products.map(toProduct);
}

export async function getProductsPaginated(limit: number, offset: number): Promise<Product[]> {
    await connectDB();
    const products = await Product.find()
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();
    return products.map(toProduct);
}

export async function getProductById(id: number | string): Promise<Product | null> {
    await connectDB();
    const product = await Product.findById(id).lean();
    return product ? toProduct(product) : null;
}

export async function getFeaturedProducts(): Promise<Product[]> {
    await connectDB();
    const products = await Product.find({ featured: true }).sort({ createdAt: -1 }).lean();
    return products.map(toProduct);
}

export async function getBestsellers(): Promise<Product[]> {
    await connectDB();
    const products = await Product.find({ bestseller: true }).sort({ createdAt: -1 }).lean();
    return products.map(toProduct);
}

export async function getBestsellersCount(): Promise<number> {
    await connectDB();
    return await Product.countDocuments({ bestseller: true });
}

export async function addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    await connectDB();
    const product = await Product.create(productData);
    return toProduct(product.toObject());
}

export async function updateProduct(
    id: number | string,
    productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Product> {
    await connectDB();
    const product = await Product.findByIdAndUpdate(id, productData, { new: true }).lean();
    if (!product) {
        throw new Error('Product not found');
    }
    return toProduct(product);
}

export async function deleteProduct(id: number | string): Promise<boolean> {
    await connectDB();
    const result = await Product.findByIdAndDelete(id);
    return !!result;
}

export async function getProductsCount(): Promise<number> {
    await connectDB();
    return await Product.countDocuments();
}

export async function getCategories(): Promise<string[]> {
    await connectDB();
    const categories = await Product.distinct('category');
    return categories.filter(Boolean).sort();
}

export async function searchProducts(query: string): Promise<Product[]> {
    await connectDB();
    const products = await Product.find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { category: { $regex: query, $options: 'i' } },
        ],
    })
        .sort({ createdAt: -1 })
        .lean();
    return products.map(toProduct);
}

export type { Product };
