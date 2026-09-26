export interface Order {
  id: string; // e.g. "UBB-84920"
  createdAt: string; // ISO date string
  customer: {
    fullName: string;
    phone: string;
    email: string;
  };
  delivery: {
    method: 'paczkomat' | 'courier';
    paczkomatName?: string;
    addressOrLocker: string;
    city: string;
    postalCode: string;
  };
  items: {
    title: string;
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
  };
  payment: {
    method: 'cod' | 'blik_phone' | 'transfer';
    status: 'Oczekuje na wpłatę' | 'Opłacone' | 'Za pobraniem';
  };
  fulfillment: {
    status: 'Nowe' | 'Przygotowane' | 'Wysłane' | 'Zrealizowane' | 'Anulowane';
    trackingNumber?: string;
    notes?: string;
  };
}
