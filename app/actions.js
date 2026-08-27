'use server';

import { createClientServer } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';

export async function addToCartServerAction(cartId, variantId, quantity = 1) {
  const supabase = await createClientServer();

  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('variant_id', variantId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from('cart_items')
      .insert({ cart_id: cartId, variant_id: variantId, quantity });
    if (error) throw new Error(error.message);
  }

  revalidatePath('/cart');
  return { success: true };
}
