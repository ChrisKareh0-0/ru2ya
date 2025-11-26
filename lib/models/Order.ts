import mongoose, { Schema, Model } from 'mongoose';

export interface IOrderItem {
    productId?: string;
    productName: string;
    quantity: number;
    price: number;
}

export interface IOrder {
    _id?: string;
    id?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress?: string;
    items: IOrderItem[];
    totalAmount: number;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
    productId: { type: String },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
});

const OrderSchema = new Schema<IOrder>(
    {
        customerName: { type: String, required: true },
        customerEmail: { type: String, required: true },
        customerPhone: { type: String, required: true },
        customerAddress: { type: String },
        items: [OrderItemSchema],
        totalAmount: { type: Number, required: true },
        status: { type: String, default: 'pending' },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                ret.id = ret._id.toString();
                return ret;
            },
        },
    }
);

// Index for better query performance
OrderSchema.index({ customerEmail: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

const Order: Model<IOrder> =
    mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
