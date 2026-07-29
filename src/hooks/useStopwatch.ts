import { useCallback, useEffect, useRef, useState } from "react";
import { emptyStopwatch, stopwatchStore, type StopwatchState } from "@/lib/storage";
import { toTimeInput, type BreakSegment } from "@/lib/time";

export type StopwatchStatus = "idle" | "running" | "paused";

function elapsedOf(state: StopwatchState): number {
  return state.accumulatedMs + (state.startedAt ? Date.now() - state.startedAt : 0);
}

function breakMsOf(state: StopwatchState, now = Date.now()): number {
  return state.breaks.reduce((acc, b) => acc + ((b.endedAt ?? now) - b.startedAt), 0);
}

/** Stopwatch that survives reloads by persisting wall-clock timestamps. */
export function useStopwatch() {
  const [state, setState] = useState<StopwatchState>(emptyStopwatch);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [breakMs, setBreakMs] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const restored = stopwatchStore.load();
    setState(restored);
    setElapsedMs(elapsedOf(restored));
    setBreakMs(breakMsOf(restored));
  }, []);

  useEffect(() => {
    if (!state.active) return;
    const tick = () => {
      setElapsedMs(elapsedOf(stateRef.current));
      setBreakMs(breakMsOf(stateRef.current));
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [state.active, state.startedAt]);

  const commit = useCallback((next: StopwatchState) => {
    setState(next);
    setElapsedMs(elapsedOf(next));
    setBreakMs(breakMsOf(next));
    stopwatchStore.save(next);
  }, []);

  const start = useCallback(
    (description: string) => {
      commit({
        startedAt: Date.now(),
        accumulatedMs: 0,
        description,
        active: true,
        breaks: [],
      });
    },
    [commit],
  );

  /** Pauses the stopwatch and opens a documented break. */
  const pause = useCallback(() => {
    const current = stateRef.current;
    if (!current.startedAt) return;
    const now = Date.now();
    commit({
      ...current,
      accumulatedMs: current.accumulatedMs + (now - current.startedAt),
      startedAt: null,
      breaks: [...current.breaks, { startedAt: now, endedAt: null }],
    });
  }, [commit]);

  /** Resumes work and closes the open break. */
  const resume = useCallback(() => {
    const current = stateRef.current;
    if (current.startedAt || !current.active) return;
    const now = Date.now();
    commit({
      ...current,
      startedAt: now,
      breaks: current.breaks.map((b, i) =>
        i === current.breaks.length - 1 && b.endedAt === null ? { ...b, endedAt: now } : b,
      ),
    });
  }, [commit]);

  const setDescription = useCallback((description: string) => {
    const current = stateRef.current;
    const next = { ...current, description };
    setState(next);
    if (current.active) stopwatchStore.save(next);
  }, []);

  const reset = useCallback(() => {
    setState(emptyStopwatch);
    setElapsedMs(0);
    setBreakMs(0);
    stopwatchStore.clear();
  }, []);

  /** Returns the finished session data (incl. breaks) and clears the stopwatch. */
  const finish = useCallback(() => {
    const current = stateRef.current;
    const now = Date.now();
    const workMs = elapsedOf(current);
    const closed = current.breaks.map((b) => ({
      startedAt: b.startedAt,
      endedAt: b.endedAt ?? now,
    }));
    const totalBreakMs = closed.reduce((acc, b) => acc + (b.endedAt - b.startedAt), 0);
    const end = new Date(now);
    const start = new Date(now - workMs - totalBreakMs);
    const breaks: BreakSegment[] = closed
      .filter((b) => Math.round((b.endedAt - b.startedAt) / 60000) >= 1)
      .map((b) => ({
        start: toTimeInput(new Date(b.startedAt)),
        end: toTimeInput(new Date(b.endedAt)),
      }));
    reset();
    return {
      start,
      end,
      workMs,
      breakMs: totalBreakMs,
      breaks,
      description: current.description,
    };
  }, [reset]);

  const status: StopwatchStatus = !state.active
    ? "idle"
    : state.startedAt
      ? "running"
      : "paused";

  return {
    status,
    elapsedMs,
    breakMs,
    breakCount: state.breaks.length,
    breaks: state.breaks,
    description: state.description,
    setDescription,
    start,
    pause,
    resume,
    finish,
    reset,
  };
}
