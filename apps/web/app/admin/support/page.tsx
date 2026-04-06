import type { Metadata } from 'next';
import AdminSupportClient from './AdminSupportClient';

export const metadata: Metadata = {
  title: 'Support',
  description: 'User lookup and support tools for Be Candid administrators.',
};

export default function AdminSupportPage() {
  return <AdminSupportClient />;
}
