import { Modal } from "./Modal";

export function ConfirmActionModal({
  open,
  title,
  description,
  confirmLabel,
  busy = false,
  destructive = false,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  busy?: boolean;
  destructive?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={() => !busy && onClose()}
    >
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
          type="button"
          disabled={busy}
          onClick={() => void onConfirm()}
          className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${destructive ? "bg-rose-700" : "bg-cyan-700"}`}
        >
          {busy ? "Saving…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
