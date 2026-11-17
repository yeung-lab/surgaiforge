import { useEffect, useState } from "react";
import { api, ApiError } from "../../api/client";
import type {
  ComputeCapability,
  ComputeStatusResponse,
  DiscoveredWorker,
  ModelInfo,
  WorkerPairResponse,
} from "../../api/types";
import { isDemoMode } from "../../demoMode";
import { Setup } from "../Setup";

function StatusPill({ status }: { status: ComputeStatusResponse["status"] }) {
  const map: Record<ComputeStatusResponse["status"], { label: string; cls: string }> = {
    not_connected: { label: "Not connected", cls: "pill-pending" },
    connecting: { label: "Connecting…", cls: "pill-running" },
    connected: { label: "Connected", cls: "pill-ready" },
    failed: { label: "Connection failed", cls: "pill-error" },
  };
  const { label, cls } = map[status] ?? map.not_connected;
  return <span className={`status-pill ${cls}`}>{label}</span>;
}

type Props = {
  compute: ComputeStatusResponse | null;
  connecting: boolean;
  onConnect: (credentials?: { token_id: string; token_secret: string }) => void;
  onDisconnect: () => void;
  onComputeRefresh: (next: ComputeStatusResponse) => void;
  // props passed through to the folded-in Setup wizard
  modalConnected: boolean;
  models: ModelInfo[];
  selectedModelId: string | null;
  onSetupReadyChange: (ready: boolean) => void;
  engine?: string;
};

