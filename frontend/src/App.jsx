import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from '@/store';
import { fetchMe } from '@/store/slices/authSlice';
import AppRoutes from '@/routes';

store.dispatch(fetchMe());

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif' },
            duration: 3000,
          }}
        />
      </BrowserRouter>
    </Provider>
  );
}
