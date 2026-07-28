import { useCallback, useEffect, useRef, useState } from "react";
import { emptyStopwatch, stopwatchStore, type StopwatchState } from "@/lib/storage";

export type StopwatchStatus = "idle" | "running" | "paused";

function elapsedOf(state: StopwatchState): number {
  return state.accumulatedMs + (state.startedAt ? Date.now() - state.startedAt : 0);
}

/** Stopwatch that survives reloads by persisting wall-clock timestamps. */
export function useStopwatch() {
  const [state, setState] = useState<StopwatchState>(emptyStopwatch);
  const [elapsedMs, setElapsedMs] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const restored = stopwatchStore.load();
    setState(restored);
    setElapsedMs(elapsedOf(restored));
  }, []);

  useEffect(() => {
    if (!state.startedAt) return;
    const tick = () => setElapsedMs(elapsedOf(stateRef.current));
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [state.startedAt]);

  const commit = useCallback((next: StopwatchState) => {
    setState(next);
    setElapsedMs(elapsedOf(next));
    stopwatchStore.save(next);
  }, []);

  const start = useCallback(
    (description: string) => {
      commit({
        startedAt: Date.now(),
        accumulatedMs: 0,
        description,
        active: true,
      });
    },
    [commit],
  );

  const pause = useCallback(() => {
    const current = stateRef.current;
    if (!current.startedAt) return;
    commit({
      ...current,
      accumulatedMs: current.accumulatedMs + (Date.now() - current.startedAt),
      startedAt: null,
    });
  }, [commit]);

  const resume = useCallback(() => {
    const current = stateRef.current;
    if (current.startedAt || !current.active) return;
    commit({ ...current, startedAt: Date.now() });
  }, [commit]);

  const setDescription = useCallback(
    (description: string) => {
      const current = stateRef.current;
      const next = { ...current, description };
      setState(next);
      if (current.active) stopwatchStore.save(next);
    },
    [],
  );

  const reset = useCallback(() => {
    setState(emptyStopwatch);
    setElapsedMs(0);
    stopwatchStore.clear();
  }, []);

  /** Returns the finished session data and clears the stopwatch. */
  const finish = useCallback(() => {
    const current = stateRef.current;
    const totalMs = elapsedOf(current);
    const end = new Date();
    const start = new Date(end.getTime() - totalMs);
    reset();
    return { start, end, totalMs, description: current.description };
  }, [reset]);

  const status: StopwatchStatus = !state.active
    ? "idle"
    : state.startedAt
      ? "running"
      : "paused";

  return {
    status,
    elapsedMs,
    description: state.description,
    setDescription,
    start,
    pause,
    resume,
    finish,
    reset,
  };
}
