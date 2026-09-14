declare const BrandSymbol: unique symbol;

export type Brand<T, B> = T & { readonly [BrandSymbol]: B };
