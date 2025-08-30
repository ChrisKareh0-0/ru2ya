import { NextResponse, NextRequest } from 'next/server';
export const dynamic = 'force-dynamic' as const;
import { getProducts, getFeaturedProducts, getBestsellers } from '@/lib/products';
import { Product } from '@/lib/products';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Products API called');
    
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const bestseller = searchParams.get('bestseller');
    
    console.log('📋 Query params:', { featured, bestseller });
    
    let products: Product[];
    
    if (featured === 'true') {
      console.log('⭐ Getting featured products...');
      products = getFeaturedProducts();
    } else if (bestseller === 'true') {
      console.log('🏆 Getting bestseller products...');
      products = getBestsellers();
    } else {
      console.log('📦 Getting all products...');
      products = getProducts();
    }
    
    console.log(`✅ Retrieved ${products.length} products`);
    
    const response = NextResponse.json(products);
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}