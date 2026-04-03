'use client';

// ============================================================
// ConversationCoach — Interactive Coaching Chat Interface
//
// A streaming chat experience grounded in Stringer's framework.
// Walks users through Tributaries → Longing → Roadmap after
// a relapse or difficult moment.
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Types ──────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

type CoachPhase = 'tributaries' | 'longing' | 'roadmap';

interface ConversationCoachProps {
  alertId?: string;
  onEndSession?: (summary: string) => void;
}

// ─── Phase Detection ────────────────────────────────────────

const PHASE_SIGNALS: Record<CoachPhase, RegExp[]> = {
  tributaries: [
    /what (was|were) happening/i,
    /before (this|that|it)/i,
    /leading up to/i,
    /what triggered/i,
    /earlier (today|that day|in the day)/i,
    /what were you feeling/i,
    /tell me about/i,
    /what was going on/i,
  ],
  longing: [
    /what (did you|do you) (actually |really )?need/i,
    /underneath/i,
    /longing/i,
    /what were you (really |actually )?looking for/i,
    /what (was|is) the (real |deeper )?need/i,
    /craving/i,
    /searching for/i,
    /trying to (feel|find|get)/i,
  ],
  roadmap: [
    /what (is this|does this) (reveal|teach|show)/i,
    /going forward/i,
    /next step/i,
    /what would it look like/i,
    /one thing you could/i,
    /path forward/i,
    /pattern/i,
    /growth/i,
    /different way/i,
  ],
};

function detectPhase(messages: Message[]): CoachPhase {
  // Check assistant messages in reverse order to find latest phase
  const assistantMsgs = messages.filter((m) => m.role === 'assistant');
  for (let i = assistantMsgs.length - 1; i >= 0; i--) {
    const text = assistantMsgs[i].content;
    for (const pattern of PHASE_SIGNALS.roadmap) {
      if (pattern.test(text)) return 'roadmap';
    }
    for (const pattern of PHASE_SIGNALS.longing) {
      if (pattern.test(text)) return 'longing';
    }
  }
  return 'tributaries';
}

// ─── Helpers ────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const PHASE_LABELS: Record<CoachPhase, { label: string; description: string }> = {
  tributaries: { label: 'Tributaries', description: 'Tracing what led here' },
  longing:     { label: 'Longing',     description: 'Naming the real need' },
  roadmap:     { label: 'Roadmap',     description: 'Finding the path forward' },
};

const PHASE_ORDER: CoachPhase[] = ['tributaries', 'longing', 'roadmap'];

// ─── Component ──────────────────────────────────────────────

export default function ConversationCoach({ alertId, onEndSession }: ConversationCoachProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const currentPhase = detectPhase(messages);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ── Send Message ────────────────────────────────────────────

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming || sessionEnded) return;
    if (text.length > 1000) {
      setError('Please keep your message under 1,000 characters.');
      return;
    }

    setError(null);
    setInput('');

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const assistantMsg: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    // Build history for API (exclude current messages)
    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      abortRef.current = new AbortController();

      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          alert_id: alertId,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${res.status})`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });

        // Update the assistant message content
        const current = accumulated;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: current } : m
          )
        );
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('[ConversationCoach] Error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      // Remove empty assistant message on error
      setMessages((prev) =>
        prev.filter((m) => m.id !== assistantMsg.id || m.content.length > 0)
      );
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  }, [input, isStreaming, sessionEnded, messages, alertId]);

  // ── End Session ─────────────────────────────────────────────

  const handleEndSession = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();

    const assistantMessages = messages
      .filter((m) => m.role === 'assistant' && m.content)
      .map((m) => m.content);

    const summary = assistantMessages.length > 0
      ? assistantMessages[assistantMessages.length - 1]
      : 'Session ended without responses.';

    setSessionEnded(true);
    onEndSession?.(summary);
  }, [messages, onEndSession]);

  // ── Keyboard ──────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant flex flex-col h-[600px] max-h-[80vh]">
      {/* Header + Phase Breadcrumbs */}
      <div className="px-5 pt-5 pb-3 border-b border-outline-variant/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Coach Avatar */}
            <div className="w-9 h-9 rounded-full bg-[#226779] flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div>
              <h3 className="font-headline text-base text-on-surface font-medium">Conversation Coach</h3>
              <p className="font-label text-xs text-on-surface-variant">Guided self-reflection</p>
            </div>
          </div>

          {messages.length > 0 && !sessionEnded && (
            <button
              onClick={handleEndSession}
              className="font-label text-xs px-3 py-1.5 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              End Session
            </button>
          )}
        </div>

        {/* Phase Breadcrumbs */}
        {messages.length > 0 && (
          <div className="flex items-center gap-1.5">
            {PHASE_ORDER.map((phase, i) => {
              const isActive = phase === currentPhase;
              const isPast = PHASE_ORDER.indexOf(currentPhase) > i;

              return (
                <div key={phase} className="flex items-center gap-1.5">
                  {i > 0 && (
                    <div className={`w-4 h-px ${isPast || isActive ? 'bg-[#226779]' : 'bg-outline-variant/40'}`} />
                  )}
                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-label transition-all ${
                      isActive
                        ? 'bg-[#226779]/10 text-[#226779] font-medium'
                        : isPast
                          ? 'text-[#226779]/60'
                          : 'text-on-surface-variant/40'
                    }`}
                  >
                    {isPast && (
                      <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {PHASE_LABELS[phase].label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && !sessionEnded && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-14 h-14 rounded-full bg-[#226779]/10 flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#226779" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed max-w-sm">
              Your coach is here to help you understand what just happened &mdash; with curiosity, not judgment.
            </p>
            <p className="font-label text-xs text-on-surface-variant/60 mt-2">
              Share what&apos;s on your mind to get started.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-[#226779] flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 font-body text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#226779] text-white rounded-br-md'
                  : 'bg-surface-container-low text-on-surface rounded-bl-md'
              }`}
            >
              {msg.content || (
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              )}
            </div>
          </div>
        ))}

        {sessionEnded && (
          <div className="flex justify-center py-4">
            <div className="bg-surface-container-low rounded-2xl px-5 py-3 text-center">
              <p className="font-label text-xs text-on-surface-variant">
                Session complete. You showed real courage today.
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mx-5 mb-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
          <p className="font-label text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* Input Bar */}
      {!sessionEnded && (
        <div className="px-5 pb-5 pt-2 border-t border-outline-variant/30">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  if (e.target.value.length <= 1000) {
                    setInput(e.target.value);
                    setError(null);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Share what's on your mind..."
                disabled={isStreaming}
                rows={1}
                className="w-full resize-none rounded-2xl bg-surface-container-low border border-outline-variant/50 px-4 py-3 pr-12 font-body text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-[#226779]/30 focus:border-[#226779]/50 disabled:opacity-50 transition-all"
                style={{
                  minHeight: '44px',
                  maxHeight: '120px',
                  height: 'auto',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                }}
              />
              {/* Character count (near limit) */}
              {input.length > 800 && (
                <span className={`absolute bottom-1.5 right-14 font-label text-[10px] ${
                  input.length > 950 ? 'text-red-500' : 'text-on-surface-variant/50'
                }`}>
                  {input.length}/1000
                </span>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              className="w-10 h-10 rounded-full bg-[#226779] text-white flex items-center justify-center flex-shrink-0 hover:bg-[#1a5563] disabled:opacity-30 disabled:hover:bg-[#226779] transition-all"
              aria-label="Send message"
            >
              {isStreaming ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                  <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
