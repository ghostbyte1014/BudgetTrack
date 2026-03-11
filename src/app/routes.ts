import { createBrowserRouter } from 'react-router';
import { AuthPage } from './components/AuthPage';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { MonthlyHistory } from './components/MonthlyHistory';
import { FixedCosts } from './components/FixedCosts';
import { Analytics } from './components/Analytics';
import { HowItWorks } from './components/HowItWorks';
import { ProfilePage } from './components/ProfilePage';
import { NotificationsPage } from './components/NotificationsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AuthPage,
  },
  {
    path: '/',
    Component: Layout,
    children: [
      {
        path: 'dashboard',
        Component: Dashboard,
      },
      {
        path: 'transactions',
        Component: Transactions,
      },
      {
        path: 'history',
        Component: MonthlyHistory,
      },
      {
        path: 'fixed-costs',
        Component: FixedCosts,
      },
      {
        path: 'analytics',
        Component: Analytics,
      },
      {
        path: 'how-it-works',
        Component: HowItWorks,
      },
      {
        path: 'profile',
        Component: ProfilePage,
      },
      {
        path: 'notifications',
        Component: NotificationsPage,
      },
    ],
  },
]);