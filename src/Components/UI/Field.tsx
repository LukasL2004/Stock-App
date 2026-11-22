import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  error?: string;
  hint?: string;
  labelAside?: ReactNode;
  start?: ReactNode;
}

export default function Field({ label, error, hint, labelAside, start, type, className = "", ...rest }: Props) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;

  return (
    <div className={`field ${className}`}>
      <label className="field-label" htmlFor={id}>
        <span>{label}</span>
        {labelAside}
      </label>
      <div className={`input-wrap${error ? " is-invalid" : ""}`}>
        {start && <span className="input-adorn">{start}</span>}
        <input id={id} type={inputType} aria-invalid={!!error || undefined} aria-describedby={describedBy} {...rest} />
        {isPassword && (
          <span className="input-adorn input-adorn-end">
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}>
              {show ? <IoEyeOffOutline /> : <IoEyeOutline />}
            </button>
          </span>
        )}
      </div>
      {error ? (
        <p id={`${id}-err`} className="field-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
