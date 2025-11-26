import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/lib/orders';
import { generateSingleOrderPDF } from '@/lib/pdf';
import { cookies } from 'next/headers';

function isAuthenticated() {
    const cookieStore = cookies();
    return cookieStore.get('admin-token')?.value === 'authenticated';
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    if (!isAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format');

        const order = await getOrderById(id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // If PDF export is requested
        if (format === 'pdf') {
            const pdfBuffer = generateSingleOrderPDF(order);

            return new NextResponse(pdfBuffer as any, {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="order-${id}.pdf"`,
                },
            });
        }

        // Return JSON by default
        return NextResponse.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
}
