import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

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

    const db = getDatabase();
    const orderId = uuidv4();

    // Insert order
    const insertOrder = db.prepare(`
      INSERT INTO orders (id, customerName, email, phone, address, city, postalCode, country, totalAmount, status, paymentMethod)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertOrder.run(
      orderId,
      customerInfo.firstName + ' ' + customerInfo.lastName,
      customerInfo.email,
      customerInfo.phone,
      customerInfo.address,
      customerInfo.city,
      customerInfo.postalCode,
      customerInfo.country,
      totalAmount,
      'pending',
      'Cash on Delivery'
    );

    // Insert order items
    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (orderId, productId, productName, quantity, price)
      VALUES (?, ?, ?, ?, ?)
    `);

    items.forEach((item: any) => {
      insertOrderItem.run(
        orderId,
        item.product.id,
        item.product.name,
        item.quantity,
        item.product.price
      );
    });

    return NextResponse.json(
      { 
        success: true, 
        orderId,
        message: 'Order created successfully' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = getDatabase();
    
    // Get all orders with their items
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
