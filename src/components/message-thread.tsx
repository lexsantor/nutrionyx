/**
 * Presentational chat thread (docs/build/slice-19-plan.md). Server
 * component: pages fetch, mark read, and pass plain data.
 */
export function MessageThread({
  messages,
  ownSide,
  emptyText,
}: {
  messages: { id: string; sender: string; body: string; sentAt: string }[];
  ownSide: "SPECIALIST" | "PATIENT";
  emptyText: string;
}) {
  if (messages.length === 0) {
    return <p className="text-sm text-ink-subtle">{emptyText}</p>;
  }
  return (
    <ol className="flex flex-col gap-2.5">
      {messages.map((message) => {
        const own = message.sender === ownSide;
        return (
          <li
            key={message.id}
            className={`flex flex-col gap-0.5 ${own ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                own
                  ? "rounded-br-md bg-primary text-on-primary"
                  : "rounded-bl-md bg-surface-2 text-ink"
              }`}
            >
              {message.body}
            </div>
            <span className="px-1 text-xs text-ink-tertiary">
              {message.sentAt}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
