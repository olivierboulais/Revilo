import { LinkButton } from "@/components/Button";

export function UpgradeBanner({ message }: { message: string }) {
  return (
    <div className="relative rounded-2xl overflow-hidden">
      <div className="blur-[3px] opacity-60 select-none pointer-events-none p-6">
        <div className="h-3 w-2/3 bg-line rounded mb-3" />
        <div className="h-3 w-1/2 bg-line rounded mb-3" />
        <div className="h-3 w-5/6 bg-line rounded mb-3" />
        <div className="h-3 w-1/3 bg-line rounded" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/60 px-6 text-center">
        <p className="text-[13.5px] text-[#1C1C1A] font-medium max-w-[280px]">{message}</p>
        <LinkButton href="/upgrade" variant="dark" withArrow={false} className="text-[13px]">
          Unlock full report
        </LinkButton>
      </div>
    </div>
  );
}
