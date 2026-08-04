import { useCallback, useContext, useEffect, useState, useMemo } from "react";
import { 
  BellRing, 
  Plus, 
  Send, 
  Search, 
  Filter, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  Bell, 
  CheckCircle2, 
  Clock, 
  Globe, 
  Sparkles,
  Layers,
  Code2,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { Modal } from "../../components/common/Modal";
import { ConfirmActionModal } from "../../components/common/ConfirmActionModal";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetNotificationsApi } from "../../services/medfinetNotificationsApi";

type Template = Awaited<
  ReturnType<typeof medfinetNotificationsApi.listTemplates>
>["items"][number];

const LOCALE_NAMES: Record<string, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇬🇧" },
  ha: { label: "Hausa", flag: "🇳🇬" },
  yo: { label: "Yoruba", flag: "🇳🇬" },
  ig: { label: "Igbo", flag: "🇳🇬" },
};

const CHANNEL_CONFIG: Record<string, { label: string; icon: typeof MessageSquare; bg: string; text: string; border: string }> = {
  IN_APP: { label: "In-App Notification", icon: BellRing, bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800" },
  EMAIL: { label: "Email Message", icon: Mail, bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
  SMS: { label: "SMS Text", icon: MessageSquare, bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
  PUSH: { label: "Push Notification", icon: Smartphone, bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800" },
};

export default function NotificationAdministration() {
  const { organizationId } = useContext(UserContext);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [open, setOpen] = useState(false);
  const [activationTarget, setActivationTarget] = useState<Template | null>(null);
  const [preferenceOpen, setPreferenceOpen] = useState(false);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string>("ALL");
  const [selectedLocale, setSelectedLocale] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const [form, setForm] = useState({
    key: "",
    version: "1",
    channel: "IN_APP",
    locale: "en",
    subject: "",
    body: "",
    variableNames: "",
  });

  const [preference, setPreference] = useState({
    subjectId: "",
    category: "APPOINTMENTS",
    channel: "IN_APP",
    enabled: true,
    locale: "en",
    timezone: "Africa/Lagos",
    quietHoursStart: "",
    quietHoursEnd: "",
  });

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError("");
    try {
      setTemplates(
        (await medfinetNotificationsApi.listTemplates(organizationId)).items,
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load notification templates",
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Derived metrics
  const stats = useMemo(() => {
    const total = templates.length;
    const active = templates.filter((t) => t.status === "ACTIVE").length;
    const drafts = templates.filter((t) => t.status === "DRAFT").length;
    const locales = new Set(templates.map((t) => t.locale)).size;
    return { total, active, drafts, locales };
  }, [templates]);

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesSearch = 
        t.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.subject && t.subject.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesChannel = selectedChannel === "ALL" || t.channel === selectedChannel;
      const matchesLocale = selectedLocale === "ALL" || t.locale === selectedLocale;
      const matchesStatus = selectedStatus === "ALL" || t.status === selectedStatus;
      return matchesSearch && matchesChannel && matchesLocale && matchesStatus;
    });
  }, [templates, searchQuery, selectedChannel, selectedLocale, selectedStatus]);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId) return;
    setBusy(true);
    setError("");
    try {
      await medfinetNotificationsApi.createTemplate(organizationId, {
        key: form.key,
        version: Number(form.version),
        channel: form.channel as "IN_APP",
        locale: form.locale,
        subject: form.subject || undefined,
        body: form.body,
        variableNames: form.variableNames
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      });
      setOpen(false);
      setNotice(
        "Template draft created. Activate it after reviewing every placeholder.",
      );
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to create template",
      );
    } finally {
      setBusy(false);
    }
  }

  async function activate(template: Template) {
    if (!organizationId) return;
    setBusy(true);
    try {
      await medfinetNotificationsApi.activateTemplate(
        organizationId,
        template.id,
      );
      setNotice("Template activated; the previous active version was retired.");
      await load();
      setActivationTarget(null);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to activate template",
      );
    } finally {
      setBusy(false);
    }
  }

  async function savePreference(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId) return;
    setBusy(true);
    try {
      await medfinetNotificationsApi.upsertPreference(organizationId, {
        subjectId: preference.subjectId || undefined,
        category: preference.category,
        channel: preference.channel as "IN_APP",
        enabled: preference.enabled,
        locale: preference.locale,
        timezone: preference.timezone,
        quietHoursStart:
          preference.quietHoursStart === ""
            ? null
            : Number(preference.quietHoursStart),
        quietHoursEnd:
          preference.quietHoursEnd === ""
            ? null
            : Number(preference.quietHoursEnd),
      });
      setPreferenceOpen(false);
      setNotice("Notification preference saved.");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to save preference",
      );
    } finally {
      setBusy(false);
    }
  }

  // Render body text with highlighted placeholders
  const renderFormattedBody = (body: string) => {
    const parts = body.split(/(\{\{[^}]+\}\})/g);
    return parts.map((part, index) => {
      if (/^\{\{[^}]+\}\}$/.test(part)) {
        return (
          <span
            key={index}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 mx-0.5"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-900/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm backdrop-blur-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Messaging Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Notification Administration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Manage multi-channel versioned notification templates, localization variants, and automated delivery preferences across SMS, Email, USSD, and In-App channels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setPreferenceOpen(true)}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all shadow-sm active:scale-95"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4 text-slate-500" />
            Preferences
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-600/20 hover:shadow-cyan-600/30 transition-all active:scale-95"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Templates</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
          </div>
          <div className="p-3 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Production</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.active}</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Draft Variants</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.drafts}</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Locales Supported</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{stats.locales}</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Globe className="w-5 h-5" />
          </div>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 dark:bg-emerald-950/50 dark:border-emerald-800 p-4 text-sm text-emerald-900 dark:text-emerald-200 shadow-sm"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">{notice}</span>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search template key, content, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Channels:</span>
            </div>
            {["ALL", "IN_APP", "SMS", "EMAIL", "PUSH"].map((ch) => (
              <button
                key={ch}
                onClick={() => setSelectedChannel(ch)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedChannel === ch
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {ch === "ALL" ? "All Channels" : ch}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Locale:</span>
            {["ALL", "en", "ha", "yo", "ig"].map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocale(loc)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  selectedLocale === loc
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {loc === "ALL" ? "All Locales" : `${LOCALE_NAMES[loc]?.flag || ''} ${loc.toUpperCase()}`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status:</span>
            {["ALL", "ACTIVE", "DRAFT", "RETIRED"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  selectedStatus === st
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Template Cards Grid */}
      <div>
        <PageFeedback
          loading={loading}
          error={error}
          empty={!filteredTemplates.length}
          onRetry={() => void load()}
        >
          <div className="grid gap-6 md:grid-cols-2">
            {filteredTemplates.map((template) => {
              const channelMeta = CHANNEL_CONFIG[template.channel] || CHANNEL_CONFIG.IN_APP;
              const ChannelIcon = channelMeta.icon;
              const localeInfo = LOCALE_NAMES[template.locale] || { label: template.locale.toUpperCase(), flag: "🌐" };
              const isActive = template.status === "ACTIVE";
              const isDraft = template.status === "DRAFT";

              return (
                <article
                  key={template.id}
                  className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 p-6 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-4">
                    {/* Header bar */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl ${channelMeta.bg} ${channelMeta.text} shrink-0 mt-0.5`}>
                          <ChannelIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                              {template.key}
                            </h2>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              v{template.version}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{channelMeta.label}</span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 font-medium">
                              <span>{localeInfo.flag}</span>
                              <span>{localeInfo.label}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : isDraft
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-600"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : isDraft ? 'bg-amber-500' : 'bg-slate-400'}`} />
                        {template.status}
                      </span>
                    </div>

                    {/* Email Subject if present */}
                    {template.subject && (
                      <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Subject Line</span>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {template.subject}
                        </p>
                      </div>
                    )}

                    {/* Template Content Box */}
                    <div className="bg-slate-900 dark:bg-slate-950 p-4 rounded-xl text-slate-200 font-sans text-sm leading-relaxed border border-slate-800/80 shadow-inner">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2 pb-2 border-b border-slate-800">
                        <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                          <Code2 className="w-3.5 h-3.5 text-cyan-400" /> Message Payload Body
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{template.body.length} chars</span>
                      </div>
                      <div className="whitespace-pre-wrap font-sans text-slate-200">
                        {renderFormattedBody(template.body)}
                      </div>
                    </div>

                    {/* Variables */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 mr-1">
                        Variables ({template.variableNames.length}):
                      </span>
                      {template.variableNames.length > 0 ? (
                        template.variableNames.map((v) => (
                          <span
                            key={v}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono bg-cyan-50 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/60"
                          >
                            {`{{${v}}}`}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs italic text-slate-400">None declared</span>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                      ID: {template.id.slice(0, 12)}...
                    </span>

                    {isDraft && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setActivationTarget(template)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Activate Variant
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </PageFeedback>
      </div>

      {/* Modal: Create Template */}
      <Modal
        open={open}
        title="Create Notification Template"
        description="Declared variable names must exactly match every {{placeholder}} used in the message payload."
        onClose={() => setOpen(false)}
      >
        <form onSubmit={create} className="space-y-4 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Template Key *
              </label>
              <input
                required
                pattern="[A-Za-z0-9_]+"
                placeholder="e.g. USSD_FACILITY_DETAILS"
                value={form.key}
                onChange={(event) =>
                  setForm({ ...form, key: event.target.value.toUpperCase() })
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Version *
              </label>
              <input
                required
                min="1"
                type="number"
                value={form.version}
                onChange={(event) =>
                  setForm({ ...form, version: event.target.value })
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Delivery Channel *
              </label>
              <select
                value={form.channel}
                onChange={(event) =>
                  setForm({ ...form, channel: event.target.value })
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                {["IN_APP", "EMAIL", "SMS", "PUSH"].map((value) => (
                  <option key={value} value={value}>
                    {CHANNEL_CONFIG[value]?.label || value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Language Locale *
              </label>
              <select
                value={form.locale}
                onChange={(event) =>
                  setForm({ ...form, locale: event.target.value })
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                <option value="en">🇬🇧 English (en)</option>
                <option value="ha">🇳🇬 Hausa (ha)</option>
                <option value="yo">🇳🇬 Yoruba (yo)</option>
                <option value="ig">🇳🇬 Igbo (ig)</option>
              </select>
            </div>
          </div>

          {form.channel === "EMAIL" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Subject Line *
              </label>
              <input
                required
                placeholder="e.g. Action Required: Your Vaccination Appointment Status"
                value={form.subject}
                onChange={(event) =>
                  setForm({ ...form, subject: event.target.value })
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Template Body Content *
            </label>
            <textarea
              required
              maxLength={10000}
              rows={4}
              placeholder="e.g. Hello {{facilityName}}, your appointment is confirmed for {{date}}."
              value={form.body}
              onChange={(event) =>
                setForm({ ...form, body: event.target.value })
              }
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Variable Names (Comma-separated)
            </label>
            <input
              placeholder="e.g. facilityName, address, phone, date"
              value={form.variableNames}
              onChange={(event) =>
                setForm({ ...form, variableNames: event.target.value })
              }
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              disabled={busy}
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Create Draft Template
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Preferences */}
      <Modal
        open={preferenceOpen}
        title="Manage Notification Preferences"
        onClose={() => setPreferenceOpen(false)}
      >
        <form onSubmit={savePreference} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Subject ID (Leave empty for default user preference)
            </label>
            <input
              placeholder="User ID or Subject identifier"
              value={preference.subjectId}
              onChange={(event) =>
                setPreference({ ...preference, subjectId: event.target.value })
              }
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <input
                required
                value={preference.category}
                onChange={(event) =>
                  setPreference({
                    ...preference,
                    category: event.target.value.toUpperCase(),
                  })
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Delivery Channel *
              </label>
              <select
                value={preference.channel}
                onChange={(event) =>
                  setPreference({ ...preference, channel: event.target.value })
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                {["IN_APP", "EMAIL", "SMS", "PUSH"].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Quiet Hours Start (0-23 Hour)
              </label>
              <input
                min="0"
                max="23"
                type="number"
                placeholder="e.g. 22 (10 PM)"
                value={preference.quietHoursStart}
                onChange={(event) =>
                  setPreference({
                    ...preference,
                    quietHoursStart: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Quiet Hours End (0-23 Hour)
              </label>
              <input
                min="0"
                max="23"
                type="number"
                placeholder="e.g. 6 (6 AM)"
                value={preference.quietHoursEnd}
                onChange={(event) =>
                  setPreference({
                    ...preference,
                    quietHoursEnd: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="flex items-center gap-3 text-sm font-semibold text-slate-900 dark:text-white cursor-pointer">
              <input
                type="checkbox"
                checked={preference.enabled}
                onChange={(event) =>
                  setPreference({ ...preference, enabled: event.target.checked })
                }
                className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
              />
              Enable Automatic Delivery
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setPreferenceOpen(false)}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              disabled={busy}
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <BellRing className="h-4 w-4" />
              Save Preference
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmActionModal
        open={Boolean(activationTarget)}
        title="Activate Notification Template Variant"
        description={`Activate ${activationTarget?.key || "template"} version ${activationTarget?.version || ""}? The previous active version for channel ${activationTarget?.channel || ''} and locale ${activationTarget?.locale || ''} will be retired.`}
        confirmLabel="Activate Template"
        busy={busy}
        onClose={() => setActivationTarget(null)}
        onConfirm={() => {
          if (activationTarget) return activate(activationTarget);
        }}
      />
    </main>
  );
}
