import { useEffect } from "react";

/** Runs an async loader on mount and whenever its identity changes. */
export function useLoad(load: () => void | Promise<unknown>) {
  useEffect(() => {
    void load();
  }, [load]);
}
