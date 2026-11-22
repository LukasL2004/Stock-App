import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { ToastContext, type ToastApi } from "./useToast";
import { IoCheckmarkCircle, IoCloseCircle, IoInformationCircle, IoClose } from "react-icons/io5";

type Kind = "success" | "error" | "info";
interface Toast {
  id: number;
  kind: Kind;
  title: string;
  detail?: string;
}


export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setItems((l) => l.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (kind: Kind, title: string, detail?: string) => {
      const id = ++seq.current;
      setItems((l) => [...l.slice(-3), { id, kind, title, detail }]);
      window.setTimeout(() => dismiss(id), kind === "error" ? 6000 : 3800);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (t, d) => push("success", t, d),
      error: (t, d) => push("error", t, d),
      info: (t, d) => push("info", t, d),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-region" role="status" aria-live="polite" aria-atomic="false">
        {items.map((t) => (
          <div key={t.id} className={`toast toast-${t.kind}`}>
            <span className="toast-icon" aria-hidden="true">
              {t.kind === "success" ? <IoCheckmarkCircle /> : t.kind === "error" ? <IoCloseCircle /> : <IoInformationCircle />}
            </span>
            <div className="toast-body">
              <p className="toast-title">{t.title}</p>
              {t.detail && <p className="toast-detail">{t.detail}</p>}
            </div>
            <button className="toast-close" aria-label="Dismiss" onClick={() => dismiss(t.id)}>
              <IoClose />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

