/**
 * Glass card used by every auth page (signin, signup, reset, etc.).
 * Pairs with the shared AuthLayout in app/auth/layout.tsx which provides
 * the dark background, blur orbs, and top nav bar.
 */
export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[2rem] shadow-[0_4px_40px_rgba(0,0,0,0.3)] p-10 sm:p-12 transition-all duration-200 hover:ring-white/[0.1]"
      style={{
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      {children}
    </div>
  );
}
