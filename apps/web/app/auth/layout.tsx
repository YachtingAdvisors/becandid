// Force all auth pages to render dynamically (they need Supabase at runtime)
export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
