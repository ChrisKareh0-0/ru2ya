import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fcmkzwcemtlnudsmtkdt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbWt6d2NlbXRsbnVkc210a2R0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTc4MTA3MCwiZXhwIjoyMDcxMzU3MDcwfQ.cFGfuMyuq3E3h4VJyseCHKf751QK7hRL0a50hawJfy0';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (reduced to 2MB for free tier)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 2MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `product-${timestamp}.${fileExtension}`;

    // Convert file to buffer more efficiently
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload image: ' + error.message },
        { status: 500 }
      );
    }

    // Prefer a long-lived signed URL to avoid bucket visibility issues
    const { data: signedData, error: signedError } = await supabase.storage
      .from('product-images')
      .createSignedUrl(fileName, 60 * 60 * 24 * 365 * 10); // 10 years

    if (signedError || !signedData?.signedUrl) {
      // Fallback to public URL if signed URL not available
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return NextResponse.json({
        success: true,
        url: urlData.publicUrl,
        message: 'Image uploaded successfully'
      });
    }

    return NextResponse.json({
      success: true,
      url: signedData.signedUrl,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
