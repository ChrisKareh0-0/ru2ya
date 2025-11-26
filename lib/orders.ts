import { connectDB } from './mongodb';
import Order, { IOrder, IOrderItem } from './models/Order';

export interface OrderItem {
    productId?: string;
    productName: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress?: string;
    items: OrderItem[];
    totalAmount: number;
    status: string;
    createdAt: string;
    updatedAt?: string;
}

function toOrder(doc: IOrder): Order {
    return {
        id: doc._id?.toString() || doc.id || '',
        customerName: doc.customerName,
        customerEmail: doc.customerEmail,
        customerPhone: doc.customerPhone,
        customerAddress: doc.customerAddress,
        items: doc.items,
        totalAmount: doc.totalAmount,
        status: doc.status,
        createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: doc.updatedAt?.toISOString(),
    };
}

export async function getOrders(): Promise<Order[]> {
    await connectDB();
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    return orders.map(toOrder);
}

export async function getOrderById(id: string): Promise<Order | null> {
    await connectDB();
    const order = await Order.findById(id).lean();
    return order ? toOrder(order) : null;
}

export async function createOrder(
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Order> {
    await connectDB();
    const order = await Order.create(orderData);
    return toOrder(order.toObject());
}

export async function updateOrderStatus(id: string, status: string): Promise<boolean> {
    await connectDB();
    const result = await Order.findByIdAndUpdate(id, { status }, { new: true });
    return !!result;
}

export async function deleteOrder(id: string): Promise<boolean> {
    await connectDB();
    const result = await Order.findByIdAndDelete(id);
    return !!result;
}

export type { Order, OrderItem };
