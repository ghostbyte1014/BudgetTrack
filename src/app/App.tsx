import { RouterProvider } from 'react-router';
import { BudgetProvider } from './contexts/BudgetContext';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // Set dark mode
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <BudgetProvider>
      <RouterProvider router={router} />
      <Toaster />
    </BudgetProvider>
  );
}