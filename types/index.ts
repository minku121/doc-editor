export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Document {
  id: string;
  title: string;
  content?: string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActiveUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export interface ShareItem {
  id: string;
  role: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}
