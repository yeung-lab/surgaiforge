import { useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "./api/client";
import type { ComputeStatusResponse, ModelInfo, ModelRegistryResponse, Run, Video } from "./api/types";
import { DemoBanner } from "./components/DemoBanner";
import { DemoGateHost } from "./components/DemoGate";
import { Header, type AppMode } from "./components/Header";
import { StepFooter } from "./components/StepFooter";
import { StepHeader, type StepHeaderItem } from "./components/StepHeader";
import type { ChipVariant } from "./components/StatusChip";
import { ConnectCompute } from "./components/steps/ConnectCompute";
import { ModelCatalog } from "./components/steps/ModelCatalog";
import { Results } from "./components/steps/Results";
import { RunAnalysis } from "./components/steps/RunAnalysis";
import { SelectVideos } from "./components/steps/SelectVideos";
import { TrainMode } from "./components/train/TrainMode";
import { isDemoMode } from "./demoMode";

type StepNum = 1 | 2 | 3 | 4 | 5;

const STEP_LABELS: Record<StepNum, string> = {
  1: "Model",
  2: "Data",
  3: "Compute",
  4: "Review & run",
  5: "Results",
};

// Survive macOS sleep/wake, browser refresh, backend restart. Only persists
// user-chosen state (step, model, deid, active run id) — API-sourced data like
// video list and models is re-fetched fresh on load.
const LS_KEY = "mint.state.v1";
type Persisted = {
  currentStep?: StepNum;
  selectedModelId?: string | null;
  deIdConfirmed?: boolean;
  activeRunId?: string | null;
  mode?: AppMode;
};
function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Persisted) : {};
  } catch {
    return {};
  }
}
function savePersisted(p: Persisted): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(p));
  } catch {
    /* quota exhausted / disabled — safe to drop */
  }
}

