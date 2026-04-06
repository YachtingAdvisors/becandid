import type { Metadata } from 'next';
import AdminExportClient from './AdminExportClient';

export const metadata: Metadata = {
  title: 'Data Export',
  description: 'Export platform data as CSV.',
};

export default function AdminExportPage() {
  return <AdminExportClient />;
}
