import { IoAlertCircle, IoCheckmarkCircle } from "react-icons/io5";

export default function FormError({ message, ok = false }: { message?: string | null; ok?: boolean }) {
  if (!message) return null;
  return (
    <div className={`form-error${ok ? " form-ok" : ""}`} role={ok ? "status" : "alert"}>
      {ok ? <IoCheckmarkCircle /> : <IoAlertCircle />}
      <span>{message}</span>
    </div>
  );
}
