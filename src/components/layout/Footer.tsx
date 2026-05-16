export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between">
        <span>Kalshi Dashboard — read-only operator console. Never places orders.</span>
        <span className="font-mono">v1 · predict.watch</span>
      </div>
    </footer>
  );
}
