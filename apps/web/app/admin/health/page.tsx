import type { Metadata } from 'next';
import AdminHealthClient from './AdminHealthClient';

export const metadata: Metadata = {
  title: 'System Health',
  description: 'System health monitoring for Be Candid administrators.',
};

export default function AdminHealthPage() {
  return <AdminHealthClient />;
}
