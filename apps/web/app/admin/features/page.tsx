import type { Metadata } from 'next';
import AdminFeaturesClient from './AdminFeaturesClient';

export const metadata: Metadata = {
  title: 'Feature Flags',
  description: 'Toggle platform features on and off.',
};

export default function AdminFeaturesPage() {
  return <AdminFeaturesClient />;
}
