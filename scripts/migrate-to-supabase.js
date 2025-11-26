const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fcmkzwcemtlnudsmtkdt.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbWt6d2NlbXRsbnVkc210a2R0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTc4MTA3MCwiZXhwIjoyMDcxMzU3MDcwfQ.cFGfuMyuq3E3h4VJyseCHKf751QK7hRL0a50hawJfy0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log('🚀 Starting migration to Supabase...');

    // Path to products.json
    const jsonPath = path.join(__dirname, '..', 'data', 'products.json');

    if (!fs.existsSync(jsonPath)) {
        console.error('❌ products.json not found at:', jsonPath);
        return;
    }

    try {
        const jsonData = fs.readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(jsonData);

        let products = [];
        if (Array.isArray(data)) {
            products = data;
        } else if (data.products && Array.isArray(data.products)) {
            products = data.products;
        } else {
            console.error('❌ Invalid JSON structure');
            return;
        }

        console.log(`📦 Found ${products.length} products to migrate`);

        for (const product of products) {
            console.log(`Processing: ${product.name}`);

            // Check if product already exists
            const { data: existing } = await supabase
                .from('products')
                .select('id')
                .eq('name', product.name)
                .single();

            if (existing) {
                console.log(`  ⚠️  Product already exists, skipping...`);
                continue;
            }

            // Insert product
            const { error } = await supabase
                .from('products')
                .insert({
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    image: product.image,
                    category: product.category,
                    featured: product.featured || false,
                    bestseller: product.bestseller || false
                });

            if (error) {
                console.error(`  ❌ Error inserting product: ${error.message}`);
            } else {
                console.log(`  ✅ Inserted successfully`);
            }
        }

        console.log('🎉 Products migration completed!');

        // Migrate countdown
        console.log('⏳ Starting countdown migration...');
        const countdownPath = path.join(__dirname, '..', 'data', 'countdown.json');
        if (fs.existsSync(countdownPath)) {
            const countdownData = JSON.parse(fs.readFileSync(countdownPath, 'utf8'));

            // Construct ISO date string
            const isoDate = `${countdownData.targetDate}T${countdownData.targetTime}:00Z`;

            const { error: countdownError } = await supabase
                .from('countdown')
                .insert({
                    title: countdownData.title,
                    end_date: isoDate,
                    is_visible: countdownData.isVisible
                });

            if (countdownError) {
                console.error('❌ Error migrating countdown:', countdownError.message);
            } else {
                console.log('✅ Countdown migrated successfully');
            }
        } else {
            console.log('ℹ️  No countdown data found to migrate');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

migrate();
