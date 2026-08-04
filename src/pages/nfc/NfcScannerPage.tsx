import { FormEvent, useContext, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  CloudOff,
  CreditCard,
  FileHeart,
  History,
  Loader2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Syringe,
  Wifi,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { medfinetNfcApi } from '../../services/medfinetNfcApi';
import UserContext from '../../contexts/UserContext';
import {
  devicePublicKeyPem,
  scannerPayload,
  signNfcPayload,
  stableDeviceIdentifier,
} from '../../services/nfcDeviceKeyStore';

type ScanInput = { publicId: string; cardToken: string; uc: string };
type ScanResult = Awaited<ReturnType<typeof medfinetNfcApi.resolveScan>>;

type NdefRecord = { recordType: string; data?: DataView };
type NdefEvent = Event & {
  serialNumber: string;
  message: { records: NdefRecord[] };
};
type NdefReader = {
  scan: (options?: { signal?: AbortSignal }) => Promise<void>;
  addEventListener: (type: 'reading', listener: (event: NdefEvent) => void) => void;
};
type NdefReaderConstructor = new () => NdefReader;

function parseCardUrl(raw: string): ScanInput {
  const url = new URL(raw);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const publicId = pathParts[pathParts.length - 1] || '';
  const params = new URLSearchParams(url.hash.replace(/^#/, ''));
  const cardToken = params.get('t') || '';
  const uc = params.get('uc') || '';
  if (!/^[A-Za-z0-9_-]{24}$/.test(publicId) || !/^[0-9A-F]{14}x[0-9A-F]{6}$/.test(uc) || !/^[A-Za-z0-9_-]{43}$/.test(cardToken)) {
    throw new Error('This is not a valid Medfinet NTAG215 card payload.');
  }
  return { publicId, cardToken, uc };
}

function normalizeReaderUid(serialNumber: string): string {
  const uid = serialNumber.replace(/[^0-9A-F]/gi, '').toUpperCase();
  if (!/^[0-9A-F]{14}$/.test(uid)) {
    throw new Error('The browser did not provide a valid NTAG215 hardware UID.');
  }
  return uid;
}

function ClinicalResult({ result }: { result: ScanResult }) {
  const due = result.clinicalSummary.vaccination.dueCount;
  const overdue = result.clinicalSummary.vaccination.overdueCount;
  const clinicalAllowed = result.clinicalSummary.clinicalAccess === 'ALLOWED';
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800">
        <CheckCircle2 className="mr-2 inline h-4 w-4" /> Card read successfully
      </div>
      <div className="space-y-5 p-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            {clinicalAllowed
              ? `${result.child.firstName} ${result.child.lastName}`
              : 'Identity hidden until consent'}
          </h2>
          {clinicalAllowed && <p className="mt-1 text-sm text-slate-500">Child ID: {result.child.medfinetId}</p>}
        </div>

        {result.clinicalSummary.allergies.length > 0 && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-amber-900">
              <AlertTriangle size={18} /> Active allergies
            </div>
            <p className="mt-1 text-sm text-amber-900">
              {result.clinicalSummary.allergies.map((item) => item.substanceDisplay).join(', ')}
            </p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-500">Vaccination status</p>
            <p className="mt-1 font-semibold text-slate-950">
              {!clinicalAllowed ? 'Consent required' : overdue ? `${overdue} overdue` : due ? `${due} due` : 'Up to date'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-500">Consent status</p>
            <p className="mt-1 font-semibold text-slate-950">
              {result.clinicalSummary.consent.status === 'GRANTED' ? 'Granted' : 'Not recorded'}
            </p>
          </div>
        </div>

        {!clinicalAllowed && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            Clinical details are hidden because no applicable active consent was found. Record or verify consent before routine care, or use the audited emergency workflow when clinically justified.
          </div>
        )}
        <div className={`grid gap-3 ${clinicalAllowed ? 'sm:grid-cols-3' : ''}`}>
          {clinicalAllowed && <Link to={`/health-worker/nfc/children/${result.child.id}/clinical`} className="nfc-action">
            <FileHeart size={18} /> View clinical record
          </Link>}
          {clinicalAllowed && <Link to={`/health-worker/nfc/children/${result.child.id}/vaccination`} className="nfc-action nfc-action-primary">
            <Syringe size={18} /> Record vaccination
          </Link>}
          <Link to={`/health-worker/nfc/children/${result.child.id}/emergency`} className="nfc-action nfc-action-danger">
            <LockKeyhole size={18} /> Emergency access
          </Link>
        </div>
        <p className="text-xs leading-5 text-slate-500">
          PWA assurance: the worker and browser key are authenticated, but Web NFC cannot run the NTAG215 READ_SIG command. Every access remains permission checked and audited.
        </p>
      </div>
    </section>
  );
}

export default function NfcScannerPage() {
  const { organizationId } = useContext(UserContext);
  const [deviceId, setDeviceId] = useState(() => localStorage.getItem('medfinet.nfc.device-record-id') || '');
  const [manualUrl, setManualUrl] = useState('');
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<Array<{
    childId: string;
    label: string;
    medfinetId: string;
    scannedAt: Date;
  }>>([]);
  const [online, setOnline] = useState(navigator.onLine);
  const webNfcSupported = useMemo(() => 'NDEFReader' in window, []);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  async function registerDevice() {
    if (!organizationId) throw new Error('Select an organization first.');
    const registration = await medfinetNfcApi.registerDevice(organizationId, {
      deviceIdentifier: stableDeviceIdentifier(),
      displayName: `NFC PWA · ${navigator.platform || 'Browser'}`,
      platform: 'Web NFC PWA',
      appVersion: '1.0.0',
      publicKey: await devicePublicKeyPem(),
    });
    localStorage.setItem('medfinet.nfc.device-record-id', registration.device.id);
    setDeviceId(registration.device.id);
  }

  async function resolveCard(card: ScanInput) {
    if (!online) throw new Error('Connect to the internet to resolve this card securely. Card credentials are never stored offline.');
    setBusy(true);
    setError('');
    setResult(null);
    try {
      let activeDeviceId = deviceId;
      if (!activeDeviceId) {
        await registerDevice();
        activeDeviceId = localStorage.getItem('medfinet.nfc.device-record-id') || '';
      }
      const challenge = await medfinetNfcApi.createChallenge(card.publicId, activeDeviceId);
      const payload = scannerPayload({ ...card, challengeToken: challenge.challengeToken });
      const deviceSignature = await signNfcPayload(payload);
      const resolved = await medfinetNfcApi.resolveScan({
        ...card,
        challengeToken: challenge.challengeToken,
        deviceSignature,
        scanMode: 'PWA_NDEF',
      });
      setResult(resolved);
      setRecentScans((current) => [{
        childId: resolved.child.id,
        label: resolved.clinicalSummary.clinicalAccess === 'ALLOWED'
          ? `${resolved.child.firstName} ${resolved.child.lastName}`
          : 'Identity redacted',
        medfinetId: resolved.clinicalSummary.clinicalAccess === 'ALLOWED'
          ? resolved.child.medfinetId || ''
          : 'Consent required',
        scannedAt: new Date(),
      }, ...current.filter(({ childId }) => childId !== resolved.child.id)].slice(0, 5));
    } finally {
      setBusy(false);
    }
  }

  async function startScan() {
    setError('');
    if (!webNfcSupported) {
      setError('Web NFC is unavailable. Use Chrome on an NFC-enabled Android device, or paste the card URL below.');
      return;
    }
    try {
      const Reader = (window as unknown as { NDEFReader: NdefReaderConstructor }).NDEFReader;
      const reader = new Reader();
      await reader.scan();
      setListening(true);
      reader.addEventListener('reading', (event) => {
        const record = event.message.records.find(({ recordType }) => recordType === 'url');
        if (!record?.data) {
          setError('The NFC tag does not contain a Medfinet URL record.');
          return;
        }
        const raw = new TextDecoder().decode(new Uint8Array(
          record.data.buffer,
          record.data.byteOffset,
          record.data.byteLength
        ));
        const card = parseCardUrl(raw);
        const readerUid = normalizeReaderUid(event.serialNumber);
        if (card.uc.slice(0, 14).toUpperCase() !== readerUid) {
          setError('The NDEF mirror does not match the physical NFC chip UID.');
          return;
        }
        void resolveCard(card).catch((caught: unknown) => {
          setError(caught instanceof Error ? caught.message : 'Card scan failed');
        });
      });
    } catch (caught) {
      setListening(false);
      setError(caught instanceof Error ? caught.message : 'Could not start NFC scanning');
    }
  }

  function submitManual(event: FormEvent) {
    event.preventDefault();
    void resolveCard(parseCardUrl(manualUrl.trim())).catch((caught: unknown) => {
      setError(caught instanceof Error ? caught.message : 'Card scan failed');
    });
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">NFC Card Operations</h1>
            <p className="text-sm text-slate-500">Scan and manage child identity cards</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            {online ? <Wifi className="text-emerald-600" size={17} /> : <CloudOff className="text-amber-600" size={17} />}
            {online ? 'Online' : 'Offline'}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.25fr)]">
        <section className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5"><div><p className="text-sm font-semibold text-slate-700">Trusted scanner device</p><p className="text-xs text-slate-500">{deviceId ? `Registered as ${deviceId}` : 'Register this browser before scanning'}</p></div><button type="button" onClick={() => void registerDevice().catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Registration failed'))} className="rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-700">{deviceId ? <ShieldCheck size={19} /> : 'Register'}</button></div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <button type="button" disabled={busy || !organizationId} onClick={() => void startScan()} className="mx-auto grid h-36 w-36 place-items-center rounded-full border-2 border-cyan-200 bg-cyan-50 text-cyan-800 transition hover:scale-[1.02] disabled:opacity-50">
              {busy ? <Loader2 className="animate-spin" size={40} /> : <Smartphone size={42} />}
            </button>
            <h2 className="mt-5 text-2xl font-bold">Tap NFC card</h2>
            <p className={`mt-2 text-sm font-medium ${listening ? 'text-emerald-700' : 'text-slate-500'}`}>
              {listening ? 'Scanner ready' : webNfcSupported ? 'Start scanner' : 'Web NFC required'}
            </p>
            <p className="mt-1 text-sm text-slate-500">Hold card near the back of this device</p>

            {import.meta.env.DEV && <>
              <div className="my-5 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />DEVELOPMENT ONLY<span className="h-px flex-1 bg-slate-200" /></div>
              <form onSubmit={submitManual} className="space-y-2 text-left">
                <label htmlFor="card-url" className="text-sm font-semibold text-slate-700">Paste card URL</label>
                <input id="card-url" value={manualUrl} onChange={(event) => setManualUrl(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Medfinet card URL" />
                <button disabled={busy || !manualUrl.trim()} className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Test development payload</button>
              </form>
            </>}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
            <div className="flex items-center gap-2 font-semibold"><CreditCard size={17} /> Registered device</div>
            <p className="mt-1 truncate text-slate-500">{deviceId || 'Not registered'}</p>
          </div>
          {recentScans.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="text-base font-bold">Recent scans</h2>
              <div className="mt-2 divide-y divide-slate-100">
                {recentScans.map((scan) => (
                  <div key={scan.childId} className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm">
                    <span><strong className="block">{scan.label}</strong><span className="text-slate-500">{scan.medfinetId}</span></span>
                    <time className="text-xs text-slate-500">{scan.scannedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">Session only. Child details are cleared when this PWA closes.</p>
            </div>
          )}
        </section>

        <section className="space-y-4">
          {error && <div role="alert" className="flex gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900"><AlertTriangle className="shrink-0" size={20} /><div><strong>Card unavailable</strong><p className="mt-1">{error}</p></div></div>}
          {result ? <ClinicalResult result={result} /> : (
            <div className="grid min-h-[420px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <div><History className="mx-auto text-slate-300" size={48} /><h2 className="mt-4 text-lg font-semibold">Clinical access</h2><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">The authorized child summary will appear here after a secure card scan.</p></div>
            </div>
          )}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-sm">
            <span className="flex items-center gap-2 font-semibold"><CloudOff size={18} /> Offline queue</span>
            <span className="text-slate-500">Card secrets are never stored offline</span>
            <RefreshCw size={17} className="text-slate-400" />
          </div>
        </section>
      </div>
    </main>
  );
}
