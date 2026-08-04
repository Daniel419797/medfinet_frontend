import { ArrowRight, Baby, Bell, Buildings, CalendarBlank, Check, Clock, type Icon } from "@phosphor-icons/react";
import { useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmActionModal } from "../../components/common/ConfirmActionModal";
import { Modal } from "../../components/common/Modal";
import { PageFeedback } from "../../components/common/PageFeedback";
import UserContext from "../../contexts/UserContext";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";
import { medfinetNotificationsApi } from "../../services/medfinetNotificationsApi";
import { medfinetOperationsApi, type OperationsAppointment } from "../../services/medfinetOperationsApi";

type Child = Awaited<ReturnType<typeof medfinetIdentityApi.listChildren>>["items"][number];
type Facility = Awaited<ReturnType<typeof medfinetIdentityApi.listFacilities>>[number];
type Inbox = Awaited<ReturnType<typeof medfinetNotificationsApi.listInbox>>;

export default function Dashboard() {
  const { user, organizationId } = useContext(UserContext);
  const [children, setChildren] = useState<Child[]>([]);
  const [appointments, setAppointments] = useState<OperationsAppointment[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [inbox, setInbox] = useState<Inbox>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<OperationsAppointment | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<OperationsAppointment | null>(null);
  const [window, setWindow] = useState({ start: "", end: "" });

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const [childPage, appointmentRows, facilityRows, messages] = await Promise.all([
        medfinetIdentityApi.listChildren(organizationId, { limit: 100 }),
        medfinetOperationsApi.appointments(organizationId, "SCHEDULED"),
        medfinetIdentityApi.listFacilities(organizationId),
        medfinetNotificationsApi.listInbox(organizationId),
      ]);
      setChildren(childPage.items);
      setAppointments(appointmentRows.filter((item) => new Date(item.scheduledFor).getTime() >= Date.now()).sort((left, right) => left.scheduledFor.localeCompare(right.scheduledFor)));
      setFacilities(facilityRows.filter((item) => item.isActive));
      setInbox(messages);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load your dashboard");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => { void load(); }, [load]);

  async function respond(appointment: OperationsAppointment, decision: "CONFIRMED" | "RESCHEDULE_REQUESTED") {
    if (!organizationId) return;
    setBusy(true);
    setError(null);
    setNotice("");
    try {
      await medfinetOperationsApi.respondToAppointment(organizationId, appointment.id, {
        decision,
        idempotencyKey: crypto.randomUUID(),
        ...(decision === "RESCHEDULE_REQUESTED" ? { preferredStart: new Date(window.start).toISOString(), preferredEnd: new Date(window.end).toISOString() } : {}),
      });
      setConfirmTarget(null);
      setRescheduleTarget(null);
      setWindow({ start: "", end: "" });
      setNotice(decision === "CONFIRMED" ? "Appointment confirmed." : "A new appointment window was requested.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to send appointment response");
    } finally {
      setBusy(false);
    }
  }

  const unread = inbox.filter((item) => !item.readAt).length;

  return (
    <div className="mf-page">
      <header className="mf-page-header">
        <div><p className="mf-eyebrow">Family health</p><h1 className="mt-1">Welcome{user?.name ? `, ${user.name}` : ""}</h1><p className="mf-description">See your children, upcoming visits, messages and participating facilities in one place.</p></div>
        <Link to="/profiles" className="mf-button-primary lg:shrink-0"><Baby size={18} />View child profiles</Link>
      </header>

      <PageFeedback loading={loading} error={error} onRetry={() => void load()}>
        {notice && <div role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{notice}</div>}
        <section className="mf-stat-strip sm:grid-cols-3 lg:grid-cols-3">
          <SummaryStat icon={Baby} label="Linked children" value={children.length} to="/profiles" />
          <SummaryStat icon={CalendarBlank} label="Upcoming appointments" value={appointments.length} />
          <SummaryStat icon={Bell} label="Unread messages" value={unread} to="/notifications" />
        </section>

        <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,.85fr)]">
          <section className="mf-surface min-w-0">
            <div className="mf-surface-header"><div><h2 className="text-lg">Upcoming appointments</h2><p className="mt-1 text-xs text-slate-500">Your next scheduled care visits</p></div></div>
            {appointments.length ? appointments.slice(0, 6).map((appointment) => (
              <article key={appointment.id} className="mf-row">
                <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-700"><CalendarBlank size={20} /></span><div className="min-w-0 flex-1"><p className="font-bold text-slate-950">{appointment.child.firstName} {appointment.child.lastName}</p><p className="mt-1 text-sm text-slate-600">{appointment.kind.replaceAll("_", " ")} · {appointment.facility?.name || "Facility to be confirmed"}</p><time className="mt-1 block text-xs font-bold text-primary-700">{new Date(appointment.scheduledFor).toLocaleString()}</time></div></div>
                {user?.role === "CAREGIVER" && <div className="mt-3 flex flex-wrap items-center gap-2 sm:pl-[52px]">{appointment.caregiverResponses[0] ? <span className="mf-status bg-primary-50 text-primary-800">{appointment.caregiverResponses[0].response === "CONFIRMED" ? "Confirmed" : "New date requested"}</span> : <><button type="button" onClick={() => setConfirmTarget(appointment)} className="mf-button-primary !min-h-9 px-3 text-xs"><Check size={15} />Confirm</button><button type="button" onClick={() => setRescheduleTarget(appointment)} className="mf-button-secondary !min-h-9 px-3 text-xs"><Clock size={15} />Request another date</button></>}</div>}
              </article>
            )) : <Empty text="No upcoming appointments are scheduled." />}
          </section>

          <section className="mf-surface min-w-0">
            <div className="mf-surface-header"><div><h2 className="text-lg">Children</h2><p className="mt-1 text-xs text-slate-500">Linked health identities</p></div><Link className="text-xs font-bold text-primary-700" to="/profiles">View all</Link></div>
            {children.length ? children.slice(0, 6).map((child) => <Link key={child.id} to={`/vaccination-history/${child.id}`} className="mf-row flex items-center gap-3 transition hover:bg-slate-50"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-700"><Baby size={20} /></span><div className="min-w-0 flex-1"><p className="truncate font-bold text-slate-950">{child.firstName} {child.lastName}</p><p className="truncate text-xs text-slate-500">{child.medfinetId}</p></div><ArrowRight size={17} className="text-slate-400" /></Link>) : <Empty text="No linked child records are available." />}
          </section>
        </div>

        <section className="mf-surface mt-6">
          <div className="mf-surface-header"><div><h2 className="text-lg">Participating facilities</h2><p className="mt-1 text-xs text-slate-500">Published locations available to your organization</p></div><span className="mf-status bg-slate-100 text-slate-700"><Buildings size={15} />{facilities.length} active</span></div>
          {facilities.length ? <div className="grid md:grid-cols-2">{facilities.slice(0, 6).map((facility) => <article key={facility.id} className="mf-row md:[&:nth-child(odd)]:border-r"><p className="font-bold text-slate-950">{facility.name}</p><p className="mt-1 text-sm text-slate-600">{facility.address || facility.administrativeArea || "Address pending"}</p><p className="mt-1 text-xs font-semibold text-slate-500">{facility.phone || "Telephone pending"}</p></article>)}</div> : <Empty text="No active participating facilities are published." />}
        </section>
      </PageFeedback>

      <ConfirmActionModal open={Boolean(confirmTarget)} title="Confirm appointment" description={confirmTarget ? `Confirm ${confirmTarget.child.firstName}'s ${confirmTarget.kind.replaceAll("_", " ").toLowerCase()} appointment for ${new Date(confirmTarget.scheduledFor).toLocaleString()}?` : ""} confirmLabel="Confirm appointment" busy={busy} onClose={() => setConfirmTarget(null)} onConfirm={() => confirmTarget ? respond(confirmTarget, "CONFIRMED") : undefined} />
      <Modal open={Boolean(rescheduleTarget)} onClose={() => setRescheduleTarget(null)} title="Request another date" description="Choose a preferred future window. The clinic must review and schedule the final appointment.">
        <form onSubmit={(event) => { event.preventDefault(); if (rescheduleTarget) void respond(rescheduleTarget, "RESCHEDULE_REQUESTED"); }} className="space-y-4">
          <label className="block text-sm font-bold">Preferred start<input required type="datetime-local" min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)} value={window.start} onChange={(event) => setWindow({ ...window, start: event.target.value })} className="mt-1 w-full" /></label>
          <label className="block text-sm font-bold">Preferred end<input required type="datetime-local" min={window.start} value={window.end} onChange={(event) => setWindow({ ...window, end: event.target.value })} className="mt-1 w-full" /></label>
          <button disabled={busy || !window.start || !window.end || window.end <= window.start} className="mf-button-primary w-full">{busy ? "Sending…" : "Request this window"}</button>
        </form>
      </Modal>
    </div>
  );
}

function SummaryStat({ icon: IconComponent, label, value, to }: { icon: Icon; label: string; value: number; to?: string }) {
  const content = <div className="mf-stat"><span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-50 text-primary-700"><IconComponent size={21} /></span><div><p className="text-xl font-extrabold tabular-nums text-slate-950">{value}</p><p className="text-xs font-semibold text-slate-500">{label}</p></div></div>;
  return to ? <Link to={to} className="transition hover:bg-slate-50">{content}</Link> : content;
}

function Empty({ text }: { text: string }) {
  return <p className="m-5 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">{text}</p>;
}
