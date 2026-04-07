// src/components/Settings.tsx
import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Wifi, Bell, Info, Code, Moon, Music, AlertCircle, LogOut } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export default function Settings() {
  const [apiEndpoint] = useState(
    import.meta.env.VITE_API_URL || "http://localhost:8000"
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    Notification.permission === 'granted'
  );

  // ─── Auto-Soothing Simulation State ───
  const [demoState, setDemoState] = useState<'sleeping' | 'crying' | 'soothing'>('sleeping');
  const [timeRemaining, setTimeRemaining] = useState(10);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    intervalId = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // State Machine Loop
    if (demoState === 'sleeping') {
      setTimeRemaining(10);
      timeoutId = setTimeout(() => setDemoState('crying'), 10000);
    } else if (demoState === 'crying') {
      setTimeRemaining(10);
      timeoutId = setTimeout(() => setDemoState('soothing'), 10000);
    } else if (demoState === 'soothing') {
      setTimeRemaining(10);
      timeoutId = setTimeout(() => setDemoState('sleeping'), 10000);
    }

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [demoState]);

  const handleEnableNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
  };

  const testNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'Baby monitor notifications are working!',
        icon: '/baby-icon.png',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      
      {/* ── Custom Animations for Full-Body Simulator ── */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-30px) scale(1.2) translateX(10px); opacity: 0; }
        }
        @keyframes floatNoteRight {
          0% { transform: translateY(0) translateX(0) scale(0.5) rotate(-15deg); opacity: 0; }
          20% { opacity: 1; transform: translateY(-10px) translateX(25px) scale(1) rotate(0deg); }
          100% { transform: translateY(-30px) translateX(90px) scale(1.3) rotate(20deg); opacity: 0; }
        }
        @keyframes tearDrop {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(15px); opacity: 0; }
        }
        @keyframes breathe {
          0%, 100% { transform: scaleY(1) scaleX(1); }
          50% { transform: scaleY(0.95) scaleX(1.02); }
        }
        @keyframes flailArm {
          0%, 100% { transform: rotate(-25deg); }
          50% { transform: rotate(15deg); }
        }
        @keyframes flailLeg {
          0%, 100% { transform: rotate(-20deg); }
          50% { transform: rotate(20deg); }
        }
        @keyframes shakeHead {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }

        .animate-float-1 { animation: floatUp 2s ease-in infinite; }
        .animate-float-2 { animation: floatUp 2.5s ease-in infinite 0.5s; }
        .animate-float-3 { animation: floatUp 2.2s ease-in infinite 1s; }
        
        .animate-float-note-1 { animation: floatNoteRight 2s ease-in infinite; }
        .animate-float-note-2 { animation: floatNoteRight 2.5s ease-in infinite 0.5s; }
        .animate-float-note-3 { animation: floatNoteRight 2.2s ease-in infinite 1s; }
        
        .animate-tear { animation: tearDrop 0.8s ease-in infinite; }
        .animate-breathe { animation: breathe 3s ease-in-out infinite; }
        
        /* State Utility Classes */
        .arm-sleep { transform: rotate(35deg); transition: transform 1s ease-in-out; }
        .arm-cry { animation: flailArm 0.3s infinite; }
        .arm-soothe { transform: rotate(15deg); transition: transform 1s ease-in-out; }

        .leg-sleep { transform: rotate(5deg); transition: transform 1s ease-in-out; }
        .leg-cry { animation: flailLeg 0.3s infinite alternate; }
        .leg-soothe { transform: rotate(0deg); transition: transform 1s ease-in-out; }
        
        .head-cry { animation: shakeHead 0.3s infinite; }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Settings
          </h1>
          <p className="text-gray-600">Configure your baby monitoring system</p>
        </div>

        <div className="space-y-6">

          {/* ═════════════════════════════════════════════════════════════════
              AUTO-SOOTHING SIMULATOR CARD
              ═════════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-indigo-50 overflow-hidden relative">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Music className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Auto-Soothing System Preview</h2>
                <p className="text-sm text-gray-500">How the AI reacts & triggers the smart speaker</p>
              </div>
            </div>

            <div className={`p-8 rounded-2xl flex flex-col items-center justify-center transition-colors duration-1000 relative overflow-hidden ${
              demoState === 'sleeping' ? 'bg-blue-50' :
              demoState === 'crying' ? 'bg-red-50' : 'bg-purple-50'
            }`}>
              
              {/* Dynamic Status Header */}
              <div className="flex items-center space-x-2 mb-6 z-10 relative bg-white/60 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm">
                {demoState === 'sleeping' && <span className="flex items-center text-blue-600 font-bold"><Moon className="w-5 h-5 mr-2 animate-pulse"/> Baby is Sleeping ({timeRemaining}s)</span>}
                {demoState === 'crying' && <span className="flex items-center text-red-600 font-bold animate-pulse"><AlertCircle className="w-5 h-5 mr-2"/> Cry Detected! ({timeRemaining}s)</span>}
                {demoState === 'soothing' && <span className="flex items-center text-purple-600 font-bold"><Music className="w-5 h-5 mr-2 animate-bounce"/> Speaker Soothing... ({timeRemaining}s)</span>}
              </div>

              {/* Animated SVG Scene */}
              <div className="relative w-full max-w-lg aspect-[21/9]">
                <svg viewBox="0 0 200 120" className="w-full h-full drop-shadow-md overflow-visible">
                  
                  {/* ─── 1. BLUETOOTH SMART SPEAKER ─── */}
                  <g transform="translate(20, 68)">
                    {/* Speaker Drop Shadow */}
                    <ellipse cx="14" cy="40" rx="16" ry="4" fill="#94a3b8" opacity="0.4" />
                    
                    {/* Device Chassis */}
                    <rect x="0" y="8" width="28" height="32" rx="4" fill="#1e293b" />
                    <rect x="2" y="10" width="24" height="28" rx="2" fill="#334155" />
                    
                    {/* Speaker Grill Dots */}
                    <g fill="#0f172a" opacity="0.4">
                      {[14, 18, 22, 26, 30].map(y => (
                        [6, 10, 14, 18, 22].map(x => (
                          <circle key={`dot-${x}-${y}`} cx={x} cy={y} r="1" />
                        ))
                      ))}
                    </g>
                    
                    {/* Top Control Panel */}
                    <path d="M 0 8 Q 14 -3 28 8 Z" fill="#0f172a" />
                    
                    {/* Glowing LED Ring (Pulses when active) */}
                    <ellipse 
                      cx="14" cy="5" rx="9" ry="2" fill="none" 
                      stroke={demoState === 'soothing' ? "#c084fc" : "#475569"} 
                      strokeWidth="1.5" 
                      className={demoState === 'soothing' ? "animate-pulse" : "transition-colors duration-500"} 
                    />
                    
                    {/* Directional Sound Waves hitting the baby */}
                    {demoState === 'soothing' && (
                      <g stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" fill="none" className="animate-pulse">
                        <path d="M 32 15 Q 36 20 32 25" />
                        <path d="M 37 10 Q 44 20 37 30" opacity="0.8"/>
                        <path d="M 42 5 Q 52 20 42 35" opacity="0.5"/>
                      </g>
                    )}
                  </g>

                  {/* ─── 2. BABY LYING ON BACK (Floor Level) ─── */}
                  <g transform="translate(15, 18)">
                    
                    {/* Baby Ground shadow (Aligns perfectly with speaker floor) */}
                    <ellipse cx="120" cy="90" rx="45" ry="5" fill="#94a3b8" opacity="0.4" />

                    <g className="baby-on-back">
                      
                      {/* Back Arm (Left Arm) */}
                      <g className={demoState === 'sleeping' ? 'arm-sleep' : (demoState === 'crying' ? 'arm-cry' : 'arm-soothe')} style={{ transformOrigin: '120px 70px' }}>
                        <path d="M 120 70 L 130 50 L 135 55" fill="none" stroke="#f07598" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                      </g>

                      {/* Back Leg (Left Leg) */}
                      <g className={demoState === 'sleeping' ? 'leg-sleep' : (demoState === 'crying' ? 'leg-cry' : 'leg-soothe')} style={{ transformOrigin: '145px 72px' }}>
                        <path d="M 145 72 L 160 55 L 170 60" fill="none" stroke="#f07598" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
                      </g>
                      
                      {/* Body (Tummy facing up) */}
                      <g className={demoState === 'sleeping' ? 'animate-breathe' : ''} style={{ transformOrigin: '125px 75px' }}>
                        <ellipse cx="125" cy="76" rx="26" ry="14" fill="#ff8fab"/>
                        {/* Diaper */}
                        <path d="M 135 62 Q 155 62 151 90 Q 125 90 135 62 Z" fill="#ffffff" />
                      </g>

                      {/* Front Arm (Right Arm) */}
                      <g className={demoState === 'sleeping' ? 'arm-sleep' : (demoState === 'crying' ? 'arm-cry' : 'arm-soothe')} style={{ transformOrigin: '115px 75px', animationDelay: '0.1s' }}>
                        <path d="M 115 75 L 125 55 L 115 50" fill="none" stroke="#ff8fab" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="115" cy="50" r="4.5" fill="#ffe4e1"/>
                      </g>

                      {/* Front Leg (Right Leg) */}
                      <g className={demoState === 'sleeping' ? 'leg-sleep' : (demoState === 'crying' ? 'leg-cry' : 'leg-soothe')} style={{ transformOrigin: '140px 75px', animationDelay: '0.1s' }}>
                        <path d="M 140 75 L 155 50 L 165 50" fill="none" stroke="#ff8fab" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round"/>
                        <ellipse cx="165" cy="50" rx="5" ry="4" fill="#ffe4e1"/>
                      </g>

                      {/* Head resting on the left side */}
                      <g className={demoState === 'crying' ? 'head-cry' : ''} style={{ transformOrigin: '85px 65px' }}>
                        <circle cx="85" cy="65" r="20" fill="#ffe4e1"/>
                        <circle cx="75" cy="68" r="4.5" fill="#ffbfa8" opacity="0.6"/> {/* Left cheek */}
                        <circle cx="100" cy="68" r="4.5" fill="#ffbfa8" opacity="0.6"/> {/* Right cheek */}
                        <circle cx="67" cy="65" r="4" fill="#ffbfa8"/> {/* Ear */}

                        {/* Eyes */}
                        {demoState === 'sleeping' && (
                          <g stroke="#1e1e1e" strokeWidth="1.5" strokeLinecap="round" fill="none">
                            <path d="M 75 60 Q 80 63 85 60" />
                            <path d="M 93 60 Q 98 63 103 60" />
                          </g>
                        )}
                        {demoState === 'crying' && (
                          <g stroke="#1e1e1e" strokeWidth="1.5" strokeLinecap="round" fill="none">
                            <path d="M 75 62 L 85 58 M 75 58 L 85 62" /> 
                            <path d="M 93 62 L 103 58 M 93 58 L 103 62" /> 
                            {/* Tears falling to the side */}
                            <circle cx="80" cy="72" r="2" fill="#60a5fa" className="animate-tear" />
                            <circle cx="98" cy="72" r="2" fill="#60a5fa" className="animate-tear" style={{ animationDelay: '0.3s' }} />
                          </g>
                        )}
                        {demoState === 'soothing' && (
                          <g fill="#1e1e1e">
                            <circle cx="78" cy="60" r="2.5" />
                            <circle cx="96" cy="60" r="2.5" />
                            <path d="M 75 56 Q 80 54 85 56" fill="none" stroke="#1e1e1e" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M 93 56 Q 98 54 103 56" fill="none" stroke="#1e1e1e" strokeWidth="1.5" strokeLinecap="round"/>
                          </g>
                        )}

                        {/* Mouth */}
                        {demoState === 'sleeping' && (
                          <path d="M 87 75 Q 90 77 93 75" fill="none" stroke="#1e1e1e" strokeWidth="1.5" strokeLinecap="round" />
                        )}
                        {demoState === 'crying' && (
                          <path d="M 85 70 Q 90 82 95 70 Z" fill="#7a1a2b" stroke="#1e1e1e" strokeWidth="1" />
                        )}
                        {demoState === 'soothing' && (
                          <circle cx="90" cy="73" r="2" fill="#1e1e1e" /> 
                        )}
                      </g>
                    </g>
                  </g>
                </svg>

                {/* ─── 3. FLOATING HTML OVERLAYS (Zzzs & Music Notes) ─── */}
                <div className="absolute inset-0 pointer-events-none">
                  
                  {/* Sleeping Zzzs coming from the baby */}
                  {demoState === 'sleeping' && (
                    <div className="absolute right-[25%] top-[15%] w-24 h-24">
                      <span className="absolute bottom-0 right-10 text-2xl font-black text-blue-400 animate-float-1 opacity-0">Z</span>
                      <span className="absolute bottom-6 right-4 text-xl font-bold text-blue-400 animate-float-2 opacity-0">z</span>
                      <span className="absolute top-4 right-0 text-lg font-bold text-blue-400 animate-float-3 opacity-0">z</span>
                    </div>
                  )}
                  
                  {/* Soothing Notes coming from the Bluetooth Speaker */}
                  {demoState === 'soothing' && (
                    <div className="absolute left-[15%] top-[50%] w-full h-32">
                      <span className="absolute bottom-8 left-0 text-3xl text-purple-500 animate-float-note-1 opacity-0 inline-block drop-shadow-sm">🎵</span>
                      <span className="absolute bottom-4 left-6 text-2xl text-purple-400 animate-float-note-2 opacity-0 inline-block drop-shadow-sm">🎶</span>
                      <span className="absolute bottom-12 left-2 text-xl text-purple-600 animate-float-note-3 opacity-0 inline-block drop-shadow-sm">🎵</span>
                    </div>
                  )}

                </div>
              </div>
            </div>
            
            {/* System Status Timeline */}
            <div className="mt-6 flex items-center justify-between text-xs font-bold tracking-wider text-gray-400">
              <div className={`flex flex-col items-center flex-1 transition-colors duration-300 ${demoState === 'sleeping' ? 'text-blue-600' : ''}`}>
                <div className={`h-2 w-full rounded-l-full mb-2 transition-colors duration-300 ${demoState === 'sleeping' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-gray-200'}`}></div>
                <span>1. MONITORING</span>
              </div>
              <div className={`flex flex-col items-center flex-1 transition-colors duration-300 ${demoState === 'crying' ? 'text-red-600' : ''}`}>
                <div className={`h-2 w-full mb-2 transition-colors duration-300 ${demoState === 'crying' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-gray-200'}`}></div>
                <span>2. DETECT CRY</span>
              </div>
              <div className={`flex flex-col items-center flex-1 transition-colors duration-300 ${demoState === 'soothing' ? 'text-purple-600' : ''}`}>
                <div className={`h-2 w-full rounded-r-full mb-2 transition-colors duration-300 ${demoState === 'soothing' ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-gray-200'}`}></div>
                <span>3. AUTO SOOTHE</span>
              </div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════
              EXISTING SETTINGS (Notifications, IoT, System)
              ═════════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800">Browser Notifications</p>
                  <p className="text-sm text-gray-500">
                    Get alerted when baby is crying
                  </p>
                </div>
                <button
                  onClick={handleEnableNotifications}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    notificationsEnabled
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  {notificationsEnabled ? 'Enabled' : 'Enable'}
                </button>
              </div>

              {notificationsEnabled && (
                <button
                  onClick={testNotification}
                  className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Send Test Notification
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wifi className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">IoT Device Connection</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  API Endpoint
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={apiEndpoint}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <button
                    onClick={() => copyToClipboard(apiEndpoint)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Device Setup Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Configure your IoT device with the API endpoint above</li>
                      <li>Send POST requests to /sound-detected with sound data</li>
                      <li>Include intensity (0-100) and status in the payload</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Code className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Example IoT Code</h2>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Arduino/ESP32 Example:
                </p>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`#include <WiFi.h>
#include <HTTPClient.h>

const char* apiUrl = "${apiEndpoint}/sound-detected";

void sendSoundData(int intensity, String status) {
  HTTPClient http;
  http.begin(apiUrl);
  http.addHeader("Content-Type", "application/json");

  String payload = "{\\"intensity\\":" + String(intensity) +
                   ",\\"status\\":\\"" + status + "\\"}";

  int httpCode = http.POST(payload);
  http.end();
}

void loop() {
  int soundLevel = analogRead(SOUND_SENSOR_PIN);
  int intensity = map(soundLevel, 0, 1023, 0, 100);

  if (intensity > 70) {
    sendSoundData(intensity, "crying");
  }
  delay(1000);
}`}
                </pre>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  cURL Test Command:
                </p>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`curl -X POST ${apiEndpoint}/sound-detected \\
  -H "Content-Type: application/json" \\
  -d '{"intensity": 85, "status": "crying", "duration": 5}'`}
                </pre>
                <button
                  onClick={() => copyToClipboard(
                    `curl -X POST ${apiEndpoint}/sound-detected -H "Content-Type: application/json" -d '{"intensity": 85, "status": "crying", "duration": 5}'`
                  )}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  Copy command
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <SettingsIcon className="w-6 h-6 text-gray-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">System Information</h2>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Version</span>
                <span className="font-semibold text-gray-800">1.0.0</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Database</span>
                <span className="font-semibold text-gray-800">Supabase</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Real-time Updates</span>
                <span className="font-semibold text-green-600">Active</span>
              </div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════
              ACCOUNT & LOGOUT SECTION
              ═════════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-red-50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Account</h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Sign out of your monitor account on this device. You will need to log back in to access the smart cradle controls and history.
              </p>
              <button
                onClick={handleSignOut}
                className="w-full md:w-auto px-8 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg transition-colors border border-red-200 flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}