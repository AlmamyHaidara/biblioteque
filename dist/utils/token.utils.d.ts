type Role = 'ADMIN' | 'LIBRARIAN' | 'USER';
interface TokenPayload {
    id: string;
    email: string;
    role: Role;
}
export declare const generateAccessToken: (payload: TokenPayload) => string;
export declare const generateRefreshToken: (payload: TokenPayload) => Promise<string>;
export declare const verifyRefreshToken: (token: string) => Promise<TokenPayload>;
export declare const deleteRefreshToken: (token: string) => Promise<void>;
export declare const deleteAllUserRefreshTokens: (userId: string) => Promise<void>;
export {};
