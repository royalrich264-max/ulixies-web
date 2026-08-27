import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zofzrpigxontxfoedazx.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZnpycGlneG9udHhmb2VkYXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2OTA5OTQsImV4cCI6MjEwMzI2Njk5NH0.dZiwuLiINpXIVhh0sO6uuZE7x8zEKhKHOct4t3Gw1E4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Upload File to product-images Bucket
export async function uploadProductImage(file) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return { success: true, publicUrl, filePath };
  } catch (err) {
    console.error('Storage Upload Error:', err);
    return { success: false, error: err.message };
  }
}

// Delete File from product-images Bucket
export async function deleteProductImage(filePath) {
  try {
    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Storage Delete Error:', err);
    return { success: false, error: err.message };
  }
}
