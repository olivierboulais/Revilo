export function PageSkeleton() {
  return (
    <div className="px-3 sm:px-6 py-6 sm:py-8 animate-pulse">
      {/* Page title */}
      <div className="h-6 w-36 bg-line rounded-lg mb-2" />
      <div className="h-4 w-64 bg-line rounded mb-6" />

      {/* Top stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-line bg-card p-6 h-[104px]" />
        ))}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-line bg-card p-6 h-[220px]" />
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-line bg-card p-6 h-[160px]" />
        ))}
      </div>
    </div>
  );
}

export function ListPageSkeleton() {
  return (
    <div className="px-3 sm:px-6 py-6 sm:py-8 animate-pulse">
      <div className="h-6 w-44 bg-line rounded-lg mb-2" />
      <div className="h-4 w-56 bg-line rounded mb-6" />
      <div className="flex flex-col gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-line bg-card p-5 h-[80px]" />
        ))}
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="px-3 sm:px-6 py-6 sm:py-8 animate-pulse max-w-[640px]">
      <div className="h-6 w-28 bg-line rounded-lg mb-6" />
      <div className="flex flex-col gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-line bg-card p-5 h-[120px]" />
        ))}
      </div>
    </div>
  );
}
