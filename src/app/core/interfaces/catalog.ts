export interface Category {
    _id: string;
    name: string;
    slug?: string;
    image?: string;
}

export interface Brand {
    _id: string;
    name: string;
    slug?: string;
    image?: string;
}

export interface Product {
    _id: string;
    title: string;
    slug?: string;
    description?: string;
    imageCover?: string;
    images?: string[];
    category?: Category;
    brand?: Brand;
    price: number;
    priceAfterDiscount?: number;
    ratingsAverage?: number;
    ratingsQuantity?: number;
    sold?: number;
    quantity?: number;
}

export interface Review {
    _id: string;
    title?: string;
    ratings: number;
    user: { _id: string; name: string };
    product: string;
    createdAt: string;
}

export interface CartItem {
    _id: string;
    product: Product;
    price: number;
    count: number;
}

export interface Cart {
    _id: string;
    cartOwner: string;
    products: CartItem[];
    totalCartPrice: number;
}

export interface WishlistItem {
    _id: string;
    product: Product | string;
} 