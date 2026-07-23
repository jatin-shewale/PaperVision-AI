import { useEffect, useRef } from "react";

/** Polls `fn` every `intervalMs` until `shouldStop(result)` returns true. */
export function usePolling(fn, intervalMs, shouldStop, deps = []) {
  const stopped = useRef(false);
  useEffect(() => {
    stopped.current = false;
    const id = setInterval(async () => {
      if (stopped.current) return;
      const result = await fn();
      if (shouldStop(result)) {
        stopped.current = true;
        clearInterval(id);
      }
    }, intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
