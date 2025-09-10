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
    
    // Insert order using the existing database schema
    const insertOrder = db.prepare(`
      INSERT INTO orders (customerName, customerEmail, customerPhone, customerAddress, totalAmount, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insertOrder.run(
      customerInfo.firstName + ' ' + customerInfo.lastName,
      customerInfo.email,
      customerInfo.phone,
      customerInfo.address || '',
      totalAmount,
      'pending'
    );

    // Insert order items into separate table
    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (orderId, productId, productName, quantity, price)
      VALUES (?, ?, ?, ?, ?)
    `);

    const orderId = result.lastInsertRowid;
    items.forEach((item: any) => {
      insertOrderItem.run(
        orderId,
        item.product.id,
        item.product.name,
        item.quantity,
        item.product.price
      );
    });

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
    
    // Get all orders with their items using the existing database schema
    const orders = db.prepare(`
      SELECT * FROM orders ORDER BY createdAt DESC
    `).all();

    const ordersWithItems = orders.map((order: any) => {
      const items = db.prepare(`
        SELECT * FROM order_items WHERE orderId = ?
      `).all(order.id);

      return {
        ...order,
        items
      };
    });

    return NextResponse.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
