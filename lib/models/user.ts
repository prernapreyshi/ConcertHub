export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string; // hashed password
  createdAt: Date;
}
