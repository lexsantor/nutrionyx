import { getFormatter, getTranslations } from "next-intl/server";
import { ScrollAnchor } from "./scroll-anchor";
import {
  dayLabelKind,
  groupThread,
  type ThreadMessage,
} from "@/modules/messaging/thread";

/**
 * The thread, read as a dated record rather than as a chat log.
 *
 * The channel is asynchronous and deliberately not urgent, so the structure
 * that carries meaning is time: a day rule opens each day, and consecutive
 * messages from one side collapse into a run whose last bubble carries the
 * hour. Before this, three replies in the same minute printed the same full
 * date three times and a month of silence looked like no gap at all.
 *
 * The day rule is left-aligned with the line running out to the right, which
 * is a clinical record's date entry rather than the centred pill a messaging
 * app uses. That is the register this channel wants.
 *
 * Alignment and colour say who spoke; neither is available to a screen
 * reader, so every run also carries its author as text only it will read.
 */
export async function MessageThread({
  messages,
  ownSide,
  emptyText,
  senderNames,
}: {
  messages: ThreadMessage[];
  ownSide: "SPECIALIST" | "PATIENT";
  emptyText: string;
  senderNames: { own: string; other: string };
}) {
  const t = await getTranslations("messages");
  const format = await getFormatter();

  if (messages.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-hairline-strong px-6 py-10 text-center text-sm text-ink-subtle">
        {emptyText}
      </p>
    );
  }

  const days = groupThread(messages);

  return (
    <ol className="flex flex-col gap-7">
      {days.map((day) => {
        const kind = dayLabelKind(day.key);
        const label =
          kind.kind === "today"
            ? t("days.today")
            : kind.kind === "yesterday"
              ? t("days.yesterday")
              : format.dateTime(day.date, {
                  day: "numeric",
                  month: "long",
                  ...(day.date.getFullYear() === new Date().getFullYear()
                    ? {}
                    : { year: "numeric" }),
                });

        return (
          <li key={day.key} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                {label}
              </h2>
              <span className="h-px flex-1 bg-hairline" aria-hidden="true" />
            </div>

            <ol className="flex flex-col gap-3">
              {day.runs.map((run, runIndex) => {
                const own = run.sender === ownSide;
                const last = run.messages.at(-1)!;
                return (
                  <li
                    key={`${day.key}-${runIndex}`}
                    className={`flex flex-col gap-1 ${own ? "items-end" : "items-start"}`}
                  >
                    <span className="sr-only">
                      {own ? senderNames.own : senderNames.other}
                    </span>
                    {run.messages.map((message, i) => {
                      const tail = i === run.messages.length - 1;
                      return (
                        <p
                          key={message.id}
                          className={`max-w-[min(85%,34rem)] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                            own
                              ? `bg-primary text-on-primary ${tail ? "rounded-br-md" : ""}`
                              : `border border-hairline bg-surface-1 text-ink ${tail ? "rounded-bl-md" : ""}`
                          }`}
                        >
                          {message.body}
                        </p>
                      );
                    })}
                    <time
                      dateTime={last.createdAt.toISOString()}
                      className="px-1 text-xs tabular-nums text-ink-subtle"
                    >
                      {format.dateTime(last.createdAt, { timeStyle: "short" })}
                    </time>
                  </li>
                );
              })}
            </ol>
          </li>
        );
      })}
      <ScrollAnchor watch={messages.length} />
    </ol>
  );
}
