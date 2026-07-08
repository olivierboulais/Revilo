"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { changeWorkspaceNameAction, changePasswordAction } from "./actions";
import { Button } from "@/components/Button";
import { PasswordInput } from "@/components/PasswordInput";
import { useTheme } from "@/components/ThemeProvider";

type Theme = "light" | "dark" | "system";

type ThemeOption = {
  value: Theme;
  label: string;
  // Explicit colors so the button always previews the theme correctly,
  // regardless of what mode is currently active.
  bg: string;
  border: string;
  activeBorder: string;
  iconColor: string;
  textColor: string;
  icon: (color: string) => React.ReactNode;
};

const THEMES: ThemeOption[] = [
  {
    value: "light",
    label: "Light",
    bg: "#FFFFFF",
    border: "rgba(28,28,26,.12)",
    activeBorder: "#7C3AED",
    iconColor: "#1C1C1A",
    textColor: "#1C1C1A",
    icon: (c) => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="3" stroke={c} strokeWidth="1.4" />
        <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.5 3.5l1 1M11.5 11.5l1 1M11.5 3.5l-1 1M3.5 11.5l1-1" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: "dark",
    label: "Dark",
    bg: "#1C1C1A",
    border: "rgba(255,255,255,.12)",
    activeBorder: "#7C3AED",
    iconColor: "#FFFFFF",
    textColor: "#FFFFFF",
    icon: (c) => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M13 8.5A5.5 5.5 0 0 1 6.5 3c0-.3 0-.6.05-.9A5.5 5.5 0 1 0 13.9 9.45c-.3.05-.6.05-.9.05z" stroke={c} strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: "system",
    label: "System",
    bg: "transparent",
    border: "rgba(128,128,128,.25)",
    activeBorder: "#7C3AED",
    iconColor: "#706F6A",
    textColor: "inherit",
    icon: (c) => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="2.5" width="13" height="9" rx="1.5" stroke={c} strokeWidth="1.4" />
        <path d="M5.5 13.5h5M8 11.5v2" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
];

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <h2 className="text-[14px] font-medium mb-4">Appearance</h2>
      <div className="grid grid-cols-3 gap-2">
        {THEMES.map((t) => {
          const active = theme === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className="flex flex-col items-center gap-2 px-3 py-3.5 rounded-xl border text-[12.5px] font-medium transition-all hover:opacity-90"
              style={{
                background: t.bg,
                borderColor: active ? t.activeBorder : t.border,
                boxShadow: active ? `0 0 0 1px ${t.activeBorder}` : undefined,
                color: t.textColor,
              }}
            >
              {t.icon(t.iconColor)}
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <h2 className="text-[14px] font-medium mb-4">{title}</h2>
      {children}
    </div>
  );
}

function InlineForm({
  onSubmit,
  fields,
  submitLabel,
}: {
  onSubmit: (fd: FormData) => Promise<{ error?: string; success?: string }>;
  fields: Array<{ name: string; label: string; type?: string; defaultValue?: string; placeholder?: string }>;
  submitLabel: string;
}) {
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const fd = new FormData(e.currentTarget);
    const res = await onSubmit(fd);
    setResult(res);
    setLoading(false);
    if (res.success) (e.target as HTMLFormElement).reset();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {fields.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="text-[12.5px] text-gray block mb-1.5">{f.label}</label>
          {f.type === "password" ? (
            <PasswordInput id={f.name} name={f.name} placeholder={f.placeholder} />
          ) : (
            <input
              id={f.name}
              name={f.name}
              type={f.type ?? "text"}
              defaultValue={f.defaultValue}
              placeholder={f.placeholder}
              className="w-full text-[14px] rounded-xl border border-line px-4 py-2.5 outline-none focus:border-[#1C1C1A] bg-white"
            />
          )}
        </div>
      ))}
      {result?.error && (
        <p className="text-[12.5px] text-[#B3401F]">{result.error}</p>
      )}
      {result?.success && (
        <p className="text-[12.5px] text-good">{result.success}</p>
      )}
      <div>
        <Button type="submit" variant="dark" withArrow={false} disabled={loading} className="text-[13px]">
          {loading ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

interface Props {
  email: string;
  workspaceName: string;
  tier: string;
  emailVerified: boolean;
}

const tierLabel: Record<string, string> = { free: "Free", pro: "Pro Report", monitoring: "Monthly Monitoring" };

function DeleteAccountSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete account");
      router.push("/signup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[13px] text-[#B3401F] hover:underline"
      >
        Delete account…
      </button>
    );
  }

  return (
    <div className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] p-4 flex flex-col gap-3">
      <p className="text-[13px] text-[#991B1B] font-medium">
        This permanently deletes your account, all scan history, and connected sources. This cannot be undone.
      </p>
      <div>
        <label className="text-[12.5px] text-[#991B1B] block mb-1.5">Enter your password to confirm</label>
        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          placeholder="Your password"
          className="w-full text-[14px] rounded-xl border border-[#FECACA] px-4 py-2.5 outline-none focus:border-[#EF4444] bg-white"
        />
      </div>
      {error && <p className="text-[12.5px] text-[#B91C1C]">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={loading || !password}
          className="text-[13px] font-medium px-4 py-2 rounded-full bg-[#EF4444] text-white hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {loading ? "Deleting…" : "Delete my account"}
        </button>
        <button
          onClick={() => { setOpen(false); setPassword(""); setError(null); }}
          className="text-[13px] font-medium px-4 py-2 rounded-full border border-line hover:bg-foreground/[0.05] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function SettingsClient({ email, workspaceName, tier, emailVerified }: Props) {
  return (
    <div className="flex flex-col gap-4 max-w-[560px]">
      <FormSection title="Workspace">
        <InlineForm
          onSubmit={changeWorkspaceNameAction}
          fields={[{ name: "workspaceName", label: "Workspace name", defaultValue: workspaceName }]}
          submitLabel="Save name"
        />
      </FormSection>

      <FormSection title="Account">
        <div className="flex items-center justify-between py-2 border-b border-line text-[13px] mb-4">
          <span className="text-gray">Email</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">{email}</span>
            {emailVerified ? (
              <span className="text-[11px] text-good font-medium bg-[#F0FDF4] border border-[#BBF7D0] px-2 py-0.5 rounded-full">Verified</span>
            ) : (
              <span className="text-[11px] text-[#92400E] font-medium bg-[#FFFBEB] border border-[#FDE68A] px-2 py-0.5 rounded-full">Unverified</span>
            )}
          </div>
        </div>
        <h3 className="text-[13px] font-medium mb-3">Change password</h3>
        <InlineForm
          onSubmit={changePasswordAction}
          fields={[
            { name: "currentPassword", label: "Current password", type: "password", placeholder: "••••••••" },
            { name: "newPassword", label: "New password", type: "password", placeholder: "At least 8 characters" },
            { name: "confirmPassword", label: "Confirm new password", type: "password", placeholder: "••••••••" },
          ]}
          submitLabel="Update password"
        />
      </FormSection>

      <AppearanceSection />

      <FormSection title="Plan">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-medium">{tierLabel[tier] ?? tier}</div>
            <div className="text-[12px] text-gray mt-0.5">
              {tier !== "free" ? "Full report access unlocked." : "Alignment Score and one finding visible."}
            </div>
          </div>
          {tier === "free" && (
            <a href="/upgrade" className="btn-dark text-[13px] font-medium px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity">
              Upgrade
            </a>
          )}
        </div>
      </FormSection>

      <div className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-[14px] font-medium mb-3">Session</h2>
        <div className="flex items-center justify-between">
          <form action="/api/logout" method="POST">
            <button type="submit" className="text-[13px] font-medium px-3 py-1.5 rounded-full border border-line hover:bg-foreground/[0.05] transition-colors">
              Log out
            </button>
          </form>
          <DeleteAccountSection />
        </div>
      </div>
    </div>
  );
}
