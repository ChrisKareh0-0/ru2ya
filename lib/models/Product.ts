import mongoose, { Schema, Model } from 'mongoose';

export interface IProduct {
    _id?: string;
    id?: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    featured: boolean;
    bestseller: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: true },
        category: { type: String, required: true },
        featured: { type: Boolean, default: false },
        bestseller: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                ret.id = ret._id;
                return ret;
            },
        },
    }
);

// Index for better query performance
ProductSchema.index({ category: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ bestseller: 1 });

const Product: Model<IProduct> =
    mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
