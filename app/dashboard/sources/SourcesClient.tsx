"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDrawer } from "@/components/DrawerContext";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function FigmaIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 38 57" fill="none">
      <path d="M9.5 57C14.747 57 19 52.747 19 47.5V38H9.5C4.253 38 0 42.253 0 47.5S4.253 57 9.5 57Z" fill="#0ACF83"/>
      <path d="M0 28.5C0 23.253 4.253 19 9.5 19H19v19H9.5C4.253 38 0 33.747 0 28.5Z" fill="#A259FF"/>
      <path d="M0 9.5C0 4.253 4.253 0 9.5 0H19v19H9.5C4.253 19 0 14.747 0 9.5Z" fill="#F24E1E"/>
      <path d="M19 0h9.5C33.747 0 38 4.253 38 9.5S33.747 19 28.5 19H19V0Z" fill="#FF7262"/>
      <path d="M38 28.5c0 5.247-4.253 9.5-9.5 9.5S19 33.747 19 28.5s4.253-9.5 9.5-9.5 9.5 4.253 9.5 9.5Z" fill="#1ABCFE"/>
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.5 0 12.3c0 5.43 3.44 10.03 8.21 11.66.6.12.82-.27.82-.6v-2.1c-3.34.74-4.04-1.66-4.04-1.66-.55-1.43-1.33-1.8-1.33-1.8-1.09-.76.08-.75.08-.75 1.2.09 1.84 1.27 1.84 1.27 1.07 1.87 2.8 1.33 3.49 1.02.1-.78.42-1.33.76-1.64-2.67-.31-5.47-1.36-5.47-6.07 0-1.34.46-2.43 1.23-3.29-.12-.31-.53-1.57.12-3.28 0 0 1-.33 3.3 1.26a11.2 11.2 0 0 1 6 0c2.28-1.59 3.29-1.26 3.29-1.26.65 1.71.24 2.97.12 3.28.77.86 1.23 1.95 1.23 3.29 0 4.72-2.8 5.76-5.48 6.06.43.38.81 1.13.81 2.28v3.38c0 .34.22.72.83.6C20.56 22.32 24 17.72 24 12.3 24 5.5 18.63 0 12 0Z" />
    </svg>
  );
}

type FigmaFileRole = "seed" | "primitive" | "semantic" | "component" | "project";
interface FigmaFileEntry { key: string; role: FigmaFileRole; label: string; }

const ROLE_OPTIONS: { value: FigmaFileRole; label: string }[] = [
  { value: "project", label: "Project" },
  { value: "component", label: "Components" },
  { value: "semantic", label: "Semantic tokens" },
  { value: "primitive", label: "Primitive tokens" },
  { value: "seed", label: "Seed variables" },
];

function extractFileKey(input: string): string {
  const urlMatch = input.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
  return urlMatch ? urlMatch[1] : input.trim();
}

function parseFigmaFiles(raw: string | null): FigmaFileEntry[] {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try { return JSON.parse(trimmed) as FigmaFileEntry[]; } catch { return []; }
  }
  return [{ key: trimmed, role: "project", label: "" }];
}

interface FigmaInfo { externalName: string | null; fileKey: string | null; connectedAt: string; }
interface GithubInfo { externalName: string | null; repo: string | null; connectedAt: string; }
interface Props { figma: FigmaInfo | null; github: GithubInfo | null; }

