export interface Address {
    _id: string;
    name: string;
    details: string;
    phone: string;
    city?: string;
}

export interface OrderItem {
    _id: string;
    product: {
        _id: string;
        title: string;
        imageCover: string;
        price: number;
    };
    price: number;
    count: number;
}

export interface Order {
    _id: string;
    user: string;
    cartItems: OrderItem[];
    totalOrderPrice: number;
    isPaid: boolean;
    isDelivered: boolean;
    createdAt: string;
    shippingAddress?: {
        details: string;
        phone: string;
        city: string;
    };
    taxPrice?: number;
    shippingPrice?: number;
} 