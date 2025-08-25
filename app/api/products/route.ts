import { NextResponse, NextRequest } from 'next/server';
export const dynamic = 'force-dynamic' as const;
import { getProducts, getFeaturedProducts, getBestsellers } from '@/lib/products';
import { Product } from '@/lib/products';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const bestseller = searchParams.get('bestseller');
    
    let products: Product[];
    
    if (featured === 'true') {
      products = getFeaturedProducts();
    } else if (bestseller === 'true') {
      products = getBestsellers();
    } else {
      products = getProducts();
    }
    
    const response = NextResponse.json(products);
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}