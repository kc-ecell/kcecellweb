import { Panel } from "@/components/ui/Panel";

/** Panel with a mono `> no results` line, one sentence, one action.
 *  Copy rule: say what's true, when it changes, one action (docs/CONTENT.md §11). */
export function EmptyState({
  line = "no results",
  message,
  action,
}: {
  line?: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <Panel title="query.sh">
      <p className="text-fg font-mono text-sm">
        <span className="text-lime">&gt;</span> {line}
      </p>
      <p className="text-fg-muted mt-2 max-w-prose text-sm">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </Panel>
  );
}
