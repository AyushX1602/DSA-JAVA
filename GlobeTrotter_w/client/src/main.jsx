import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { Toaster } from 'sonner';
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';
import { Provider as JotaiProvider, useSetAtom } from 'jotai';
import { setAuthStateAtom } from '@/lib/auth.atoms';
import { me as meApi } from '@/api/auth';
import Cookies from 'js-cookie';

const queryClient = new QueryClient();

export const BootstrapAuth = () => {
  const setAuthState = useSetAtom(setAuthStateAtom);
  const qc = useQueryClient();
  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (!token) return;
    meApi()
      .then((user) => {
        setAuthState({ token, user });
        qc.setQueryData(['auth:me'], { user });
      })
      .catch(() => {
        Cookies.remove('accessToken');
        Cookies.remove('authUser');
      });
  }, [qc, setAuthState]);
  return null;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <Toaster richColors />
        <BootstrapAuth />
        <App />
      </JotaiProvider>
    </QueryClientProvider>
  </StrictMode>,
);
