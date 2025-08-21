import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Update order status
    const updateOrder = db.prepare(`
      UPDATE orders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
    `);

    const result = updateOrder.run(status, id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Order status updated successfully' }
    );
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = getDatabase();
    
    // Delete order items first (due to foreign key constraint)
    const deleteOrderItems = db.prepare(`
      DELETE FROM order_items WHERE orderId = ?
    `);
    deleteOrderItems.run(id);
    
    // Delete the order
    const deleteOrder = db.prepare(`
      DELETE FROM orders WHERE id = ?
    `);
    
    const result = deleteOrder.run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Order deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
