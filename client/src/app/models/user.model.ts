export interface User{
    id: number;
    email: string;
    password: string;
    name: string;
    role: string;
    createdAt: Date;
    isUserVerified: boolean;
}