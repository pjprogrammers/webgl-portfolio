import type { FeaturedWork } from "./featured";

const Card = ({ item }: { item: FeaturedWork }) => {
  return (
    <div
      className="relative flex h-[440px] w-full items-center justify-center overflow-hidden max-[700px]:h-[260px]"
      style={{ background: item.background }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.14),transparent_55%)]"
      />
      <div className="relative z-[2] flex items-center gap-1.5 font-red-hat-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold tracking-[-0.01em] text-brand-05/95">
        <span className="text-brand-5000">/</span>
        {item.wordmark}
      </div>
    </div>
  );
};

export default Card;
