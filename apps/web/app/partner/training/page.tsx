'use client';

import { useState } from 'react';
import Link from 'next/link';

// ── Section data ──────────────────────────────────────────

interface Section {
  number: number;
  icon: string;
  title: string;
  content: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    number: 1,
    icon: 'visibility',
    title: 'Your Role',
    content: (
      <div className="space-y-4">
        <p className="text-sm font-body text-on-surface leading-relaxed">
          You&apos;re not a detective, a judge, or a therapist. Those roles create distance.
          Your role is simpler and harder:
        </p>
        <blockquote className="border-l-3 border-primary pl-4 py-1">
          <p className="text-base font-headline font-bold text-primary">
            You&apos;re a witness &mdash; someone who sees them and stays.
          </p>
        </blockquote>
        <p className="text-sm font-body text-on-surface leading-relaxed">
          You don&apos;t need special training. You don&apos;t need to have all the answers.
          <strong className="text-primary"> Your presence is the intervention.</strong> Just by being
          here &mdash; willing to show up, willing to be honest &mdash; you&apos;re doing
          more than most people ever will.
        </p>
      </div>
    ),
  },
  {
    number: 2,
    icon: 'hearing',
    title: 'When They Confess',
    content: (
      <div className="space-y-4">
        <p className="text-sm font-body text-on-surface leading-relaxed">
          When someone trusts you enough to be honest about a setback, your first words matter
          more than anything else. Lead with:
        </p>
        <blockquote className="border-l-3 border-primary pl-4 py-1">
          <p className="text-base font-headline font-bold text-primary">
            &ldquo;Thank you for telling me.&rdquo;
          </p>
        </blockquote>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-lg mt-0.5 shrink-0">do_not_disturb</span>
            <p className="text-sm font-body text-on-surface leading-relaxed">
              <strong>Don&apos;t ask for details you don&apos;t need.</strong> Curiosity can feel
              like interrogation. Only ask what helps them move forward.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-lg mt-0.5 shrink-0">do_not_disturb</span>
            <p className="text-sm font-body text-on-surface leading-relaxed">
              <strong>Resist the urge to fix, lecture, or compare.</strong> They already know.
              What they need is someone who won&apos;t flinch.
            </p>
          </div>
        </div>
        <p className="text-sm font-body text-on-surface leading-relaxed">
          Instead, try asking:
        </p>
        <blockquote className="border-l-3 border-primary pl-4 py-1">
          <p className="text-base font-headline font-bold text-primary">
            &ldquo;What do you need from me right now?&rdquo;
          </p>
        </blockquote>
      </div>
    ),
  },
  {
    number: 3,
    icon: 'block',
    title: 'What NOT to Say',
    content: (
      <div className="space-y-4">
        <p className="text-sm font-body text-on-surface leading-relaxed">
          Some responses feel natural but can shut down honesty for good.
          Avoid these:
        </p>
        <div className="space-y-2">
          {[
            '"Again?" / "I thought you were over this"',
            '"Just stop" / "Try harder"',
            '"What\'s wrong with you?"',
            '"I don\'t want to hear about it"',
          ].map((phrase) => (
            <div key={phrase} className="flex items-start gap-3 bg-error/5 rounded-2xl px-4 py-3">
              <span className="material-symbols-outlined text-error text-lg mt-0.5 shrink-0">close</span>
              <p className="text-sm font-body text-on-surface font-medium">{phrase}</p>
            </div>
          ))}
        </div>
        <p className="text-sm font-body text-on-surface leading-relaxed mt-4">
          Instead, try:
        </p>
        <div className="flex items-start gap-3 bg-primary/5 rounded-2xl px-4 py-3">
          <span className="material-symbols-outlined text-primary text-lg mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <p className="text-sm font-body text-primary font-bold">
            &ldquo;I&apos;m here. Tell me what happened.&rdquo;
          </p>
        </div>
      </div>
    ),
  },
  {
    number: 4,
    icon: 'shield',
    title: 'Accountability vs Surveillance',
    content: (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="bg-primary/5 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="font-headline font-bold text-primary text-sm">Accountability</span>
            </div>
            <p className="text-sm font-body text-on-surface leading-relaxed">
              &ldquo;I trust you to be honest.&rdquo;
            </p>
            <p className="text-xs font-body text-on-surface-variant leading-relaxed">
              Creates safety. Invites openness. Builds real trust over time.
            </p>
          </div>
          <div className="bg-error/5 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error">visibility</span>
              <span className="font-headline font-bold text-error text-sm">Surveillance</span>
            </div>
            <p className="text-sm font-body text-on-surface leading-relaxed">
              &ldquo;I don&apos;t trust you at all.&rdquo;
            </p>
            <p className="text-xs font-body text-on-surface-variant leading-relaxed">
              Creates shame. Encourages hiding. Erodes the relationship.
            </p>
          </div>
        </div>
        <p className="text-sm font-body text-on-surface leading-relaxed">
          <strong className="text-primary">Be Candid is designed for accountability.</strong>{' '}
          You see patterns, not content. You see progress, not every detail. That&apos;s intentional
          &mdash; because trust is built through honesty, not monitoring.
        </p>
      </div>
    ),
  },
  {
    number: 5,
    icon: 'self_care',
    title: 'Taking Care of Yourself',
    content: (
      <div className="space-y-4">
        <p className="text-sm font-body text-on-surface leading-relaxed">
          Being an accountability partner is meaningful work &mdash; and it can be heavy.
          Here&apos;s what you need to know:
        </p>
        <div className="space-y-3">
          {[
            { icon: 'fence', text: "You're allowed to have boundaries. Saying \"I need a break from this conversation\" isn't failure — it's self-awareness." },
            { icon: 'sentiment_neutral', text: "It's okay to feel frustrated, tired, or sad. Those feelings don't make you a bad partner. They make you human." },
            { icon: 'group', text: "You don't have to carry this alone. Reach out to your own support system." },
            { icon: 'psychology', text: 'Consider your own therapy or support group. Having someone to process with makes you a better partner.' },
          ].map((item) => (
            <div key={item.icon} className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-lg mt-0.5 shrink-0">{item.icon}</span>
              <p className="text-sm font-body text-on-surface leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: 6,
    icon: 'chat',
    title: 'The Conversation Guide',
    content: (
      <div className="space-y-4">
        <p className="text-sm font-body text-on-surface leading-relaxed">
          When Be Candid generates a conversation guide for you, use it. It&apos;s not filler &mdash;
          it&apos;s built on <strong className="text-primary">Motivational Interviewing</strong>,
          a therapeutic technique proven to help people change.
        </p>
        <div className="space-y-3">
          {[
            { icon: 'help', text: 'Ask open-ended questions. "How are you feeling about this week?" works better than "Did you mess up?"' },
            { icon: 'hearing', text: 'Listen more than you speak. Silence isn\'t awkward — it\'s space for honesty.' },
            { icon: 'menu_book', text: 'Follow the guide\'s structure. It\'s designed to keep conversations productive and safe.' },
            { icon: 'favorite', text: 'End with affirmation. Remind them of the progress they\'ve made, no matter how small.' },
          ].map((item) => (
            <div key={item.icon} className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-lg mt-0.5 shrink-0">{item.icon}</span>
              <p className="text-sm font-body text-on-surface leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

// ── Accordion Item ────────────────────────────────────────

function AccordionItem({ section, isOpen, onToggle }: {
  section: Section;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 sm:px-6 sm:py-5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-3xl transition-colors hover:bg-surface-container-low/50"
      >
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-xl">{section.icon}</span>
        </div>
        <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
          <span className="font-label text-xs font-bold text-primary/60 uppercase tracking-widest">
            {String(section.number).padStart(2, '0')}
          </span>
          <span className="font-headline text-base sm:text-lg font-bold text-on-surface truncate">
            {section.title}
          </span>
        </div>
        <span
          className="material-symbols-outlined text-on-surface-variant text-xl transition-transform duration-300 shrink-0"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          expand_more
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? '800px' : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0">
          <div className="border-t border-outline-variant/50 pt-4">
            {section.content}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────

export default function PartnerTrainingPage() {
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([1]));

  const toggle = (num: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const expandAll = () => {
    setOpenSections(new Set(SECTIONS.map((s) => s.number)));
  };

  const collapseAll = () => {
    setOpenSections(new Set());
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 stagger">
      {/* Back link */}
      <Link
        href="/partner"
        className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors font-label"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Back to Dashboard
      </Link>

      {/* Hero */}
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <span className="material-symbols-outlined text-primary text-4xl">school</span>
        </div>
        <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight mb-3">
          How to Be a Great<br />Accountability Partner
        </h1>
        <p className="text-sm sm:text-base font-body text-on-surface-variant max-w-lg mx-auto leading-relaxed">
          This guide will help you show up well for the person who trusted you
          enough to ask. Read it once, come back when you need it.
        </p>
      </div>

      {/* Expand/collapse controls */}
      <div className="flex justify-end gap-2">
        <button
          onClick={expandAll}
          className="text-xs font-label font-medium text-on-surface-variant hover:text-primary transition-colors cursor-pointer px-2 py-1"
        >
          Expand all
        </button>
        <span className="text-on-surface-variant/30">|</span>
        <button
          onClick={collapseAll}
          className="text-xs font-label font-medium text-on-surface-variant hover:text-primary transition-colors cursor-pointer px-2 py-1"
        >
          Collapse all
        </button>
      </div>

      {/* Accordion sections */}
      <div className="space-y-3">
        {SECTIONS.map((section) => (
          <AccordionItem
            key={section.number}
            section={section}
            isOpen={openSections.has(section.number)}
            onToggle={() => toggle(section.number)}
          />
        ))}
      </div>

      {/* Footer CTA */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 sm:p-8 text-center">
        <span className="material-symbols-outlined text-primary text-3xl mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>
          favorite
        </span>
        <p className="font-headline font-bold text-on-surface mb-2">
          You&apos;re already doing the hard part.
        </p>
        <p className="text-sm font-body text-on-surface-variant mb-5 max-w-md mx-auto">
          The fact that you&apos;re reading this means you care. That matters more
          than getting everything right.
        </p>
        <Link
          href="/partner"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
