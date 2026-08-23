type StoryMarkProps = {
  code: string;
  accent: string;
  ink: string;
  className?: string;
};

export function StoryMark({ code, accent, ink, className = "" }: StoryMarkProps) {
  return (
    <div
      className={`relative isolate overflow-hidden rounded-3xl ${className}`}
      style={{ background: accent, color: ink }}
    >
      <div className="absolute inset-0 opacity-30 [background-image:repeating-linear-gradient(-12deg,transparent,transparent_12px,currentColor_12px,currentColor_13px)]" />
      <div className="relative flex h-full min-h-[9rem] items-end p-4 sm:p-5">
        <span className="font-serif text-6xl leading-[0.8] tracking-tight sm:text-7xl">{code}</span>
      </div>
    </div>
  );
}
