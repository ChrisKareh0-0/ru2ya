import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getOrders } from '@/lib/orders';
import { sendOrderNotification } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Get all orders (admin only - should add auth check)
export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.customerName || !body.customerEmail || !body.customerPhone || !body.items || !body.totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create order
    const order = await createOrder({
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      customerAddress: body.customerAddress,
      items: body.items,
      totalAmount: body.totalAmount,
      status: 'pending',
    });

    // Send email notification (don't block on this)
    sendOrderNotification(order).catch((err) => {
      console.error('Failed to send order notification:', err);
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
