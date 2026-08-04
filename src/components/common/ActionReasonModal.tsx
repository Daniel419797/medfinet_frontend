import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "./Modal";

export function ActionReasonModal({
  open,
  title,
  description,
  confirmLabel,
  busy = false,
  destructive = false,
  reasonLabel = "Reason",
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  busy?: boolean;
  destructive?: boolean;
  reasonLabel?: string;
  onClose: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
}) {
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = reason.trim();
    if (value) void onConfirm(value);
  }

  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={() => !busy && onClose()}
    >
      <form className="space-y-4" onSubmit={submit}>
        <label className="block text-sm font-semibold text-slate-800">
          {reasonLabel}
          <textarea
            autoFocus
            required
            minLength={3}
            maxLength={500}
            rows={4}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            disabled={busy || reason.trim().length < 3}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${destructive ? "bg-rose-700" : "bg-cyan-700"}`}
          >
            {busy ? "Saving…" : confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
