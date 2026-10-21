export function ChetaLoader({ inline = false }: { inline?: boolean }) {
  return <main className={`cheta-loader${inline ? " cheta-loader-inline" : ""}`} aria-label="Loading Cheta"><span className="cheta-loader-bar" /></main>;
}
