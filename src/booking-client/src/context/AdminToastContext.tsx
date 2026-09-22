import { createContext, useContext } from 'react';

export interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'info';
}

export interface AdminToastContextType {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminToastContext = createContext<AdminToastContextType>({
  showToast: () => {},
});

export const useAdminToast = () => useContext(AdminToastContext);
