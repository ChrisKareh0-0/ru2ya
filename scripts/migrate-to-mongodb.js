const sqlite3 = require('sqlite3').verbose();
const mongoose = require('mongoose');
const path = require('path');

// MongoDB connection URI from environment
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI environment variable is not set');
    console.log('\n📝 Please add MONGODB_URI to your .env.local file');
    console.log('Example: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ru2ya\n');
    process.exit(1);
}

// SQLite database path
const SQLITE_DB_PATH = path.join(__dirname, '../data/ru2ya.db');

// MongoDB schemas
const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    featured: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
}, {
    timestamps: true,
});

const OrderItemSchema = new mongoose.Schema({
    productId: { type: String },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'pending' },
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);

// Read data from SQLite
async function readSQLiteData() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(SQLITE_DB_PATH, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                reject(new Error(`Failed to open SQLite database: ${err.message}`));
                return;
            }
        });

        const data = {
            products: [],
            orders: [],
            orderItems: []
        };

        // Read products
        db.all('SELECT * FROM products', [], (err, rows) => {
            if (err) {
                reject(new Error(`Failed to read products: ${err.message}`));
                return;
            }
            data.products = rows;

            // Read orders
            db.all('SELECT * FROM orders', [], (err, rows) => {
                if (err) {
                    reject(new Error(`Failed to read orders: ${err.message}`));
                    return;
                }
                data.orders = rows;

                // Read order items
                db.all('SELECT * FROM order_items', [], (err, rows) => {
                    if (err) {
                        reject(new Error(`Failed to read order items: ${err.message}`));
                        return;
                    }
                    data.orderItems = rows;

                    db.close((err) => {
                        if (err) {
                            console.warn('⚠️  Warning: Failed to close SQLite database:', err.message);
                        }
                        resolve(data);
                    });
                });
            });
        });
    });
}

// Migrate products to MongoDB
async function migrateProducts(products) {
    console.log(`\n📦 Migrating ${products.length} products...`);

    const migratedProducts = [];
    for (const product of products) {
        try {
            const newProduct = await Product.create({
                name: product.name,
                description: product.description,
                price: product.price,
                image: product.image,
                category: product.category,
                featured: product.featured === 1,
                bestseller: product.bestseller === 1,
            });
            migratedProducts.push(newProduct);
            console.log(`  ✅ Migrated product: ${product.name}`);
        } catch (error) {
            console.error(`  ❌ Failed to migrate product ${product.name}:`, error.message);
        }
    }

    return migratedProducts;
}

// Migrate orders to MongoDB
async function migrateOrders(orders, orderItems) {
    console.log(`\n📋 Migrating ${orders.length} orders...`);

    const migratedOrders = [];
    for (const order of orders) {
        try {
            // Get order items for this order
            const items = orderItems
                .filter(item => item.orderId === order.id)
                .map(item => ({
                    productId: item.productId?.toString(),
                    productName: item.productName,
                    quantity: item.quantity,
                    price: item.price,
                }));

            const newOrder = await Order.create({
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                customerPhone: order.customerPhone,
                customerAddress: order.customerAddress,
                items: items,
                totalAmount: order.totalAmount,
                status: order.status,
            });

            migratedOrders.push(newOrder);
            console.log(`  ✅ Migrated order: ${order.customerName} - $${order.totalAmount}`);
        } catch (error) {
            console.error(`  ❌ Failed to migrate order ${order.id}:`, error.message);
        }
    }

    return migratedOrders;
}

// Main migration function
async function migrate() {
    console.log('🚀 Starting MongoDB Migration\n');
    console.log('📍 SQLite Database:', SQLITE_DB_PATH);
    console.log('📍 MongoDB URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

    try {
        // Connect to MongoDB
        console.log('\n🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB successfully\n');

        // Check if data already exists
        const existingProducts = await Product.countDocuments();
        const existingOrders = await Order.countDocuments();

        if (existingProducts > 0 || existingOrders > 0) {
            console.log('⚠️  Warning: MongoDB database already contains data:');
            console.log(`   - Products: ${existingProducts}`);
            console.log(`   - Orders: ${existingOrders}`);
            console.log('\n❓ Do you want to clear existing data and re-migrate? (y/N)');

            // For automated migration, we'll skip if data exists
            console.log('ℹ️  Skipping migration - data already exists');
            console.log('💡 To force re-migration, manually delete collections in MongoDB Atlas\n');
            await mongoose.disconnect();
            return;
        }

        // Read SQLite data
        console.log('📖 Reading data from SQLite...');
        const sqliteData = await readSQLiteData();
        console.log(`✅ Found ${sqliteData.products.length} products and ${sqliteData.orders.length} orders\n`);

        // Migrate products
        const migratedProducts = await migrateProducts(sqliteData.products);

        // Migrate orders
        const migratedOrders = await migrateOrders(sqliteData.orders, sqliteData.orderItems);

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 Migration Summary');
        console.log('='.repeat(50));
        console.log(`✅ Products migrated: ${migratedProducts.length}/${sqliteData.products.length}`);
        console.log(`✅ Orders migrated: ${migratedOrders.length}/${sqliteData.orders.length}`);
        console.log('='.repeat(50));

        if (migratedProducts.length === sqliteData.products.length &&
            migratedOrders.length === sqliteData.orders.length) {
            console.log('\n🎉 Migration completed successfully!\n');
            console.log('📝 Next steps:');
            console.log('   1. Verify data in MongoDB Atlas dashboard');
            console.log('   2. Test the application: npm run dev');
            console.log('   3. Add MONGODB_URI to Render environment variables');
            console.log('   4. Deploy to production\n');
        } else {
            console.log('\n⚠️  Migration completed with some errors');
            console.log('   Please check the error messages above\n');
        }

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB\n');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('\nStack trace:', error.stack);
        process.exit(1);
    }
}

// Run migration
migrate();
