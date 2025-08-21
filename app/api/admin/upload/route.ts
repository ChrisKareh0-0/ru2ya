import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fcmkzwcemtlnudsmtkdt.supabase.co';
// Use service_role key for admin operations
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbWt6d2NlbXRsbnVkc210a2R0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTc4MTA3MCwiZXhwIjoyMDcxMzU3MDcwfQ.cFGfuMyuq3E3h4VJyseCHKf751QK7hRL0a50hawJfy0'; // Replace with your service_role key

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Upload API called');
    
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      console.log('❌ No file provided');
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    console.log('📁 File received:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('❌ Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ File too large:', file.size);
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `product-${timestamp}.${fileExtension}`;
    
    console.log('📝 Generated filename:', fileName);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    console.log('💾 File converted to buffer, size:', buffer.length);

    // Upload to Supabase Storage
    console.log('☁️ Uploading to Supabase...');
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Supabase upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload image to storage: ' + error.message },
        { status: 500 }
      );
    }

    console.log('✅ Upload successful:', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    console.log('🔗 Public URL generated:', publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('💥 Unexpected error in upload API:', error);
    return NextResponse.json(
      { error: 'Failed to upload image: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
