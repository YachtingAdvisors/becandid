import type { Metadata } from 'next';
import AdminUsersClient from './AdminUsersClient';

export const metadata: Metadata = {
  title: 'Users',
  description: 'Manage platform users.',
};

export default function AdminUsersPage() {
  return <AdminUsersClient />;
}
