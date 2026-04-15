'use client';

import { useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';

const FEEDBACK_TYPES = [
  { key: 'idea', label: 'I have an idea', icon: 'lightbulb' },
  { key: 'need', label: 'I need this feature', icon: 'add_circle' },
  { key: 'bug', label: 'Something is broken', icon: 'bug_report' },
  { key: 'story', label: 'Share my story', icon: 'favorite' },
  { key: 'question', label: 'I have a question', icon: 'help' },
  { key: 'other', label: 'Something else', icon: 'chat' },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function BuildWithUs() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sharePage, setSharePage] = useState(true);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast('Image must be under 5 MB', 'error', 3000);
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast('Please upload an image file', 'error', 3000);
      return;
    }

    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = () => setScreenshotPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!type || !message.trim()) return;
    setSending(true);
    try {
      // Build form data to support file upload
      const formData = new FormData();
      formData.append('type', type);
      formData.append('message', message.trim());
      if (sharePage) {
        formData.append('pageUrl', window.location.href);
        formData.append('pagePath', pathname);
      }
      if (screenshot) {
        formData.append('screenshot', screenshot);
      }

      const res = await fetch('/api/support/report', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        toast('Thank you for building with us', 'success', 4000);
        setOpen(false);
        setType('');
        setMessage('');
        setSharePage(true);
        removeScreenshot();
      } else {
        toast('Failed to send — try the email link below', 'error', 4000);
      }
    } catch {
      toast('Failed to send — try the email link below', 'error', 4000);
    }
    setSending(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all font-label font-bold text-xs"
        aria-label="Build with us"
      >
        <span className="material-symbols-outlined text-lg">construction</span>
        Build With Us
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-80 bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-2xl overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="build-with-us-title"
      onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-outline-variant/30 bg-gradient-to-r from-primary/5 to-tertiary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-primary">construction</span>
            <h3 id="build-with-us-title" className="font-headline text-sm font-bold text-on-surface">Build With Us</h3>
          </div>
          <button onClick={() => setOpen(false)} className="text-on-surface-variant hover:text-on-surface cursor-pointer" aria-label="Close" autoFocus>
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <p className="text-[10px] text-on-surface-variant font-body mt-1 leading-relaxed">
          This app is built with the needs of our community at the forefront. Your voice shapes what we build next.
        </p>
      </div>

        <div className="p-4 space-y-3">
          {/* Feedback type */}
          <div className="grid grid-cols-2 gap-1.5">
            {FEEDBACK_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-label font-medium transition-all cursor-pointer ${
                  type === t.key
                    ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Message */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              type === 'idea' ? "What would make Be Candid better for you?" :
              type === 'need' ? "What feature would help your journey?" :
              type === 'bug' ? "What went wrong? We'll fix it." :
              type === 'story' ? "Your story matters. Share what you're comfortable with." :
              type === 'question' ? "What would you like to know?" :
              "Tell us what's on your mind..."
            }
            rows={3}
            className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-sm font-body text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />

          {/* Attachments */}
          <div className="space-y-2">
            {/* Share current page checkbox */}
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={sharePage}
                onChange={(e) => setSharePage(e.target.checked)}
                className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/30 cursor-pointer accent-[#226779]"
              />
              <span className="material-symbols-outlined text-sm text-on-surface-variant/60 group-hover:text-on-surface-variant">link</span>
              <span className="text-xs font-label text-on-surface-variant group-hover:text-on-surface">
                Share current page
              </span>
              {sharePage && (
                <span className="text-[10px] text-on-surface-variant/50 font-body truncate max-w-[120px]" title={pathname}>
                  {pathname}
                </span>
              )}
            </label>

            {/* Screenshot upload */}
            {screenshotPreview ? (
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={screenshotPreview}
                  alt="Screenshot preview"
                  className="w-full h-24 object-cover rounded-xl ring-1 ring-outline-variant/20"
                />
                <button
                  onClick={removeScreenshot}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-on-surface/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  aria-label="Remove screenshot"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
                <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full bg-on-surface/60 text-white text-[10px] font-label">
                  {screenshot?.name}
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-outline-variant/40 text-on-surface-variant hover:border-primary/40 hover:text-primary hover:bg-primary/[0.02] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
                <span className="text-xs font-label">Attach a screenshot</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <a
              href="mailto:shawn@becandid.io?subject=Build%20With%20Us"
              className="text-xs text-on-surface-variant hover:text-primary font-label transition-colors"
            >
              Or email us directly
            </a>
            <button
              onClick={handleSubmit}
              disabled={!type || !message.trim() || sending}
              className="btn-primary text-xs py-1.5 px-4 disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>

          <p className="text-[9px] text-on-surface-variant/60 font-body text-center">
            Every feature in this app was shaped by people like you.
          </p>
        </div>
    </div>
  );
}
