import { NextResponse, NextRequest } from 'next/server';
export const dynamic = 'force-dynamic' as const;
import { getProducts, getFeaturedProducts, getBestsellers, getProductsPaginated } from '@/lib/products';
import { Product } from '@/lib/products';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const bestseller = searchParams.get('bestseller');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const listMode = searchParams.get('list') === '1' || searchParams.get('list') === 'true';
    const limit = limitParam ? Math.max(1, Math.min(50, parseInt(limitParam, 10) || 10)) : undefined;
    const offset = offsetParam ? Math.max(0, parseInt(offsetParam, 10) || 0) : undefined;
    
    let products: Product[];
    
    if (featured === 'true') {
      products = getFeaturedProducts();
    } else if (bestseller === 'true') {
      products = getBestsellers();
    } else if (limit !== undefined && offset !== undefined) {
      products = getProductsPaginated(limit, offset);
    } else {
      products = getProducts();
    }
    
    // In list mode, trim image to first URL and omit heavy fields if needed
    const response = NextResponse.json(
      listMode
        ? products.map(p => ({
            ...p,
            image: (p.image || '').split(',')[0]?.trim() || ''
          }))
        : products
    );
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    if (error instanceof Error) {
      console.error('❌ Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}