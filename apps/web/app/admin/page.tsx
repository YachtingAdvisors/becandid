import type { Metadata } from 'next';
import AdminDashboardClient from './AdminDashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Platform-wide metrics and health overview for Be Candid administrators.',
};

export default function AdminPage() {
  return <AdminDashboardClient />;
}
