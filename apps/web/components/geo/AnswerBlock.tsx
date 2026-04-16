/**
 * AnswerBlock — Renders a direct answer at the top of articles.
 * AI models (ChatGPT, Perplexity, Gemini) extract the first definitive answer
 * they find. This component formats that answer for maximum extraction.
 *
 * Place BEFORE the main article content, right after the hero.
 *
 * Usage:
 *   <AnswerBlock
 *     question="Do porn blockers actually work?"
 *     answer="No, porn blockers do not work long-term. Research shows they produce short-term behavioral change but create shame cycles and fail to address root causes."
 *   />
 */

interface AnswerBlockProps {
  question: string;
  answer: string | React.ReactNode;
}

export default function AnswerBlock({ question, answer }: AnswerBlockProps) {
  return (
    <section
      className="my-10 rounded-3xl bg-gradient-to-br from-cyan-500/[0.08] to-teal-500/[0.04] ring-1 ring-cyan-400/20 overflow-hidden"
      itemScope
      itemType="https://schema.org/Question"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
      <div className="px-6 md:px-8 py-7">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-cyan-400 text-lg">quick_reference</span>
          <span className="font-label text-[11px] text-cyan-400 uppercase tracking-widest font-bold">
            Quick Answer
          </span>
        </div>
        <h2
          className="font-headline text-xl md:text-2xl font-bold text-white mb-4 leading-tight"
          itemProp="name"
        >
          {question}
        </h2>
        <div
          itemScope
          itemProp="acceptedAnswer"
          itemType="https://schema.org/Answer"
        >
          <div
            className="font-body text-white/90 text-lg md:text-xl leading-[1.6] font-medium"
            itemProp="text"
          >
            {answer}
          </div>
        </div>
      </div>
    </section>
  );
}
