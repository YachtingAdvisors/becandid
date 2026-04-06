import type { Metadata } from 'next';
import AdminAuditClient from './AdminAuditClient';

export const metadata: Metadata = {
  title: 'Audit Log',
  description: 'Audit log viewer for Be Candid administrators.',
};

export default function AdminAuditPage() {
  return <AdminAuditClient />;
}
