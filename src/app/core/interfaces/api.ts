export interface ApiListResponse<T> {
    results: number;
    metadata?: unknown;
    data: T[];
}

export interface ApiItemResponse<T> {
    data: T;
}

export interface Pagination {
    currentPage: number;
    numberOfPages: number;
    limit: number;
    total?: number;
} 