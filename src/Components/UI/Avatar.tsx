import { initials } from "../../lib/format";

export default function Avatar({ first, last, size = "md" }: { first?: string; last?: string; size?: "md" | "lg" }) {
  return (
    <span className={`avatar${size === "lg" ? " avatar-lg" : ""}`} aria-hidden="true">
      {initials(first, last, "")}
    </span>
  );
}
