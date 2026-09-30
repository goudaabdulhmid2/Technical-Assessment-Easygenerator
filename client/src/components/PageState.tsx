interface PageStateProps {
  label: string;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
}

export function PageState({ label, actionLabel, onAction, loading = true }: PageStateProps) {
  return (
    <main className="page-state" aria-live="polite">
      {loading && <span className="loader" aria-hidden="true" />}
      <p>{label}</p>
      {actionLabel && onAction && <button className="button button-secondary" onClick={onAction}>{actionLabel}</button>}
    </main>
  );
}
