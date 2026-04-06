import type { Metadata } from 'next';
import AdminEmailClient from './AdminEmailClient';

export const metadata: Metadata = {
  title: 'Email Broadcast',
  description: 'Send broadcast emails to Be Candid users.',
};

export default function AdminEmailPage() {
  return <AdminEmailClient />;
}
