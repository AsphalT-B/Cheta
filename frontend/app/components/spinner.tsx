export function Spinner({ label }: { label?: string }) {
  return <span className="submit-status"><span className="submit-spinner" aria-hidden="true" />{label && <span>{label}</span>}</span>;
}
