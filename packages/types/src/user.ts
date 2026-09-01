export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateUserPayload = Omit<User, "id" | "createdAt" | "updatedAt">;
