'use client';
// ============================================================
// components/dashboard/VoiceJournal.tsx
//
// Speech-to-text journaling using the browser-native Web Speech
// API (SpeechRecognition). No external services needed.
//
// Supports continuous listening, interim results, and feeds
// finalized transcript into a journal field via callback.
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceJournalProps {
  onTranscript: (text: string) => void;
  fieldName: string; // "freewrite", "tributaries", "longing", "roadmap"
}

// Type declarations for the Web Speech API
type SpeechRecognitionType = typeof window extends { SpeechRecognition: infer T } ? T : any;

function getSpeechRecognition(): (new () => any) | null {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

export default function VoiceJournal({ onTranscript, fieldName }: VoiceJournalProps) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef('');
  const shouldRestartRef = useRef(false);

  // Check browser support on mount
  useEffect(() => {
    if (!getSpeechRecognition()) {
      setSupported(false);
    }
  }, []);

  // Elapsed time counter
  useEffect(() => {
    if (listening) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [listening]);

  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;

    setError(null);
    setTranscript('');
    setInterimText('');
    setElapsed(0);
    transcriptRef.current = '';
    shouldRestartRef.current = true;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalText = '';
      let interim = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalText) {
        transcriptRef.current = finalText;
        setTranscript(finalText);
      }
      setInterimText(interim);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        // This is normal — just keep listening
        return;
      }
      if (event.error === 'aborted') {
        return;
      }
      setError(`Speech recognition error: ${event.error}`);
      setListening(false);
      shouldRestartRef.current = false;
    };

    recognition.onend = () => {
      // Continuous mode: restart if user hasn't clicked stop
      if (shouldRestartRef.current) {
        try {
          recognition.start();
        } catch {
          // Already started or other issue — ignore
        }
      } else {
        setListening(false);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setListening(true);
    } catch (err: any) {
      setError('Could not start speech recognition. Please check microphone permissions.');
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  }, []);

  const handleDone = useCallback(() => {
    stopListening();
    const finalText = transcriptRef.current.trim();
    if (finalText) {
      onTranscript(finalText);
    }
    setTranscript('');
    setInterimText('');
    setElapsed(0);
  }, [stopListening, onTranscript]);

  const handleDiscard = useCallback(() => {
    stopListening();
    setTranscript('');
    setInterimText('');
    setElapsed(0);
  }, [stopListening]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // ── Not supported ──────────────────────────────────────────

  if (!supported) {
    return (
      <div className="p-3 rounded-2xl bg-surface-container text-sm text-on-surface-variant font-body">
        Voice input is not supported in this browser. Try Chrome or Edge.
      </div>
    );
  }

  // ── Idle state (just the mic button) ───────────────────────

  if (!listening && !transcript) {
    return (
      <button
        onClick={startListening}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-label font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 cursor-pointer"
        title={`Voice input for ${fieldName}`}
        type="button"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>mic</span>
        Voice
      </button>
    );
  }

  // ── Recording / Review state ───────────────────────────────

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3 space-y-3 animate-fade-in">
      {/* Top row: status + timer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {listening ? (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-error" />
              </span>
              <span className="text-xs font-label font-medium text-error">Recording</span>
            </>
          ) : (
            <span className="text-xs font-label font-medium text-primary">Review transcript</span>
          )}
        </div>
        <span className="text-xs font-label text-on-surface-variant tabular-nums">{formatTime(elapsed)}</span>
      </div>

      {/* Waveform visualization (CSS animated bars) */}
      {listening && (
        <div className="flex items-center justify-center gap-0.5 h-8">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-primary"
              style={{
                animation: `voiceBar 0.8s ease-in-out ${i * 0.05}s infinite alternate`,
                height: '4px',
              }}
            />
          ))}
        </div>
      )}

      {/* Live transcript preview */}
      {(transcript || interimText) && (
        <div className="text-sm font-body leading-relaxed text-on-surface max-h-32 overflow-y-auto">
          {transcript && <span>{transcript}</span>}
          {interimText && <span className="text-on-surface-variant/50">{interimText}</span>}
        </div>
      )}

      {!transcript && !interimText && listening && (
        <p className="text-xs text-on-surface-variant font-body italic">Listening... speak now</p>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-error font-body">{error}</p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {listening ? (
          <button
            onClick={stopListening}
            type="button"
            className="flex-1 px-3 py-2 text-xs font-label font-medium rounded-xl bg-error/10 text-error hover:bg-error/20 transition-all cursor-pointer"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={startListening}
            type="button"
            className="px-3 py-2 text-xs font-label font-medium rounded-xl bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-all cursor-pointer"
          >
            Re-record
          </button>
        )}
        {transcript && (
          <button
            onClick={handleDone}
            type="button"
            className="flex-1 px-3 py-2 text-xs font-label font-medium rounded-xl bg-primary text-on-primary hover:opacity-90 transition-all cursor-pointer"
          >
            Insert Text
          </button>
        )}
        <button
          onClick={handleDiscard}
          type="button"
          className="px-3 py-2 text-xs font-label font-medium rounded-xl text-on-surface-variant hover:bg-surface-container transition-all cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* CSS animation for waveform bars */}
      <style jsx>{`
        @keyframes voiceBar {
          0% { height: 4px; }
          100% { height: ${listening ? '24px' : '4px'}; }
        }
      `}</style>
    </div>
  );
}
