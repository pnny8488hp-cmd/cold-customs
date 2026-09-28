export interface CartItem {
  id: string; // unique item id (e.g. 'ultra-bee-brakes' or 'front-plate-cold-customs-with-sticker')
  productId: string;
  variantId?: string;
  variantName?: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
}
