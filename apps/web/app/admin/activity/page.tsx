import type { Metadata } from 'next';
import AdminActivityClient from './AdminActivityClient';

export const metadata: Metadata = {
  title: 'Activity',
  description: 'Platform-wide activity feed.',
};

export default function AdminActivityPage() {
  return <AdminActivityClient />;
}
