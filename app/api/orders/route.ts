import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerInfo, items, totalAmount } = body;

    // Validate required fields
    if (!customerInfo || !items || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate customerInfo fields
    if (!customerInfo.firstName || !customerInfo.email || !customerInfo.phone) {
      return NextResponse.json(
        { error: 'Missing customer information' },
        { status: 400 }
      );
    }

    console.log('Attempting to create order with data:', {
      customerName: customerInfo.firstName + ' ' + customerInfo.lastName,
      email: customerInfo.email,
      phone: customerInfo.phone,
      itemsCount: items.length,
      totalAmount
    });

    const db = getDatabase();
    
    // Insert order using the actual database schema
    const insertOrder = db.prepare(`
      INSERT INTO orders (customer_name, customer_email, customer_phone, items, total_amount, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insertOrder.run(
      customerInfo.firstName + ' ' + customerInfo.lastName,
      customerInfo.email,
      customerInfo.phone,
      JSON.stringify(items),
      totalAmount,
      'pending'
    );

    const orderId = result.lastInsertRowid;
    console.log('Order created successfully with ID:', orderId);

    return NextResponse.json(
      { 
        success: true, 
        orderId,
        message: 'Order created successfully' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Detailed error creating order:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return NextResponse.json(
      { error: `Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = getDatabase();
    
    // Get all orders using the actual database schema
    const orders = db.prepare(`
      SELECT * FROM orders ORDER BY created_at DESC
    `).all();

    const ordersWithParsedItems = orders.map((order: any) => {
      return {
        ...order,
        items: JSON.parse(order.items)
      };
    });

    return NextResponse.json(ordersWithParsedItems);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
