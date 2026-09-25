declare global {
  namespace App {
    interface Locals {
      user: {
        id: number;
        username: string;
        role: string;
        fullName: string;
      } | null;
      flash: {
        type: 'success' | 'error' | 'info' | 'warning';
        message: string;
      } | null;
    }
  }
}

export {};