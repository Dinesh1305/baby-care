// src/components/Settings.tsx
import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Wifi, Bell, Info, Code, Moon, Music, AlertCircle } from 'lucide-react';

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

    // State Machine Loop - Every phase is exactly 10 seconds
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      
      {/* ── Custom Animations for Top-Down Simulator ── */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-30px) scale(1.2) translateX(10px); opacity: 0; }
        }
        @keyframes floatNoteRight {
          0% { transform: translate(0, 0) scale(0.5) rotate(-15deg); opacity: 0; }
          20% { opacity: 1; transform: translate(25px, -15px) scale(1) rotate(0deg); }
          100% { transform: translate(80px, -40px) scale(1.3) rotate(20deg); opacity: 0; }
        }
        @keyframes tearDropLeft {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(-10px, 5px); opacity: 0; }
        }
        @keyframes tearDropRight {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(10px, 5px); opacity: 0; }
        }
        @keyframes breathe {
          0%, 100% { transform: scaleY(1) scaleX(1); }
          50% { transform: scaleY(0.95) scaleX(1.03); }
        }
        @keyframes rockCradleTopDown {
          0%, 100% { transform: translateX(-4px) rotate(-1deg); }
          50% { transform: translateX(4px) rotate(1deg); }
        }
        @keyframes flailArmLeft {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-30deg); }
        }
        @keyframes flailArmRight {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(30deg); }
        }
        @keyframes flailLegLeft {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(25deg); }
        }
        @keyframes flailLegRight {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-25deg); }
        }
        @keyframes shakeHead {
          0%, 100% { transform: translateX(-1px) rotate(-2deg); }
          50% { transform: translateX(1px) rotate(2deg); }
        }
        @keyframes soundWave {
          0% { opacity: 0.8; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.5); }
        }

        .animate-float-1 { animation: floatUp 2.5s ease-in infinite; }
        .animate-float-2 { animation: floatUp 3s ease-in infinite 0.5s; }
        .animate-float-3 { animation: floatUp 2.8s ease-in infinite 1s; }
        
        .animate-float-note-1 { animation: floatNoteRight 2.5s ease-in infinite; }
        .animate-float-note-2 { animation: floatNoteRight 3s ease-in infinite 0.7s; }
        .animate-float-note-3 { animation: floatNoteRight 2.8s ease-in infinite 1.4s; }
        
        .animate-tear-l { animation: tearDropLeft 0.8s ease-in infinite; }
        .animate-tear-r { animation: tearDropRight 0.8s ease-in infinite; }
        
        .animate-breathe { animation: breathe 3s ease-in-out infinite; transform-origin: 35px 53px; }
        .animate-rock-td { animation: rockCradleTopDown 2.5s ease-in-out infinite; transform-origin: 35px 55px; }
        
        .arm-cry-l { animation: flailArmLeft 0.3s infinite alternate; transform-origin: 24px 42px; }
        .arm-cry-r { animation: flailArmRight 0.3s infinite alternate; transform-origin: 46px 42px; }
        .leg-cry-l { animation: flailLegLeft 0.3s infinite alternate; transform-origin: 28px 65px; }
        .leg-cry-r { animation: flailLegRight 0.3s infinite alternate; transform-origin: 42px 65px; }
        .head-cry { animation: shakeHead 0.3s infinite alternate; transform-origin: 35px 25px; }
        
        .wave-1 { animation: soundWave 2s ease-out infinite; transform-origin: 30px 40px; }
        .wave-2 { animation: soundWave 2s ease-out infinite 0.6s; transform-origin: 30px 40px; }
        .wave-3 { animation: soundWave 2s ease-out infinite 1.2s; transform-origin: 30px 40px; }
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

              {/* Animated SVG Scene - Top Down View */}
              <div className="relative w-full max-w-lg aspect-[21/9] flex justify-center items-center">
                <svg viewBox="0 0 260 140" className="w-full h-full drop-shadow-sm overflow-visible">
                  
                  {/* ─── 1. SMART SPEAKER (Top-Down Cylinder) ─── */}
                  <g transform="translate(45, 45)">
                    
                    {/* Pulsing Sound Waves behind speaker */}
                    {demoState === 'soothing' && (
                      <g stroke="#c084fc" strokeWidth="2" fill="none">
                        <circle cx="30" cy="40" r="22" className="wave-1" />
                        <circle cx="30" cy="40" r="22" className="wave-2" />
                        <circle cx="30" cy="40" r="22" className="wave-3" />
                      </g>
                    )}

                    {/* Speaker Drop Shadow */}
                    <ellipse cx="30" cy="65" rx="20" ry="8" fill="#94a3b8" opacity="0.4" />
                    
                    {/* Cylinder Body */}
                    <rect x="10" y="40" width="40" height="25" fill="#1e293b" />
                    <ellipse cx="30" cy="65" rx="20" ry="6" fill="#1e293b" />
                    <ellipse cx="30" cy="40" rx="20" ry="6" fill="#334155" />
                    
                    {/* Glowing LED Ring */}
                    <ellipse 
                      cx="30" cy="40" rx="16" ry="4" fill="none" 
                      stroke={demoState === 'soothing' ? "#3b82f6" : "#475569"} 
                      strokeWidth="2.5" 
                      className={demoState === 'soothing' ? "animate-pulse" : "transition-colors duration-500"} 
                    />
                    
                    {/* Center buttons/mic holes */}
                    <circle cx="26" cy="40" r="1" fill="#0f172a" />
                    <circle cx="34" cy="40" r="1" fill="#0f172a" />
                    <circle cx="30" cy="37" r="1" fill="#0f172a" />
                    <circle cx="30" cy="43" r="1" fill="#0f172a" />
                  </g>

                  {/* ─── 2. WOODEN CRADLE & BABY (Top-Down) ─── */}
                  <g transform="translate(130, 15)">
                    
                    {/* Cradle Ground Shadow */}
                    <ellipse cx="35" cy="55" rx="45" ry="60" fill="#94a3b8" opacity="0.3" />

                    {/* Rocking Cradle Group */}
                    <g className={demoState === 'soothing' ? 'animate-rock-td' : 'transition-transform duration-1000'}>
                      
                      {/* Top & Bottom Rocker Arcs */}
                      <path d="M -10 10 Q 35 -5 80 10" fill="none" stroke="#bc8f8f" strokeWidth="6" strokeLinecap="round" />
                      <path d="M -10 100 Q 35 115 80 100" fill="none" stroke="#bc8f8f" strokeWidth="6" strokeLinecap="round" />

                      {/* Motion indicators for rocking */}
                      {demoState === 'soothing' && (
                        <g stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6">
                          <path d="M -20 105 Q -25 110 -20 115" />
                          <path d="M -25 105 Q -30 110 -25 115" />
                          <path d="M 90 105 Q 95 110 90 115" />
                          <path d="M 95 105 Q 100 110 95 115" />
                        </g>
                      )}

                      {/* Main Wooden Frame */}
                      <rect x="0" y="10" width="70" height="90" fill="#deb887" stroke="#8b4513" strokeWidth="4" rx="3" />
                      
                      {/* Mattress / Sheet */}
                      <rect x="5" y="15" width="60" height="80" fill="#f8fafc" rx="2" />
                      
                      {/* Mattress contour line */}
                      <rect x="8" y="18" width="54" height="74" fill="none" stroke="#e2e8f0" strokeWidth="1" rx="2" />

                      {/* ── BABY (Top-Down view, lying on back) ── */}
                      <g>
                        
                        {/* Arms */}
                        <g className={demoState === 'crying' ? 'arm-cry-l' : 'transition-transform duration-700'} style={{ transformOrigin: '24px 42px' }}>
                          <path d="M 24 42 Q 12 40 12 30" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" fill="none" />
                          <circle cx="12" cy="28" r="3.5" fill="#8b5a2b" /> {/* Left Hand */}
                        </g>
                        <g className={demoState === 'crying' ? 'arm-cry-r' : 'transition-transform duration-700'} style={{ transformOrigin: '46px 42px' }}>
                          <path d="M 46 42 Q 58 40 58 30" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" fill="none" />
                          <circle cx="58" cy="28" r="3.5" fill="#8b5a2b" /> {/* Right Hand */}
                        </g>

                        {/* Legs */}
                        <g className={demoState === 'crying' ? 'leg-cry-l' : 'transition-transform duration-700'} style={{ transformOrigin: '28px 65px' }}>
                          <path d="M 28 65 Q 20 80 18 76" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" fill="none" />
                          <circle cx="18" cy="76" r="4.5" fill="#ef4444" /> {/* Left Foot */}
                        </g>
                        <g className={demoState === 'crying' ? 'leg-cry-r' : 'transition-transform duration-700'} style={{ transformOrigin: '42px 65px' }}>
                          <path d="M 42 65 Q 50 80 52 76" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" fill="none" />
                          <circle cx="52" cy="76" r="4.5" fill="#ef4444" /> {/* Right Foot */}
                        </g>

                        {/* Torso (Red Onesie) */}
                        <g className={demoState === 'sleeping' ? 'animate-breathe' : ''}>
                          <rect x="23" y="38" width="24" height="30" rx="10" fill="#ef4444" />
                          <path d="M 23 60 Q 35 68 47 60" fill="none" stroke="#dc2626" strokeWidth="1.5" /> {/* Diaper fold line */}
                        </g>

                        {/* Head */}
                        <g className={demoState === 'crying' ? 'head-cry' : 'transition-transform duration-700'}>
                          <circle cx="35" cy="25" r="14" fill="#8b5a2b" />
                          
                          {/* Curly Hair (Dark overlapping circles) */}
                          <g fill="#1a110b">
                            <circle cx="25" cy="16" r="4" />
                            <circle cx="30" cy="13" r="4.5" />
                            <circle cx="35" cy="12" r="5" />
                            <circle cx="40" cy="13" r="4.5" />
                            <circle cx="45" cy="16" r="4" />
                            <circle cx="23" cy="22" r="3.5" />
                            <circle cx="47" cy="22" r="3.5" />
                          </g>

                          {/* Ears */}
                          <circle cx="20" cy="26" r="3" fill="#6b4423" />
                          <circle cx="50" cy="26" r="3" fill="#6b4423" />

                          {/* Face Details */}
                          {demoState === 'sleeping' && (
                            <g stroke="#3e2723" strokeWidth="1.5" fill="none" strokeLinecap="round">
                              {/* Closed eyes */}
                              <path d="M 28 25 Q 31 27 33 25" />
                              <path d="M 37 25 Q 40 27 42 25" />
                              {/* Soft smile */}
                              <path d="M 33 31 Q 35 33 37 31" /> 
                            </g>
                          )}
                          
                          {demoState === 'crying' && (
                            <g>
                              {/* Squinted crying eyes >< */}
                              <g stroke="#3e2723" strokeWidth="1.5" fill="none" strokeLinecap="round">
                                <path d="M 28 24 L 32 26 M 28 26 L 32 24" />
                                <path d="M 38 24 L 42 26 M 38 26 L 42 24" />
                              </g>
                              {/* Tears splashing sideways */}
                              <circle cx="25" cy="28" r="1.5" fill="#60a5fa" className="animate-tear-l" />
                              <circle cx="45" cy="28" r="1.5" fill="#60a5fa" className="animate-tear-r" style={{animationDelay: '0.2s'}} />
                              {/* Open wailing mouth */}
                              <circle cx="35" cy="32" r="2.5" fill="#7a1a2b" />
                            </g>
                          )}

                          {demoState === 'soothing' && (
                            <g>
                              {/* Eyes open, looking left toward the speaker */}
                              <ellipse cx="30" cy="25" rx="1.5" ry="2" fill="#1a110b" />
                              <ellipse cx="39" cy="25" rx="1.5" ry="2" fill="#1a110b" />
                              {/* Little 'o' mouth listening */}
                              <circle cx="35" cy="32" r="1.5" fill="#3e2723" />
                            </g>
                          )}
                        </g>
                      </g>
                    </g>
                  </g>
                </svg>

                {/* ─── 3. FLOATING HTML OVERLAYS (Zzzs & Music Notes) ─── */}
                <div className="absolute inset-0 pointer-events-none">
                  
                  {/* Sleeping Zzzs coming from the cradle */}
                  {demoState === 'sleeping' && (
                    <div className="absolute right-[22%] top-[10%] w-24 h-24">
                      <span className="absolute bottom-0 right-10 text-2xl font-black text-blue-400 animate-float-1 opacity-0">Z</span>
                      <span className="absolute bottom-6 right-4 text-xl font-bold text-blue-400 animate-float-2 opacity-0">z</span>
                      <span className="absolute top-4 right-0 text-lg font-bold text-blue-400 animate-float-3 opacity-0">z</span>
                    </div>
                  )}
                  
                  {/* Soothing Notes coming from the Bluetooth Speaker */}
                  {demoState === 'soothing' && (
                    <div className="absolute left-[30%] top-[45%] w-full h-32">
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
        </div>
      </div>
    </div>
  );
}