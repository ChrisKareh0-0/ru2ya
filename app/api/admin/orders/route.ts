import { NextRequest, NextResponse } from 'next/server';
import { getOrders } from '@/lib/orders';
import { generateOrdersPDF } from '@/lib/pdf';
import { cookies } from 'next/headers';

function isAuthenticated() {
    const cookieStore = cookies();
    return cookieStore.get('admin-token')?.value === 'authenticated';
}

export async function GET(request: NextRequest) {
    if (!isAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format');

        const orders = await getOrders();

        // If PDF export is requested
        if (format === 'pdf') {
            const pdfBuffer = generateOrdersPDF(orders);

            return new NextResponse(pdfBuffer, {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="orders-${new Date().toISOString().split('T')[0]}.pdf"`,
                },
            });
        }

        // Return JSON by default
        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error exporting orders:', error);
        return NextResponse.json({ error: 'Failed to export orders' }, { status: 500 });
    }
}
