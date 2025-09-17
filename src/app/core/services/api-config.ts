export const API_CONFIG = {
    baseUrl: 'https://ecommerce.routemisr.com',
    endpoints: {
        auth: {
            register: '/api/v1/auth/signup',
            login: '/api/v1/auth/signin',
            forgotPassword: '/api/v1/auth/forgotPasswords',
            verifyResetCode: '/api/v1/auth/verifyResetCode',
            resetPassword: '/api/v1/auth/resetPassword'
        },
        products: '/api/v1/products',
        categories: '/api/v1/categories',
        brands: '/api/v1/brands',
        cart: '/api/v1/cart',
        wishlist: '/api/v1/wishlist',
        orders: '/api/v1/orders',
        addresses: '/api/v1/addresses',
        coupons: '/api/v1/coupons',
        reviews: '/api/v1/reviews'
    }
} as const; 