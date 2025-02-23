export interface AuthResponse {
    id: number;
    email: string;
    name: string;
    token: string;
    isUserVerified: boolean;
    refreshToken: string;
  }