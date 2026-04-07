// src/components/Dashboard.tsx
import { useEffect, useState } from 'react';
import { Baby, Volume2, Moon, Bell, Activity } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import type { SystemStatus, CryEvent, BabyStatus } from '../types/database';
import LocalMonitor from './LocalMonitor';

// ─── CUTE SLIM CRAWLING BABY SVG ──────────────────────────────────────────────
const AnimatedCrawlingBaby = () => (
  <svg viewBox="0 0 140 110" width="140" height="110" xmlns="http://www.w3.org/2000/svg" overflow="visible">

    {/* ── Ground shadow: Tightly tucked under hands/knees to anchor to floor ── */}
    <ellipse className="baby-shadow" cx="60" cy="92" rx="35" ry="3" fill="#94a3b8" opacity="0.45"/>

    {/* ── BACK LEFT LEG (depth layer, darker pink) ── */}
    <g className="limb-leg-back">
      <path d="M 35 65 L 22 85 L 12 85" fill="none" stroke="#f07598" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
      <ellipse cx="11" cy="85" rx="4.5" ry="3.5" fill="#ffcdb8" /> {/* Bare foot */}
    </g>

    {/* ── BACK LEFT ARM (depth layer, darker pink/skin) ── */}
    <g className="limb-arm-back">
      <path d="M 70 65 L 62 85" fill="none" stroke="#f07598" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="62" cy="85" r="4" fill="#ffcdb8" /> {/* Bare hand */}
    </g>

    {/* ── BODY GROUP (bounce + sway + squash) ── */}
    <g className="baby-body-group">
      <g className="body-sway">
        <g className="body-squash">
          
          {/* Slimmer Pink Onesie Torso */}
          <ellipse cx="55" cy="65" rx="30" ry="19" fill="#ff8fab"/>
          {/* Slimmer diaper bump/onesie fold */}
          <path d="M 28 55 Q 20 65 28 78 Q 40 83 55 83 Q 68 83 80 75 Q 85 62 76 52 Z" fill="#ff8fab" />

        </g>

        {/* ── FRONT RIGHT LEG (foreground, onesie pink + bare foot) ── */}
        <g className="limb-leg-front">
          <path d="M 45 65 L 32 90 L 18 90" fill="none" stroke="#ff8fab" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
          <ellipse cx="17" cy="90" rx="5" ry="4" fill="#ffe4e1" /> {/* Bare foot */}
        </g>

        {/* ── FRONT RIGHT ARM (foreground, onesie sleeve + bare hand) ── */}
        <g className="limb-arm-front">
          <path d="M 78 65 L 88 88" fill="none" stroke="#ff8fab" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="88" cy="89" r="5" fill="#ffe4e1" /> {/* Bare hand */}
        </g>
      </g>
    </g>

    {/* ── HEAD GROUP (lags body with soft delay) ── */}
    <g className="baby-head-group">
      
      {/* Big Round Head */}
      <circle cx="95" cy="40" r="26" fill="#ffe4e1"/>
      
      {/* Cute Ear */}
      <circle cx="70" cy="45" r="5" fill="#ffbfa8" />

      {/* Hair Tufts */}
      <path d="M 85 14 Q 95 0 105 12" fill="none" stroke="#2a1f1d" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M 92 12 Q 100 2 110 14" fill="none" stroke="#2a1f1d" strokeWidth="2.5" strokeLinecap="round"/>

      {/* Eyebrows */}
      <path d="M 80 28 Q 85 24 90 28" fill="none" stroke="#2a1f1d" strokeWidth="2" strokeLinecap="round"/>
      <path d="M 103 28 Q 110 24 116 28" fill="none" stroke="#2a1f1d" strokeWidth="2" strokeLinecap="round"/>

      {/* Rosy Cheeks */}
      <ellipse cx="85" cy="51" rx="5" ry="3.5" fill="#ff6b8b" opacity="0.4"/>
      <ellipse cx="112" cy="51" rx="5" ry="3.5" fill="#ff6b8b" opacity="0.4"/>

      {/* Eye Group with blink */}
      <g className="baby-eye-group">
        {/* OPEN EYES */}
        <g className="eye-open">
          {/* Left Eye */}
          <circle cx="85" cy="40" r="7" fill="#1e1e1e" />
          <circle cx="86.5" cy="37.5" r="2.5" fill="#ffffff" />
          <circle cx="83.5" cy="42" r="1" fill="#ffffff" />
          {/* Right Eye */}
          <circle cx="110" cy="40" r="7" fill="#1e1e1e" />
          <circle cx="111.5" cy="37.5" r="2.5" fill="#ffffff" />
          <circle cx="108.5" cy="42" r="1" fill="#ffffff" />
        </g>
        
        {/* BLINK LID */}
        <g className="eye-blink">
          <path d="M 78 40 Q 85 43 92 40" fill="none" stroke="#2a1f1d" strokeWidth="2" strokeLinecap="round"/>
          <path d="M 103 40 Q 110 43 117 40" fill="none" stroke="#2a1f1d" strokeWidth="2" strokeLinecap="round"/>
        </g>
      </g>

      {/* Open Smiling Mouth with Tongue */}
      <path d="M 93 52 Q 98 62 104 52 Z" fill="#7a1a2b" stroke="#7a1a2b" strokeWidth="1" strokeLinejoin="round"/>
      <path d="M 96 55 Q 98 59 101 55 Z" fill="#ff8fab" /> {/* Tongue */}
    </g>
  </svg>
);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [recentEvents, setRecentEvents] = useState<CryEvent[]>([]);
  const [babyName, setBabyName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    let profileUnsubscribe = () => {};
    if (auth.currentUser) {
      profileUnsubscribe = onSnapshot(doc(db, 'baby_profiles', auth.currentUser.uid), (docSnapshot) => {
        if (docSnapshot.exists() && docSnapshot.data().name) {
          setBabyName(docSnapshot.data().name);
        }
      });
    }

    const statusUnsubscribe = onSnapshot(doc(db, 'system_status', 'current'), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data() as SystemStatus;
        setSystemStatus(data);
        if (data.current_status === 'crying') triggerAlert();
      }
      setIsLoading(false);
    });

    const eventsQuery = query(collection(db, 'cry_events'), orderBy('detected_at', 'desc'), limit(5));
    const eventsUnsubscribe = onSnapshot(eventsQuery, (querySnapshot) => {
      const events = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CryEvent[];
      setRecentEvents(events);
    });

    return () => { profileUnsubscribe(); statusUnsubscribe(); eventsUnsubscribe(); };
  }, []);

  const triggerAlert = () => {
    setShowAlert(true);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Baby is Crying!', { body: 'The AI monitor has detected a cry.', icon: '/baby-icon.png' });
    }
    setTimeout(() => setShowAlert(false), 5000);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const getStatusConfig = (status: BabyStatus) => {
    switch (status) {
      case 'sleeping':       return { icon: Moon,     color: 'bg-blue-100 text-blue-600',     borderColor: 'border-blue-300',   label: 'Sleeping' };
      case 'crying':         return { icon: Bell,     color: 'bg-red-100 text-red-600',       borderColor: 'border-red-300',    label: 'Crying' };
      case 'noise_detected': return { icon: Volume2,  color: 'bg-yellow-100 text-yellow-600', borderColor: 'border-yellow-300', label: 'Noise Detected' };
      default:               return { icon: Activity, color: 'bg-gray-100 text-gray-600',     borderColor: 'border-gray-300',   label: 'Standby' };
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleString();
  const formatTime = (d: string) => new Date(d).toLocaleTimeString();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const config = systemStatus ? getStatusConfig(systemStatus.current_status) : getStatusConfig('sleeping' as BabyStatus);
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8 overflow-hidden relative">

      {/* ═══════════════════════════════════════════════════════════════════
          SLOW CRAWLING BABY — FULL PHYSICS ANIMATION SYSTEM
          ───────────────────────────────────────────────────────────────── */}
      <style>{`

        /* ── 1. HORIZONTAL TRAVERSE ── */
        @keyframes crawlTraverse {
          0%    { left: calc(100% - 150px); transform: scaleX(-1); }
          3%    { left: calc(100% - 150px); transform: scaleX(-1); }
          46%   { left: 4px;                transform: scaleX(-1); }
          49%   { left: 4px;                transform: scaleX(-1); }
          52%   { left: 4px;                transform: scaleX(1);  }
          95%   { left: calc(100% - 150px); transform: scaleX(1);  }
          98%   { left: calc(100% - 150px); transform: scaleX(1);  }
          100%  { left: calc(100% - 150px); transform: scaleX(-1); }
        }
        .baby-wrapper {
          position: absolute;
          /* MATHEMATICAL ALIGNMENT: 
             The floor is 24px tall (h-6) + 2px border = 26px high.
             The baby's knees/hands in the SVG are at Y=90 (out of 110 total SVG height).
             This leaves 20px of empty space at the bottom of the SVG viewport.
             By setting bottom to 6px, the 20px gap perfectly overlaps the 26px floor line 
             so the baby's hands and knees physically "touch" the horizon.
          */
          bottom: 6px; 
          width: 150px;
          height: 120px;
          animation: crawlTraverse 35s ease-in-out infinite;
          z-index: 10;
          will-change: left, transform;
        }

        /* ── 2. GROUND SHADOW ── */
        @keyframes shadowPulse {
          0%, 50%, 100% { transform: scaleX(1.0);  opacity: 0.7; }
          25%, 75%      { transform: scaleX(0.85); opacity: 0.4; }
        }
        .baby-shadow {
          animation: shadowPulse 2.4s linear infinite;
          transform-origin: 60px 92px;
        }

        /* ── 3. BODY VERTICAL BOUNCE ── */
        @keyframes bodyBounce {
          0%, 50%, 100% { transform: translateY(0px); }
          25%, 75%      { transform: translateY(-2.5px); }
        }
        .baby-body-group {
          animation: bodyBounce 2.4s linear infinite;
          transform-origin: 55px 65px;
        }

        /* ── 4. SIDE-TO-SIDE WEIGHT SHIFT ── */
        @keyframes bodySway {
          0%, 100% { transform: rotate(-1.5deg) translateX(0px); }
          50%      { transform: rotate(1.5deg)  translateX(1px); }
        }
        .body-sway {
          animation: bodySway 2.4s linear infinite;
          transform-origin: 55px 65px;
        }

        /* ── 5. TORSO SQUASH & STRETCH ── */
        @keyframes bodySquash {
          0%, 50%, 100% { transform: scaleX(1.00) scaleY(1.00); }
          25%, 75%      { transform: scaleX(1.02) scaleY(0.97); }
        }
        .body-squash {
          animation: bodySquash 2.4s linear infinite;
          transform-origin: 55px 65px;
        }

        /* ── 6. HEAD BOB (soft neck lag) ── */
        @keyframes headBob {
          0%, 50%, 100% { transform: translateY(0px)    rotate(1deg);  }
          25%, 75%      { transform: translateY(-2px)   rotate(-1deg); }
        }
        .baby-head-group {
          animation: headBob 2.4s linear infinite;
          transform-origin: 80px 50px;
        }

        /* ── 7. BLINK ── */
        @keyframes blinkOpen {
          0%, 88%, 96%, 100% { opacity: 1; transform: scaleY(1);    }
          90%, 94%           { opacity: 0; transform: scaleY(0.05); }
        }
        @keyframes blinkClose {
          0%, 88%, 96%, 100% { opacity: 0; transform: scaleY(0.05); }
          90%, 94%           { opacity: 1; transform: scaleY(1);    }
        }
        .eye-open  { animation: blinkOpen  4s ease-in-out infinite; transform-origin: 98px 40px; }
        .eye-blink { animation: blinkClose 4s ease-in-out infinite; transform-origin: 98px 40px; }

        /* ── 8. LIMB GAIT (Crawling) ── */
        @keyframes limbFwd {
          0%, 100% { transform: rotate(-15deg) translateY(0px);  }
          50%      { transform: rotate(15deg)  translateY(-3px); }
        }
        @keyframes limbBwd {
          0%, 100% { transform: rotate(15deg)  translateY(0px);  }
          50%      { transform: rotate(-15deg) translateY(-3px); }
        }

        .limb-arm-front { animation: limbFwd 2.4s linear infinite; transform-origin: 80px 65px; }
        .limb-leg-back  { animation: limbFwd 2.4s linear infinite; transform-origin: 35px 65px; }
        
        .limb-arm-back  { animation: limbBwd 2.4s linear infinite; transform-origin: 70px 65px; }
        .limb-leg-front { animation: limbBwd 2.4s linear infinite; transform-origin: 45px 65px; }

      `}</style>

      {/* Visual Alert Overlay */}
      {showAlert && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-3 border-2 border-white">
            <Bell className="w-8 h-8" />
            <div>
              <p className="font-bold text-lg">CRITICAL: Baby Crying!</p>
              <p className="text-sm">Check the cradle immediately</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">

        {/* HEADER WITH CONTAINED ROOM & CLEAR SOLID FLOOR */}
        <header className="mb-8 relative flex flex-col md:flex-row md:items-center md:justify-between pb-10 pt-6 px-6 bg-white/40 rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">

          {/* ─── Sharp, Solid Nursery Floor UI ─── */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-slate-50 border-t-2 border-slate-200 z-0 flex items-start">
             <div className="w-full h-1 bg-slate-100 shadow-inner"></div>
          </div>

          <div className="baby-wrapper">
            <AnimatedCrawlingBaby />
          </div>

          <div className="relative z-20 mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 capitalize drop-shadow-sm">
              {babyName ? `${babyName}'s Room` : 'Smart Cradle Monitor'}
            </h1>
            <p className="text-gray-600 flex items-center bg-white/80 inline-flex px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-sm">
              <span className="flex h-3 w-3 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></span>
              <span className="font-medium">System Live & Monitoring</span>
            </p>
          </div>

          <button
            onClick={requestNotificationPermission}
            className="relative z-20 flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
          >
            <Bell className="w-4 h-4 text-indigo-500" />
            <span className="font-medium">Enable Alerts</span>
          </button>
        </header>

        {/* Status Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className={`bg-white rounded-2xl shadow-xl p-8 border-t-8 transition-all ${config.borderColor} relative overflow-hidden`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-500 font-medium tracking-wide">Baby Status</h2>
              <div className={`p-4 rounded-2xl ${config.color} shadow-inner`}>
                <StatusIcon className="w-8 h-8" />
              </div>
            </div>
            <p className="text-4xl font-black text-gray-900 tracking-tight">{config.label}</p>
            <p className="text-sm text-gray-400 mt-4 font-mono">
              Last Update: {systemStatus ? formatTime(systemStatus.updated_at) : 'Waiting...'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-500 font-medium tracking-wide">Last Cry Incident</h2>
              <div className="p-4 rounded-2xl bg-pink-50 text-pink-500">
                <Baby className="w-8 h-8" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-800 leading-tight">
              {systemStatus?.last_cry_detected
                ? formatDate(systemStatus.last_cry_detected)
                : 'No incidents recorded'}
            </p>
            <p className="text-sm text-gray-400 mt-4">History updated in real-time</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-indigo-100 font-medium tracking-wide">IoT Sensor Hub</h2>
              <div className="p-4 rounded-2xl bg-white/20 text-white backdrop-blur-md border border-white/10">
                <Activity className="w-8 h-8" />
              </div>
            </div>
            <p className="text-lg font-semibold relative z-10">Active Monitoring</p>
            <p className="text-sm text-indigo-100 mt-2 relative z-10">Connecting Local AI Analysis with Cloud Reporting.</p>
          </div>
        </div>

        {/* Action Center: AI Monitor + Event Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gray-900 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </div>
                  <span className="text-white text-sm font-bold tracking-widest uppercase">Live AI Engine</span>
                </div>
              </div>
              <div className="p-6 bg-gray-50/50">
                <LocalMonitor />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 h-full">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Event Feed</h2>
                <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full">LIVE</span>
              </div>

              {recentEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Activity className="w-12 h-12 mb-3 text-gray-300" />
                  <p className="font-medium text-sm">Monitoring for activities...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEvents.map((event) => {
                    const eventConfig = getStatusConfig(event.status);
                    const EventIcon = eventConfig.icon;
                    return (
                      <div
                        key={event.id}
                        className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-indigo-100 transition-all cursor-default"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl ${eventConfig.color} shadow-sm group-hover:scale-110 transition-transform`}>
                            <EventIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{eventConfig.label}</p>
                            <p className="text-xs text-gray-500 font-medium">{formatDate(event.detected_at)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-bold
                            ${event.intensity >= 75 ? 'bg-red-50 text-red-600 border-red-100' :
                              event.intensity >= 40 ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                              'bg-green-50 text-green-600 border-green-100'}`}>
                            {event.intensity}% Match
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}