function SourceHeader({ icon, name, connected, onConnect, onReconnect }: {
  icon: React.ReactNode; name: string; connected: boolean;
  onConnect: () => void; onReconnect: () => void;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <span className="w-11 h-11 rounded-xl bg-surface source-icon-wrap flex items-center justify-center flex-shrink-0">{icon}</span>
        <div>
          <div className="text-[14px] font-medium">{name}</div>
          <div className="text-[12px] text-gray flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-good" : "bg-gray"}`} />
            {connected ? "Connected" : "Not connected"}
          </div>
        </div>
      </div>
      <button
        onClick={connected ? onReconnect : onConnect}
        className="text-[12px] font-medium px-3 py-1.5 rounded-full border border-line hover:bg-foreground/[0.05] transition-colors flex-shrink-0"
      >
        {connected ? "Reconnect" : "Connect"}
      </button>
    </div>
  );
}

function FigmaCard({ figma, onDisconnect, disconnecting, onPatConnected }: {
  figma: FigmaInfo | null;
  onDisconnect: () => void;
  disconnecting: boolean;
  onPatConnected: (info: FigmaInfo) => void;
}) {
  const [files, setFiles] = useState<FigmaFileEntry[]>(parseFigmaFiles(figma?.fileKey ?? null));
  const [showPat, setShowPat] = useState(false);
  const [pat, setPat] = useState("");
  const [patSaving, setPatSaving] = useState(false);
  const [patError, setPatError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newRole, setNewRole] = useState<FigmaFileRole>("project");
  const [newLabel, setNewLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveFiles(updated: FigmaFileEntry[]) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/sources/figma/file-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey: JSON.stringify(updated) }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setFiles(updated);
    } catch {
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function addFile() {
    const key = extractFileKey(newUrl);
    if (!key) return;
    const entry: FigmaFileEntry = { key, role: newRole, label: newLabel.trim() };
    await saveFiles([...files, entry]);
    setNewUrl(""); setNewRole("project"); setNewLabel("");
    setShowAddForm(false);
  }

  async function removeFile(index: number) {
    await saveFiles(files.filter((_, i) => i !== index));
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <SourceHeader
        icon={<FigmaIcon />}
        name="Figma"
        connected={Boolean(figma)}
        onConnect={() => { window.location.href = "/api/auth/figma/start"; }}
        onReconnect={() => { window.location.href = "/api/auth/figma/start"; }}
      />

      {figma ? (
        <>
          {/* File list */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-gray">Figma files</span>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-[12px] font-medium text-lilac-deep hover:underline"
                >
                  + Add file
                </button>
              )}
            </div>

            {files.length === 0 && !showAddForm && (
              <p className="text-[12px] text-gray py-2">No files added yet. Add a Figma file URL or key to start scanning.</p>
            )}

            {files.length > 0 && (
              <div className="flex flex-col gap-2 mb-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-surface border border-line group">
                    <span className="px-1.5 py-0.5 rounded bg-card text-gray font-mono text-[10px] uppercase flex-shrink-0 border border-line">
                      {f.role}
                    </span>
                    <span className="font-mono text-[11.5px] text-gray truncate flex-1">{f.key}</span>
                    {f.label && <span className="text-[11.5px] text-gray flex-shrink-0">— {f.label}</span>}
                    <button
                      onClick={() => removeFile(i)}
                      disabled={saving}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray hover:text-[#B3401F] flex-shrink-0 disabled:opacity-30"
                      aria-label="Remove file"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showAddForm && (
              <div className="rounded-xl border border-line p-3 flex flex-col gap-2 bg-surface mt-2">
                <input
                  type="text"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  placeholder="https://www.figma.com/file/... or file key"
                  className="w-full text-[12.5px] rounded-lg border border-line px-3 py-2 outline-none focus:border-lilac-deep bg-card"
                />
                <div className="flex gap-2">
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as FigmaFileRole)}
                    className="text-[12px] rounded-lg border border-line px-2 py-1.5 outline-none bg-card flex-shrink-0"
                  >
                    {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                    placeholder="Label (optional)"
                    className="flex-1 text-[12px] rounded-lg border border-line px-2 py-1.5 outline-none focus:border-lilac-deep bg-card"
                  />
                </div>
                {error && <p className="text-[11.5px] text-[#B3401F]">{error}</p>}
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setShowAddForm(false); setError(null); }} className="text-[12px] text-gray hover:text-foreground px-3 py-1.5">
                    Cancel
                  </button>
                  <button
                    onClick={addFile}
                    disabled={!newUrl.trim() || saving}
                    className="btn-dark text-[12px] font-medium px-3 py-1.5 rounded-full disabled:opacity-40"
                  >
                    {saving ? "Saving…" : "Save file"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="text-[11.5px] text-gray pt-3 border-t border-line flex items-center justify-between">
            <span className="text-gray">Connected {timeAgo(figma.connectedAt)}</span>
            <button onClick={onDisconnect} disabled={disconnecting} className="text-[#B3401F] hover:underline disabled:opacity-50">
              {disconnecting ? "Removing…" : "Remove source"}
            </button>
          </div>
        </>
      ) : showPat ? (
        <div className="flex flex-col gap-2">
          <p className="text-[12px] text-gray">
            Generate a token at <strong>figma.com → Account Settings → Personal access tokens</strong>, then paste it below.
          </p>
          <input
            type="password"
            value={pat}
            onChange={e => { setPat(e.target.value); setPatError(null); }}
            placeholder="figd_…"
            className="w-full text-[12.5px] rounded-xl border border-line px-3 py-2 outline-none focus:border-lilac-deep bg-card font-mono"
            autoFocus
          />
          {patError && <p className="text-[11.5px] text-[#B3401F]">{patError}</p>}
          <div className="flex gap-2 justify-end mt-1">
            <button onClick={() => { setShowPat(false); setPat(""); setPatError(null); }} className="text-[12px] text-gray hover:text-foreground px-3 py-1.5">
              Cancel
            </button>
            <button
              onClick={async () => {
                setPatSaving(true); setPatError(null);
                try {
                  const res = await fetch("/api/sources/figma/pat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: pat }),
                  });
                  const data = await res.json();
                  if (!res.ok) { setPatError(data.error ?? "Failed to connect"); return; }
                  onPatConnected({ externalName: data.handle ?? null, fileKey: null, connectedAt: new Date().toISOString() });
                  setShowPat(false); setPat("");
                } catch {
                  setPatError("Could not connect. Please try again.");
                } finally {
                  setPatSaving(false);
                }
              }}
              disabled={!pat.trim() || patSaving}
              className="btn-dark text-[12px] font-medium px-3 py-1.5 rounded-full disabled:opacity-40"
            >
              {patSaving ? "Verifying…" : "Connect"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-[12.5px] text-gray">Connect your Figma account to scan components, variants, and tokens.</p>
          <button
            onClick={() => setShowPat(true)}
            className="text-[12px] text-lilac-deep hover:underline text-left"
          >
            Use a Personal Access Token instead →
          </button>
        </div>
      )}
    </div>
  );
}

function GitHubCard({ github, onDisconnect, disconnecting }: {
  github: GithubInfo | null;
  onDisconnect: () => void;
  disconnecting: boolean;
}) {
  const [repo, setRepo] = useState(github?.repo ?? "");
  const [editing, setEditing] = useState(!github?.repo);
  const [repoInput, setRepoInput] = useState(github?.repo ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [repos, setRepos] = useState<{ full_name: string; private: boolean }[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!github) return;
    setReposLoading(true);
    fetch("/api/sources/github/repos")
      .then(r => r.json())
      .then(d => setRepos(d.repos ?? []))
      .catch(() => {})
      .finally(() => setReposLoading(false));
  }, [github]);

  const filteredRepos = repos
    .filter(r => r.full_name.toLowerCase().includes(repoInput.toLowerCase()))
    .slice(0, 8);

  async function saveRepo() {
    const trimmed = repoInput.trim();
    if (!trimmed) return;
    setSaving(true); setError(null); setSaved(false);
    try {
      const res = await fetch("/api/sources/github/repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: trimmed }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setRepo(trimmed);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <SourceHeader
        icon={<GithubIcon />}
        name="GitHub"
        connected={Boolean(github)}
        onConnect={() => { window.location.href = "/api/auth/github/start"; }}
        onReconnect={() => { window.location.href = "/api/auth/github/start"; }}
      />

      {github ? (
        <>
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-gray">Repository</span>
              {!editing && (
                <button onClick={() => { setEditing(true); setRepoInput(repo); }} className="text-[12px] font-medium text-lilac-deep hover:underline">
                  {repo ? "Change" : "Add repo"}
                </button>
              )}
            </div>

            {!editing ? (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface border border-line">
                <span className="font-mono text-[12.5px] flex-1">{repo}</span>
                {saved && <span className="text-[11px] text-good">Saved</span>}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={repoInput}
                    onChange={e => { setRepoInput(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    placeholder={reposLoading ? "Loading repositories…" : "Search or type owner/repo"}
                    className="w-full text-[12.5px] rounded-xl border border-line px-3 py-2 outline-none focus:border-lilac-deep bg-card"
                    autoFocus
                  />
                  {showDropdown && filteredRepos.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-line rounded-xl shadow-lg overflow-hidden">
                      {filteredRepos.map(r => (
                        <button
                          key={r.full_name}
                          type="button"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => { setRepoInput(r.full_name); setShowDropdown(false); inputRef.current?.blur(); }}
                          className="w-full text-left px-3 py-2.5 text-[13px] hover:bg-surface flex items-center gap-2 border-b border-line last:border-0"
                        >
                          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" className="text-gray flex-shrink-0">
                            {r.private
                              ? <path d="M4 5V4a4 4 0 0 1 8 0v1h1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1zm2 0h4V4a2 2 0 0 0-4 0v1zm2 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                              : <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8V1.5Z"/>}
                          </svg>
                          <span className="truncate">{r.full_name}</span>
                          {r.private && <span className="ml-auto text-[10px] text-gray border border-line rounded px-1">Private</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {error && <p className="text-[11.5px] text-[#B3401F]">{error}</p>}
                <div className="flex gap-2 justify-end">
                  {repo && (
                    <button onClick={() => { setEditing(false); setError(null); setRepoInput(repo); }} className="text-[12px] text-gray hover:text-foreground px-3 py-1.5">
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={saveRepo}
                    disabled={!repoInput.trim() || saving}
                    className="btn-dark text-[12px] font-medium px-3 py-1.5 rounded-full disabled:opacity-40"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-[12px] mb-3">
            <div>
              <div className="text-gray mb-0.5">Account</div>
              <div className="font-medium">{github.externalName ?? "—"}</div>
            </div>
            <div>
              <div className="text-gray mb-0.5">Connected</div>
              <div className="font-medium">{timeAgo(github.connectedAt)}</div>
            </div>
          </div>

          <div className="text-[11.5px] text-gray pt-3 border-t border-line flex items-center justify-between">
            <span>
              {repo
                ? "Repository saved — ready to scan."
                : "To connect a different GitHub account, remove and reconnect."}
            </span>
            <button onClick={onDisconnect} disabled={disconnecting} className="text-[#B3401F] hover:underline disabled:opacity-50 ml-4 flex-shrink-0">
              {disconnecting ? "Removing…" : "Remove source"}
            </button>
          </div>
        </>
      ) : (
        <p className="text-[12.5px] text-gray">Connect your GitHub account to scan component files and extract design tokens.</p>
      )}
    </div>
  );
}

export function SourcesClient({ figma: initialFigma, github: initialGithub }: Props) {
  const router = useRouter();
  const { open: openDrawer } = useDrawer();
  const [figma, setFigma] = useState(initialFigma);
  const [github, setGithub] = useState(initialGithub);
  const [disconnecting, setDisconnecting] = useState<"figma" | "github" | null>(null);

  async function disconnect(provider: "figma" | "github") {
    if (!confirm(`Remove ${provider === "figma" ? "Figma" : "GitHub"} connection? This won't delete your scan history.`)) return;
    setDisconnecting(provider);
    try {
      await fetch("/api/sources/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      if (provider === "figma") setFigma(null);
      else setGithub(null);
      router.refresh();
    } finally {
      setDisconnecting(null);
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-[640px]">
      <FigmaCard
        figma={figma}
        onDisconnect={() => disconnect("figma")}
        disconnecting={disconnecting === "figma"}
        onPatConnected={(info) => { setFigma(info); router.refresh(); }}
      />
      <GitHubCard github={github} onDisconnect={() => disconnect("github")} disconnecting={disconnecting === "github"} />

      {(!figma || !github) && (
        <div className="rounded-2xl bg-surface border border-line p-4">
          <p className="text-[12.5px] text-gray">
            Revilo will use mock data for any source that isn&apos;t connected.{" "}
            <button onClick={openDrawer} className="font-medium text-foreground hover:underline">
              Open connect drawer →
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