export default function App() {
  const initial = loadPersisted();
  const [online, setOnline] = useState(false);
  // Flips true after the first /api/health round-trip (success OR failure)
  // so the offline banner doesn't flash on initial mount.
  const [hasCheckedHealth, setHasCheckedHealth] = useState(false);
  const [engine, setEngine] = useState<string>();
  // Backend-impostor detection: :8010 returned 200 but it isn't MINT.
  const [wrongService, setWrongService] = useState<string | null>(null);

  // Step 1: model selection
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(
    initial.selectedModelId ?? null,
  );

  // Step 2: videos + de-id
  const [videos, setVideos] = useState<Video[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deIdConfirmed, setDeIdConfirmed] = useState(initial.deIdConfirmed ?? false);

  // Step 3: compute
  const [compute, setCompute] = useState<ComputeStatusResponse | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Step 4/5: run
  const [run, setRun] = useState<Run | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string>();
  const [tick, setTick] = useState(0);

  // Setup wizard — true when the selected model's checkpoints + deploy are ready.
  const [setupReady, setSetupReady] = useState(false);

  // Active step; user navigates with StepHeader + StepFooter.
  const [currentStep, setCurrentStep] = useState<StepNum>(initial.currentStep ?? 1);

  // Top-level mode: 5-step inference flow vs. the Train surface.
  const [mode, setMode] = useState<AppMode>(initial.mode ?? "inference");

  // --- data loading ------------------------------------------------------ //
  const refreshSystem = useCallback(async () => {
    try {
      const health = await api.health();
      // A 200 OK on /api/health isn't enough — something else could be
      // squatting the port. Require the MINT service signature.
      if (health.service && health.service !== "mint") {
        setOnline(false);
        setEngine(undefined);
        setWrongService(health.service);
        return;
      }
      setOnline(true);
      setEngine(health.engine);
      setWrongService(null);
    } catch {
      setOnline(false);
      setEngine(undefined);
      setWrongService(null);
    } finally {
      setHasCheckedHealth(true);
    }

    setModelsLoading(true);
    try {
      const reg: ModelRegistryResponse = await api.models();
      setModels(reg.models);
    } catch {
      setModels([]);
    } finally {
      setModelsLoading(false);
    }

    try {
      const cs = await api.computeStatus();
      setCompute(cs);
    } catch {
      /* keep existing */
    }

    try {
      setVideos((await api.listVideos()).videos);
    } catch {
      /* keep existing */
    }
  }, []);

  useEffect(() => {
    void refreshSystem();
  }, [refreshSystem, tick]);

  // Periodic health poll so the user notices if the MINT process dies.
  // 5s is a sweet spot: fast enough that a crash surfaces almost
  // immediately, slow enough that the backend log isn't drowned in
  // /api/health lines.
  useEffect(() => {
    const id = setInterval(() => void refreshSystem(), 5000);
    return () => clearInterval(id);
  }, [refreshSystem]);

  // --- state persistence (localStorage) -------------------------------- //
  // Mirror user-chosen state to localStorage on every change. Reloads
  // (incl. after macOS sleep killing the browser tab) restore to this state.
  useEffect(() => {
    savePersisted({
      currentStep,
      selectedModelId,
      deIdConfirmed,
      activeRunId: run?.run_id ?? null,
      mode,
    });
  }, [currentStep, selectedModelId, deIdConfirmed, run?.run_id, mode]);

  // One-shot: on mount, if we persisted an active run id, re-fetch it so the
  // UI picks up where it left off (completed, failed, or still running).
  useEffect(() => {
    const persistedRunId = initial.activeRunId;
    if (!persistedRunId) return;
    void (async () => {
      try {
        const r = await api.getRun(persistedRunId);
        setRun(r);
      } catch {
        // Run isn't on the backend anymore (e.g. data dir wiped) — forget it.
        savePersisted({ ...loadPersisted(), activeRunId: null });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- poll an active run ------------------------------------------------ //
  useEffect(() => {
    if (!run || (run.status !== "running" && run.status !== "queued")) return;
    const runId = run.run_id;
    let cancelled = false;
    const id = setInterval(async () => {
      try {
        const latest = await api.getRun(runId);
        if (!cancelled) setRun(latest);
      } catch {
        /* transient */
      }
    }, 900);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [run?.run_id, run?.status]);

  // --- derived ----------------------------------------------------------- //
  const selectedModel = useMemo(
    () => models.find((m) => m.id === selectedModelId) ?? null,
    [models, selectedModelId],
  );
  const readable = useMemo(() => videos.filter((v) => v.readable), [videos]);
  const computeConnected = compute?.status === "connected";
  const runActive = run?.status === "running" || run?.status === "queued";
  const needsSetup = engine !== "mock" && !setupReady;

  // Per-step completion predicates. These drive both the header's done-state
  // and the StepFooter's Continue-enabled logic.
  const stepDone: Record<StepNum, boolean> = {
    1: !!selectedModelId,
    2: readable.length > 0 && deIdConfirmed,
    3: computeConnected && !needsSetup,
    4: !!run,
    5: run?.status === "complete",
  };

  const canRun =
    online &&
    stepDone[1] &&
    stepDone[2] &&
    stepDone[3] &&
    !runActive;

  // Human-readable "why is Run disabled" string — surfaced under the button
  // so the user isn't left guessing at a grayed-out control. First unmet
  // gate wins; checked in step order so the message always points forward.
  const runBlockedReason = (() => {
    if (!online) return "Backend is offline — check the MINT process.";
    if (!stepDone[1]) return "Pick a model in Step 1.";
    if (!stepDone[2]) return "Select at least one video and confirm de-identification in Step 2.";
    if (!stepDone[3]) {
      if (!computeConnected) return "Connect compute in Step 3.";
      return "Finish the model setup in Step 3.";
    }
    if (runActive) return "A run is already in progress.";
    return undefined;
  })();

  const chip = useMemo<{ label: string; variant: ChipVariant; pulse?: boolean }>(() => {
    if (runActive) return { label: "Running", variant: "running", pulse: true };
    if (run?.status === "complete") return { label: "Complete", variant: "complete" };
    if (run?.status === "failed") return { label: "Failed", variant: "failed" };
    if (!online) return { label: "Offline", variant: "idle" };
    return { label: "Ready", variant: "ready" };
  }, [runActive, run?.status, online]);

  // Build the top step pills. A step is clickable if it's done or already
  // reached once (i.e. <= currentStep). Future steps are "upcoming" (locked).
  const stepItems: StepHeaderItem[] = ([1, 2, 3, 4, 5] as StepNum[]).map((n) => {
    const done = stepDone[n] && n !== currentStep;
    let state: StepHeaderItem["state"];
    if (n === currentStep) state = "current";
    else if (done || n < currentStep) state = "done";
    else state = "upcoming";
    return { n, label: STEP_LABELS[n], state };
  });

  const goTo = (n: number) => setCurrentStep(n as StepNum);
  const next = () => setCurrentStep((s) => Math.min(5, s + 1) as StepNum);
  const back = () => setCurrentStep((s) => Math.max(1, s - 1) as StepNum);

  // --- actions ----------------------------------------------------------- //
  const handleUpload = async (files: File[]) => {
    setUploading(true);
    try {
      await api.uploadVideos(files);
      setVideos((await api.listVideos()).videos);
    } catch (e) {
      setStartError(e instanceof ApiError ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const refreshVideos = useCallback(async () => {
    try {
      setVideos((await api.listVideos()).videos);
    } catch {
      /* keep existing list */
    }
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteVideo(id);
      setVideos((vs) => vs.filter((v) => v.id !== id));
    } catch {
      /* ignore */
    }
  };

  const handleConnect = async (credentials?: { token_id: string; token_secret: string }) => {
    setConnecting(true);
    try {
      const cs = await api.computeConnect(credentials);
      setCompute(cs);
    } catch {
      setCompute({
        status: "failed",
        provider: "modal",
        provider_label: "Modal",
        message: "Connection failed. Check that the backend is running.",
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const cs = await api.computeDisconnect();
      setCompute(cs);
    } catch {
      /* ignore */
    }
  };

  const handleRun = async () => {
    setStarting(true);
    setStartError(undefined);
    try {
      const r = await api.createRun(readable.map((v) => v.id), selectedModelId ?? "step");
      setRun(r);
      setCurrentStep(5);
    } catch (e) {
      setStartError(e instanceof ApiError ? e.message : "Failed to start run.");
    } finally {
      setStarting(false);
    }
  };

  const handleBackendChange = () => {
    setRun(null);
    setStartError(undefined);
    setTick((t) => t + 1);
  };

  const handleNewAnalysis = () => {
    setRun(null);
    setStartError(undefined);
    setCurrentStep(1);
  };

  // --- step bodies ------------------------------------------------------- //
  // Each case returns [card, footer] siblings so .step-footer's negative
  // margin-top closes the step-main flex gap and the two visually fuse as
  // one card — rather than overlapping the card's own trailing content.
  const renderStep = () => {
    const demoBanner = online && engine === "mock" && currentStep === 1 && (
      <div className="demo-banner" style={{ marginBottom: 20 }}>
        <span>
          <b>Demo mode.</b> Results are simulated. Connect to real compute to run
          actual inference.
        </span>
      </div>
    );
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="step-card">
              {demoBanner}
              <ModelCatalog
                models={models}
                selectedId={selectedModelId}
                onSelect={setSelectedModelId}
                loading={modelsLoading}
              />
            </div>
            <StepFooter
              continueLabel="Continue to data →"
              canContinue={stepDone[1]}
              blockedReason={!stepDone[1] ? "Select a model to continue" : undefined}
              onContinue={next}
              leftNote={
                selectedModel
                  ? `Selected: ${selectedModel.name}`
                  : undefined
              }
            />
          </>
        );
      case 2:
        return (
          <>
            <div className="step-card">
              <SelectVideos
                videos={videos}
                uploading={uploading}
                onUpload={handleUpload}
                onDelete={handleDelete}
                onLinked={refreshVideos}
                deIdConfirmed={deIdConfirmed}
                onDeIdChange={setDeIdConfirmed}
              />
            </div>
            <StepFooter
              onBack={back}
              continueLabel="Continue to compute →"
              canContinue={stepDone[2]}
              blockedReason={
                readable.length === 0
                  ? "Add at least one readable video"
                  : !deIdConfirmed
                    ? "Confirm de-identification to continue"
                    : undefined
              }
              onContinue={next}
              leftNote={
                readable.length > 0
                  ? `${readable.length} video${readable.length !== 1 ? "s" : ""}`
                  : undefined
              }
            />
          </>
        );
      case 3:
        return (
          <>
            <div className="step-card">
              <ConnectCompute
                compute={compute}
                connecting={connecting}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onComputeRefresh={setCompute}
                modalConnected={computeConnected}
                models={models}
                selectedModelId={selectedModelId}
                onSetupReadyChange={setSetupReady}
                engine={engine}
              />
            </div>
            <StepFooter
              onBack={back}
              continueLabel="Continue to review →"
              canContinue={stepDone[3]}
              blockedReason={
                !computeConnected
                  ? "Connect a compute provider to continue"
                  : needsSetup
                    ? "Finish setup above (upload checkpoints and deploy)"
                    : undefined
              }
              onContinue={next}
            />
          </>
        );
      case 4:
        return (
          <>
            <div className="step-card">
              <RunAnalysis
                run={null}
                selectedModel={selectedModel}
                videoCount={readable.length}
                computeLabel={
                  computeConnected ? (compute?.provider_label ?? "Modal") : "Not connected"
                }
                canRun={canRun}
                starting={starting}
                blockedReason={undefined}
                onRun={handleRun}
                onChangeStep={goTo}
              />
            </div>
            <StepFooter
              onBack={back}
              continueLabel={starting ? "Starting…" : "Run inference"}
              canContinue={canRun && !starting}
              blockedReason={startError ?? runBlockedReason}
              onContinue={handleRun}
              continueVariant="success"
              leftNote={
                readable.length > 0
                  ? `${readable.length} video${readable.length !== 1 ? "s" : ""}`
                  : undefined
              }
            />
          </>
        );
      case 5:
        return (
          <div className="step-card">
            <Results
              run={run}
              selectedModel={selectedModel}
              onNewAnalysis={handleNewAnalysis}
            />
          </div>
        );
    }
  };

  return (
    <>
      {isDemoMode() && <DemoBanner />}
      <Header
        runId={run?.run_id}
        chip={chip}
        online={online}
        engine={engine}
        onBackendChange={handleBackendChange}
        mode={mode}
        onModeChange={setMode}
      />
      <div className="app-shell">
        {wrongService && !isDemoMode() && (
          <div className="service-mismatch-banner" role="alert">
            <b>Wrong backend on this port.</b> A different service
            (<span className="mono">{wrongService}</span>) is answering where
            MINT should be. Quit it and restart the MINT backend on
            <span className="mono"> :8010</span>.
          </div>
        )}
        {hasCheckedHealth && !online && !wrongService && !isDemoMode() && (
          <div className="service-mismatch-banner" role="alert">
            <b>Backend offline.</b> MINT can't reach its own backend.
            Retrying every 5 seconds — if this persists, the MINT process
            may have crashed. Check
            <span className="mono"> ~/Library/Logs/MINT/mint.log</span>.
          </div>
        )}
        {mode === "inference" ? (
          <>
            <StepHeader steps={stepItems} onNavigate={goTo} />
            <main className="step-main">
              {renderStep()}
              <div className="footer">SurgAI Forge · Mint · Model Inference &amp; No-code Training</div>
            </main>
          </>
        ) : (
          <main className="step-main">
            <TrainMode
              videos={videos}
              uploading={uploading}
              onUpload={handleUpload}
              onLinked={refreshVideos}
            />
            <div className="footer">SurgAI Forge · Mint · Model Inference &amp; No-code Training</div>
          </main>
        )}
      </div>
      {isDemoMode() && <DemoGateHost />}
    </>
  );
}
