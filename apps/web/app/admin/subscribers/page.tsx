import type { Metadata } from 'next';
import AdminSubscribersClient from './AdminSubscribersClient';

export const metadata: Metadata = {
  title: 'Email Subscribers',
  description: 'View blog and lead email subscribers.',
};

export default function AdminSubscribersPage() {
  return <AdminSubscribersClient />;
}
