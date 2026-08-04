import { useContext, useState } from "react";
import { Bell, Check, FileText, Zap } from "lucide-react";
import { PageFeedback } from "../../components/common/PageFeedback";
import UserContext from "../../contexts/UserContext";
import { useApi } from "../../hooks/useMedfinetApi";
import { medfinetNotificationsApi } from "../../services/medfinetNotificationsApi";

export default function NotificationsPage() {
  const { organizationId } = useContext(UserContext);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { data, loading, error, refetch } = useApi(
    () =>
      organizationId
        ? medfinetNotificationsApi.listInbox(organizationId)
        : Promise.resolve(null),
    [organizationId],
  );
  const items = data || [];

  async function markRead(id: string) {
    if (!organizationId) return;
    setBusyId(id);
    setActionError(null);
    try {
      await medfinetNotificationsApi.markRead(organizationId, id);
      await refetch();
    } catch (reason) {
      setActionError(
        reason instanceof Error
          ? reason.message
          : "Unable to mark notification as read",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-cyan-700">Inbox</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">
          Notifications
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Organization messages delivered to your authenticated identity.
        </p>
      </header>
      <PageFeedback
        loading={loading}
        error={error || actionError}
        empty={!items.length}
        onRetry={() => void refetch()}
        emptyTitle="No notifications"
        emptyDescription="You are all caught up."
      >
        <div className="space-y-3">
          {items.map((item) => {
            const Icon =
              item.channel === "EMAIL"
                ? FileText
                : item.channel === "IN_APP"
                  ? Zap
                  : Bell;
            return (
              <article
                key={item.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm ${item.readAt ? "border-slate-200" : "border-cyan-300"}`}
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-cyan-50 p-2 text-cyan-800">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row">
                      <div>
                        <h2 className="font-bold text-slate-950">
                          {item.title}
                        </h2>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                          {item.body}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {!item.readAt && (
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => void markRead(item.id)}
                        className="mt-4 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"
                      >
                        <Check className="mr-2 inline h-4 w-4" />
                        {busyId === item.id ? "Saving…" : "Mark as read"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </PageFeedback>
    </main>
  );
}
