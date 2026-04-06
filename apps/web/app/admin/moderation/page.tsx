import type { Metadata } from 'next';
import ModerationClient from './ModerationClient';

export const metadata: Metadata = {
  title: 'Moderation',
  description: 'Content moderation queue for Be Candid community posts.',
};

export default function ModerationPage() {
  return <ModerationClient />;
}