export function ConnectCompute({
  compute,
  connecting,
  onConnect,
  onDisconnect,
  onComputeRefresh,
  modalConnected,
  models,
  selectedModelId,
  onSetupReadyChange,
  engine,
}: Props) {
  const activeProvider = compute?.provider ?? "modal";
  const isModalConnected = compute?.status === "connected" && activeProvider === "modal";
  const isWorkerConnected = compute?.status === "connected" && activeProvider === "http_worker";
  const anyConnected = isModalConnected || isWorkerConnected;

  // Modal form state
  const [tokenId, setTokenId] = useState("");
  const [tokenSecret, setTokenSecret] = useState("");
  const [revealSecret, setRevealSecret] = useState(false);
  const [showModalForm, setShowModalForm] = useState(false);

  // Worker form state
  const [workerUrl, setWorkerUrl] = useState("");
  const [workerCode, setWorkerCode] = useState("");
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [workerBusy, setWorkerBusy] = useState(false);
  const [workerError, setWorkerError] = useState<string | null>(null);
  const [nearby, setNearby] = useState<DiscoveredWorker[]>([]);
  const [nearbyScanning, setNearbyScanning] = useState(false);
  const [nearbyMsg, setNearbyMsg] = useState<string | null>(null);

  // Scan for nearby workers whenever the user opens the Worker form.
  useEffect(() => {
    if (!showWorkerForm || isWorkerConnected) return;
    let cancelled = false;
    (async () => {
      setNearbyScanning(true);
      setNearbyMsg(null);
      try {
        const res = await api.computeDiscoverWorkers();
        if (cancelled) return;
        setNearby(res.workers);
        setNearbyMsg(res.message);
      } catch (err) {
        if (cancelled) return;
        setNearbyMsg(err instanceof ApiError ? err.message : "LAN scan failed.");
      } finally {
        if (!cancelled) setNearbyScanning(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showWorkerForm, isWorkerConnected]);

  const canSubmitModal =
    tokenId.trim().length > 0 && tokenSecret.trim().length > 0 && !connecting;

  const submitModal = () => {
    if (!canSubmitModal) return;
    onConnect({ token_id: tokenId.trim(), token_secret: tokenSecret.trim() });
  };

  const submitWorker = async () => {
    const url = workerUrl.trim();
    if (!url) return;
    setWorkerBusy(true);
    setWorkerError(null);
    try {
      const res: WorkerPairResponse = await api.computePairWorker({
        url,
        code: workerCode.trim() || null,
      });
      onComputeRefresh({
        status: res.status,
        provider: res.provider,
        provider_label: res.provider_label,
        message: res.message,
      });
      if (res.status === "connected") {
        setShowWorkerForm(false);
        setWorkerCode("");
      } else {
        setWorkerError(res.message);
      }
    } catch (err) {
      setWorkerError(err instanceof ApiError ? err.message : "Pairing failed.");
    } finally {
      setWorkerBusy(false);
    }
  };

  const disconnectWorker = async () => {
    try {
      const next = await api.computeUnpairWorker();
      onComputeRefresh(next);
    } catch (err) {
      setWorkerError(err instanceof ApiError ? err.message : "Could not disconnect worker.");
    }
  };

  const otherConnected =
    (isModalConnected && showWorkerForm) ||
    (isWorkerConnected && showModalForm);

  // One-shot "switch backend" — disconnects whichever is active so the user
  // can pair the other one. Two backends, two disconnect paths, one action.
  const switchBackend = () => {
    if (isModalConnected) {
      onDisconnect();
    } else if (isWorkerConnected) {
      void disconnectWorker();
    }
  };

  if (isDemoMode()) {
    return (
      <>
        <div className="step-eyebrow">STEP 3 OF 5</div>
        <h1 className="step-title">Connect compute</h1>
        <p className="step-sub">
          Surgical AI models need a GPU. In the real app you pick where runs
          happen — a cloud account you control, or a GPU box on your own
          network. In this demo, an example compute connection is already in
          place.
        </p>
        <div
          style={{
            marginTop: 18,
            padding: "22px 24px",
            border: "1px solid #DCE0E6",
            borderRadius: 12,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 20, fontWeight: 600, color: "#1A2744", marginBottom: 4 }}>
              Cloud (demo)
            </div>
            <div style={{ fontSize: 14, color: "#5A6478", lineHeight: 1.5 }}>
              Example compute connection for the demo. No real inference runs; nothing is uploaded.
            </div>
          </div>
          <StatusPill status="connected" />
        </div>
        <div className="callout info" style={{ marginTop: 16, fontSize: 13.5 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M4.5 11a2.5 2.5 0 010-5 3.5 3.5 0 016.8-.9A2.5 2.5 0 1111.5 11z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span>
            Real compute setup — credentials, worker pairing, model checkpoints — is one of the first things you'll do after downloading MINT.
          </span>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="step-eyebrow">STEP 3 OF 5</div>
      <h1 className="step-title">Connect compute</h1>
      <p className="step-sub">
        Surgical AI models need a GPU. Pick where runs happen: a cloud account
        you control (Modal), or a GPU box on your own network (Worker). MINT
        remembers your choice.
      </p>

      {anyConnected && (
        <div
          className="callout"
          style={{
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <span>
            You're connected to <strong>{compute?.provider_label}</strong>.
            MINT uses one backend at a time — switch to try another.
          </span>
          <button
            className="btn"
            style={{
              background: "var(--cardinal)",
              borderColor: "var(--cardinal)",
              color: "#fff",
              whiteSpace: "nowrap",
            }}
            onClick={switchBackend}
          >
            Switch backend
          </button>
        </div>
      )}

      {/* ---- Modal row ---- */}
      <div className="compute-row">
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#1a1f28",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--serif)",
              fontWeight: 700,
            }}
            aria-hidden
          >
            M
          </div>
          <div className="compute-provider">
            <div className="compute-provider-name">
              Modal{" "}
              {isModalConnected && <StatusPill status="connected" />}
            </div>
            <div className="compute-provider-sub">
              Cloud GPU · bring your own account
            </div>
          </div>
        </div>
        <div className="compute-status-area">
          {isModalConnected ? (
            <button className="btn" onClick={onDisconnect}>Disconnect</button>
          ) : (
            <button
              className="btn"
              style={{
                background: !isWorkerConnected ? "var(--cardinal)" : undefined,
                borderColor: !isWorkerConnected ? "var(--cardinal)" : undefined,
                color: !isWorkerConnected ? "#fff" : undefined,
              }}
              onClick={() => setShowModalForm((v) => !v)}
              disabled={isWorkerConnected}
              title={isWorkerConnected ? "Disconnect the current backend first" : undefined}
            >
              {showModalForm ? "Cancel" : "Connect"}
            </button>
          )}
        </div>
      </div>

      {!isModalConnected && showModalForm && (
        <div className="cred-form" style={{ marginTop: 16 }}>
          <label className="cred-field">
            <span className="cred-label">Token ID</span>
            <input
              className="cred-input mono"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="ak-..."
              spellCheck={false}
              autoComplete="off"
            />
          </label>
          <label className="cred-field">
            <span className="cred-label">Token secret</span>
            <div className="cred-input-wrap">
              <input
                className="cred-input mono"
                type={revealSecret ? "text" : "password"}
                value={tokenSecret}
                onChange={(e) => setTokenSecret(e.target.value)}
                placeholder="as-..."
                spellCheck={false}
                autoComplete="off"
              />
              <button
                type="button"
                className="cred-reveal"
                onClick={() => setRevealSecret((v) => !v)}
                tabIndex={-1}
              >
                {revealSecret ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          <div className="cred-actions">
            <button
              className="btn"
              style={{
                background: canSubmitModal ? "var(--cardinal)" : undefined,
                borderColor: canSubmitModal ? "var(--cardinal)" : undefined,
                color: canSubmitModal ? "#fff" : undefined,
              }}
              onClick={submitModal}
              disabled={!canSubmitModal}
            >
              {connecting ? "Connecting…" : "Connect"}
            </button>
            <a
              href="https://modal.com/settings/tokens"
              target="_blank"
              rel="noreferrer"
              className="cred-help"
            >
              Get a token →
            </a>
          </div>
        </div>
      )}

      {compute?.status === "failed" && activeProvider === "modal" && compute?.message && (
        <div className="callout error" style={{ marginTop: 14 }}>
          <span>{compute.message}</span>
        </div>
      )}

      {/* ---- Worker row ---- */}
      <div className="compute-row" style={{ marginTop: 12 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#2d3748",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--serif)",
              fontWeight: 700,
            }}
            aria-hidden
          >
            W
          </div>
          <div className="compute-provider">
            <div className="compute-provider-name">
              {isWorkerConnected ? compute?.provider_label : "Worker"}{" "}
              {isWorkerConnected && <StatusPill status="connected" />}
            </div>
            <div className="compute-provider-sub">
              Your GPU box · videos never leave your network
            </div>
          </div>
        </div>
        <div className="compute-status-area">
          {isWorkerConnected ? (
            <button className="btn" onClick={disconnectWorker}>Disconnect</button>
          ) : (
            <button
              className="btn"
              style={{
                background: !isModalConnected ? "var(--cardinal)" : undefined,
                borderColor: !isModalConnected ? "var(--cardinal)" : undefined,
                color: !isModalConnected ? "#fff" : undefined,
              }}
              onClick={() => setShowWorkerForm((v) => !v)}
              disabled={isModalConnected}
              title={isModalConnected ? "Disconnect the current backend first" : undefined}
            >
              {showWorkerForm ? "Cancel" : "Connect"}
            </button>
          )}
        </div>
      </div>

      {!isWorkerConnected && showWorkerForm && (
        <div className="cred-form" style={{ marginTop: 16 }}>
          {/* Nearby-workers chip row — populated by a 2s mDNS scan. */}
          <div style={{ marginBottom: 4 }}>
            <div className="cred-label" style={{ marginBottom: 6 }}>
              Nearby workers on your network
            </div>
            {nearbyScanning && (
              <div className="cred-help">Scanning the LAN…</div>
            )}
            {!nearbyScanning && nearby.length === 0 && (
              <div className="cred-help">
                {nearbyMsg || "No workers advertised."}{" "}
                Type a URL below if your worker is elsewhere.
              </div>
            )}
            {!nearbyScanning && nearby.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {nearby.map((w) => (
                  <button
                    key={w.url}
                    type="button"
                    className="btn"
                    onClick={() => setWorkerUrl(w.url)}
                    title={`${w.hostname} · ${w.models.length} model(s)`}
                    style={{ padding: "6px 10px", fontSize: 13 }}
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <label className="cred-field">
            <span className="cred-label">Worker URL</span>
            <input
              className="cred-input mono"
              value={workerUrl}
              onChange={(e) => setWorkerUrl(e.target.value)}
              placeholder="http://192.168.1.50:8080"
              spellCheck={false}
              autoComplete="off"
            />
          </label>
          <label className="cred-field">
            <span className="cred-label">Pairing code (6 digits, from the worker)</span>
            <input
              className="cred-input mono"
              value={workerCode}
              onChange={(e) => setWorkerCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              maxLength={6}
              spellCheck={false}
              autoComplete="off"
            />
          </label>
          <div className="cred-help">
            Leave blank if your worker was booted with
            <code style={{ margin: "0 4px" }}>MINT_WORKER_NO_AUTH=1</code>
            (trusted LAN only). Not sure?{" "}
            <a
              href="https://github.com/alanbrown4700/mint/blob/main/worker/README.md"
              target="_blank"
              rel="noreferrer"
            >
              Networking guide →
            </a>
          </div>
          <div className="cred-actions">
            <button
              className="btn"
              style={{
                background:
                  workerUrl.trim() && !workerBusy ? "var(--cardinal)" : undefined,
                borderColor:
                  workerUrl.trim() && !workerBusy ? "var(--cardinal)" : undefined,
                color: workerUrl.trim() && !workerBusy ? "#fff" : undefined,
              }}
              onClick={submitWorker}
              disabled={!workerUrl.trim() || workerBusy}
            >
              {workerBusy ? "Pairing…" : "Pair"}
            </button>
          </div>
          {workerError && (
            <div className="callout error" style={{ marginTop: 10 }}>
              <span>{workerError}</span>
            </div>
          )}
        </div>
      )}

      {otherConnected && (
        <div className="callout" style={{ marginTop: 12 }}>
          <span>Only one compute backend is active at a time. Disconnect the current one to switch.</span>
        </div>
      )}

      {/* ---- Explainer (shown only when nothing is connected) ---- */}
      {!anyConnected && (
        <>
          <div className="where-section-head">Where things happen</div>
          <div className="where-grid">
            <div className="where-card">
              <div className="where-card-icon" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="3" width="12" height="8" rx="1.2"
                    stroke="currentColor" strokeWidth="1.4" />
                  <path d="M6 13h4M8 11v2" stroke="currentColor"
                    strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <div className="where-card-text">
                <div className="where-card-title">On this computer</div>
                <div className="where-card-body">
                  Credentials are stored locally. MINT only sends them to the
                  backend you pick.
                </div>
              </div>
            </div>
            <div className="where-card">
              <div className="where-card-icon" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4.5 11a2.5 2.5 0 010-5 3.5 3.5 0 016.8-.9A2.5 2.5 0 1111.5 11z"
                    stroke="currentColor" strokeWidth="1.4"
                    strokeLinejoin="round" fill="none"
                  />
                </svg>
              </div>
              <div className="where-card-text">
                <div className="where-card-title">Modal</div>
                <div className="where-card-body">
                  Videos are uploaded to a GPU in your Modal workspace; results
                  come back here. Nothing is retained after the run.
                </div>
              </div>
            </div>
            <div className="where-card">
              <div className="where-card-icon" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="3" width="10" height="10" rx="1.2"
                    stroke="currentColor" strokeWidth="1.4" />
                  <rect x="6" y="6" width="4" height="4" fill="currentColor" opacity=".4" />
                </svg>
              </div>
              <div className="where-card-text">
                <div className="where-card-title">Worker</div>
                <div className="where-card-body">
                  A GPU box on your own network runs the model. Surgical video
                  never transits MINT or any cloud.
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal has an in-app Setup wizard (checkpoint upload + deploy). A
          BYOC worker ships real handlers from the operator's own host, so
          its "setup" lives outside MINT. Show one or the other, never both. */}
      {isModalConnected && engine !== "mock" && (
        <div style={{ marginTop: 24 }}>
          <Setup
            modalConnected={modalConnected}
            models={models}
            selectedModelId={selectedModelId}
            onReadyChange={onSetupReadyChange}
          />
        </div>
      )}

      {anyConnected && !isModalConnected && engine !== "mock" && (
        <ExternalSetupHint
          provider={activeProvider}
          providerLabel={compute?.provider_label ?? ""}
          models={models}
          onReady={onSetupReadyChange}
        />
      )}
    </>
  );
}

// --------------------------------------------------------------------------- //
// Non-Modal providers (today: BYOC Worker) manage their own model setup.
// Show a short info card and immediately unlock the run gate so the user
// can proceed to the actual inference.
// --------------------------------------------------------------------------- //
function ExternalSetupHint({
  provider,
  providerLabel,
  models,
  onReady,
}: {
  provider: string;
  providerLabel: string;
  models: ModelInfo[];
  onReady: (ready: boolean) => void;
}) {
  const [caps, setCaps] = useState<ComputeCapability[]>([]);

  // Set the ready flag on mount only — don't clear it on unmount, since
  // the user navigating away from Step 3 (which unmounts ConnectCompute)
  // shouldn't invalidate Step 4's Run button. A later disconnect flips
  // `computeConnected` upstream, which closes the Step 3 gate on its own.
  useEffect(() => {
    onReady(true);
  }, [onReady]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.computeCapabilities();
        if (!cancelled) setCaps(res.capabilities);
      } catch {
        if (!cancelled) setCaps([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [provider]);

  const body: Record<string, { what: string; where: string }> = {
    http_worker: {
      what: "Your worker already has handlers for every model (mocks by default, real handlers where you've installed the SOAR repos).",
      where: "To swap a mock for real inference, drop a real_<model>.py handler into worker/handlers/ on the worker host and restart it.",
    },
  };
  const info = body[provider] ?? {
    what: `${providerLabel} runs the real inference stack.`,
    where: "No in-app setup needed — model config lives on the provider.",
  };

  const nameFor = (mid: string) => models.find((m) => m.id === mid)?.name ?? mid;

  return (
    <div className="callout" style={{ marginTop: 24, flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
      <strong>Model setup — handled by {providerLabel}</strong>
      <span>{info.what}</span>
      <span style={{ color: "var(--muted)", fontSize: 13 }}>{info.where}</span>

      {caps.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
          {caps.map((c) => (
            <CapabilityBadge key={c.model_id} label={nameFor(c.model_id)} kind={c.kind} />
          ))}
        </div>
      )}
    </div>
  );
}

function CapabilityBadge({
  label,
  kind,
}: {
  label: string;
  kind: ComputeCapability["kind"];
}) {
  // SurgAI palette — mint teal = ready/real (reuses the status-only color),
  // sandstone muted = mock, cardinal muted = not configured, grey = unknown.
  const STYLES: Record<ComputeCapability["kind"], { bg: string; fg: string; title: string }> = {
    real: {
      bg: "#E6F1EC",
      fg: "#1A6E50",
      title: "Real handler — runs the actual pipeline.",
    },
    mock: {
      bg: "#FBF4E4",
      fg: "#8A6D1A",
      title: "Mock handler — returns canned bytes for plumbing tests only.",
    },
    not_configured: {
      bg: "#F5E6E6",
      fg: "#8C1515",
      title: "No endpoint/template configured for this model. Add one on the provider side, then disconnect + reconnect.",
    },
    unknown: {
      bg: "#EEEFF0",
      fg: "#555B66",
      title: "Capability not reported.",
    },
  };
  const style = STYLES[kind];
  return (
    <span
      title={style.title}
      style={{
        background: style.bg,
        color: style.fg,
        padding: "3px 8px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "-0.01em",
      }}
    >
      {label} · {kind === "not_configured" ? "not set" : kind}
    </span>
  );
}
