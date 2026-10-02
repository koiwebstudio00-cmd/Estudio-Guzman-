export interface AuthenticatedUser {
  id: string;
  version: number;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: {
    id: string;
    code: string;
    name: string;
  };
  permissions: string[];
}
