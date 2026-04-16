


// import { useState, useRef, useEffect } from 'react';
// import { Mic, Activity, Loader2, ShieldCheck, AlertCircle, Radio } from 'lucide-react';

// export default function LocalMonitor() {
  
//   // ==========================================
//   // 1. NEW: LIVE AI POLLING MONITOR STATE
//   // ==========================================
//   const [liveStatus, setLiveStatus] = useState<{
//     label: string;
//     confidence: number;
//     is_crying: boolean;
//     status: string;
//   }>({
//     label: "Connecting...",
//     confidence: 0,
//     is_crying: false,
//     status: "Offline"
//   });
//   const [liveError, setLiveError] = useState<string | null>(null);

//   // Poll the backend every 1 second
//   useEffect(() => {
//     const fetchStatus = async () => {
//       try {
//         const res = await fetch('http://localhost:8000/status');
//         if (!res.ok) throw new Error("Backend unreachable");
//         const data = await res.json();
        
//         setLiveStatus(data);
//         setLiveError(null);
//       } catch (err) {
//         setLiveError("Cannot connect to AI Backend. Ensure main_test.py is running.");
//       }
//     };

//     const interval = setInterval(fetchStatus, 1000); // Check every second
//     return () => clearInterval(interval);
//   }, []);

//   // ==========================================
//   // 2. EXISTING: MANUAL 5S MIC TESTER STATE
//   // ==========================================
//   const [isMonitoring, setIsMonitoring] = useState(false);
//   const [result, setResult] = useState<{ label: string; confidence: number } | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);

//   const startRecording = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     const recorder = new MediaRecorder(stream);
//     mediaRecorderRef.current = recorder;
//     const chunks: Blob[] = [];

//     recorder.ondataavailable = (e) => chunks.push(e.data);
//     recorder.onstop = async () => {
//       const blob = new Blob(chunks, { type: 'audio/wav' });
//       await sendToAI(blob);
//     };

//     recorder.start();
//     setIsMonitoring(true);

//     // Record for 5 seconds then stop automatically
//     setTimeout(() => {
//       recorder.stop();
//       stream.getTracks().forEach(t => t.stop());
//       setIsMonitoring(false);
//     }, 5000);
//   };

//   const sendToAI = async (blob: Blob) => {
//     setIsProcessing(true);
//     const formData = new FormData();
//     formData.append('file', blob, 'clip.wav');

//     try {
//       const res = await fetch('http://localhost:8000/predict', {
//         method: 'POST',
//         body: formData,
//       });
//       const data = await res.json();
//       setResult({ label: data.label, confidence: data.confidence });
//     } catch (err) {
//       console.error("AI Server Error:", err);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // ==========================================
//   // RENDER BOTH COMPONENTS
//   // ==========================================
//   return (
//     <div className="space-y-6">
      
//       {/* ─── LIVE AI POLLING DASHBOARD ─── */}
//       <div className={`p-6 rounded-2xl shadow-xl border-2 transition-all duration-500 ${
//         liveStatus.is_crying ? 'bg-red-50 border-red-500 animate-pulse' : 'bg-white border-indigo-100'
//       }`}>
//         <div className="flex justify-between items-center mb-6">
//           <div className="flex items-center space-x-2">
//             <Radio className={liveStatus.status === "Monitoring" ? "text-green-500" : "text-gray-400"} size={20} />
//             <h3 className="font-bold text-gray-800 text-lg">AI Live Monitor</h3>
//           </div>
//           {liveStatus.status === "Monitoring" && (
//             <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
//               LIVE
//             </span>
//           )}
//         </div>

//         {liveError ? (
//           <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
//             <AlertCircle size={18} />
//             <p className="text-sm font-medium">{liveError}</p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             <div className="flex items-center justify-center py-8">
//               {liveStatus.is_crying ? (
//                 <div className="text-center">
//                   <Activity size={64} className="text-red-600 mx-auto mb-2" />
//                   <h2 className="text-4xl font-black text-red-600 tracking-tight">CRYING DETECTED</h2>
//                   <p className="text-red-500 font-bold">{liveStatus.confidence}% Confidence</p>
//                 </div>
//               ) : (
//                 <div className="text-center">
//                   <ShieldCheck size={64} className="text-green-500 mx-auto mb-2" />
//                   <h2 className="text-3xl font-bold text-gray-800">{liveStatus.label}</h2>
//                   <p className="text-gray-500">System Monitoring Quietly</p>
//                 </div>
//               )}
//             </div>

//             <div className="bg-gray-50 p-3 rounded-xl">
//               <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
//                 <span>Sensor Status</span>
//                 <span>{liveStatus.status}</span>
//               </div>
//               <div className="w-full bg-gray-200 h-2 mt-2 rounded-full overflow-hidden">
//                 <div 
//                   className={`h-full transition-all duration-500 ${liveStatus.is_crying ? 'bg-red-500' : 'bg-green-500'}`}
//                   style={{ width: `${liveStatus.confidence}%` }}
//                 ></div>
//               </div>
//             </div>
//           </div>
//         )}

//         <p className="mt-4 text-[10px] text-center text-gray-400 italic">
//           Real-time audio processing enabled via Python Backend
//         </p>
//       </div>

//       {/* ─── MANUAL AI TESTER (Your original active code) ─── */}
//       <div className="p-6 bg-white rounded-2xl shadow-xl border border-indigo-100">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="font-bold text-gray-800">Local AI Tester</h3>
//           {isMonitoring && <Activity className="text-red-500 animate-pulse" />}
//         </div>

//         <button
//           onClick={startRecording}
//           disabled={isMonitoring || isProcessing}
//           className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
//         >
//           {isProcessing ? <Loader2 className="animate-spin" /> : <Mic size={20} />}
//           <span>{isMonitoring ? 'Recording 5s...' : 'Test 5s Sample'}</span>
//         </button>

//         {result && (
//           <div className={`mt-6 p-4 rounded-xl border-2 ${result.label === 'Crying' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
//             <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Result</p>
//             <p className={`text-2xl font-black ${result.label === 'Crying' ? 'text-red-600' : 'text-green-600'}`}>
//               {result.label} ({result.confidence}%)
//             </p>
//           </div>
//         )}
//       </div>

//     </div>
//   );
// }

// working before firebase

// import { useState, useRef, useEffect } from 'react';
// import { Mic, Activity, Loader2, ShieldCheck, AlertCircle, Radio, Moon, Footprints } from 'lucide-react';

// export default function LocalMonitor() {
  
//   // ==========================================
//   // 1. LIVE AI POLLING MONITOR STATE
//   // ==========================================
//   const [liveStatus, setLiveStatus] = useState<{
//     label: string;
//     confidence: number;
//     is_crying: boolean;
//     status: string;
//     is_moving?: boolean;          // <-- New field from backend
//     time_since_move?: number;     // <-- New field from backend
//   }>({
//     label: "Connecting...",
//     confidence: 0,
//     is_crying: false,
//     status: "Offline",
//     is_moving: false,
//     time_since_move: 0
//   });
//   const [liveError, setLiveError] = useState<string | null>(null);

//   // Poll the backend every 1 second
//   useEffect(() => {
//     const fetchStatus = async () => {
//       try {
//         const res = await fetch('http://localhost:8000/status');
//         if (!res.ok) throw new Error("Backend unreachable");
//         const data = await res.json();
        
//         setLiveStatus(data);
//         setLiveError(null);
//       } catch (err) {
//         setLiveError("Cannot connect to AI Backend. Ensure main_test.py is running.");
//       }
//     };

//     const interval = setInterval(fetchStatus, 1000); // Check every second
//     return () => clearInterval(interval);
//   }, []);

//   // ==========================================
//   // 2. EXISTING: MANUAL 5S MIC TESTER STATE
//   // ==========================================
//   const [isMonitoring, setIsMonitoring] = useState(false);
//   const [result, setResult] = useState<{ label: string; confidence: number } | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);

//   const startRecording = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     const recorder = new MediaRecorder(stream);
//     mediaRecorderRef.current = recorder;
//     const chunks: Blob[] = [];

//     recorder.ondataavailable = (e) => chunks.push(e.data);
//     recorder.onstop = async () => {
//       const blob = new Blob(chunks, { type: 'audio/wav' });
//       await sendToAI(blob);
//     };

//     recorder.start();
//     setIsMonitoring(true);

//     // Record for 5 seconds then stop automatically
//     setTimeout(() => {
//       recorder.stop();
//       stream.getTracks().forEach(t => t.stop());
//       setIsMonitoring(false);
//     }, 5000);
//   };

//   const sendToAI = async (blob: Blob) => {
//     setIsProcessing(true);
//     const formData = new FormData();
//     formData.append('file', blob, 'clip.wav');

//     try {
//       const res = await fetch('http://localhost:8000/predict', {
//         method: 'POST',
//         body: formData,
//       });
//       const data = await res.json();
//       setResult({ label: data.label, confidence: data.confidence });
//     } catch (err) {
//       console.error("AI Server Error:", err);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // ==========================================
//   // RENDER BOTH COMPONENTS
//   // ==========================================
//   return (
//     <div className="space-y-6">
      
//       {/* ─── LIVE AI POLLING DASHBOARD ─── */}
//       <div className={`p-6 rounded-2xl shadow-xl border-2 transition-all duration-500 ${
//         liveStatus.is_crying ? 'bg-red-50 border-red-500 animate-pulse' : 'bg-white border-indigo-100'
//       }`}>
//         <div className="flex justify-between items-center mb-6">
//           <div className="flex items-center space-x-2">
//             <Radio className={liveStatus.status === "Monitoring" ? "text-green-500" : "text-gray-400"} size={20} />
//             <h3 className="font-bold text-gray-800 text-lg">AI Live Monitor</h3>
//           </div>
//           {liveStatus.status === "Monitoring" && (
//             <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
//               LIVE
//             </span>
//           )}
//         </div>

//         {liveError ? (
//           <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
//             <AlertCircle size={18} />
//             <p className="text-sm font-medium">{liveError}</p>
//           </div>
//         ) : (
//           <div className="space-y-4">
            
//             {/* Audio Detection Section */}
//             <div className="flex flex-col items-center justify-center py-6">
//               {liveStatus.is_crying ? (
//                 <div className="text-center mb-4">
//                   <Activity size={56} className="text-red-600 mx-auto mb-2" />
//                   <h2 className="text-3xl font-black text-red-600 tracking-tight">CRYING DETECTED</h2>
//                   <p className="text-red-500 font-bold">{liveStatus.confidence}% Audio Confidence</p>
//                 </div>
//               ) : (
//                 <div className="text-center mb-4">
//                   <ShieldCheck size={56} className="text-green-500 mx-auto mb-2" />
//                   <h2 className="text-2xl font-bold text-gray-800">{liveStatus.label}</h2>
//                   <p className="text-gray-500">Audio System Monitoring</p>
//                 </div>
//               )}
//             </div>

//             {/* NEW: PHYSICAL MOTION TRACKER UI */}
//             <div className={`p-4 rounded-xl border-2 flex items-center justify-between transition-colors ${
//               liveStatus.is_moving ? 'bg-blue-50 border-blue-200' : 'bg-indigo-50 border-indigo-200'
//             }`}>
//               <div className="flex items-center space-x-3">
//                 {liveStatus.is_moving ? (
//                   <div className="p-2 bg-blue-100 text-blue-600 rounded-lg animate-bounce">
//                     <Footprints size={24} />
//                   </div>
//                 ) : (
//                   <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
//                     <Moon size={24} />
//                   </div>
//                 )}
//                 <div>
//                   <h4 className={`font-bold ${liveStatus.is_moving ? 'text-blue-800' : 'text-indigo-800'}`}>
//                     {liveStatus.is_moving ? 'Baby is Moving' : 'Baby is Sleeping / Still'}
//                   </h4>
//                   <p className="text-xs text-gray-500 font-medium">MPU6050 Accelerometer</p>
//                 </div>
//               </div>
//               {!liveStatus.is_moving && liveStatus.time_since_move !== undefined && (
//                 <span className="text-sm font-black text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
//                   Still for {liveStatus.time_since_move}s
//                 </span>
//               )}
//             </div>

//             {/* Audio Confidence Bar */}
//             <div className="bg-gray-50 p-3 rounded-xl mt-4">
//               <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
//                 <span>Audio Sensor Status</span>
//                 <span>{liveStatus.status}</span>
//               </div>
//               <div className="w-full bg-gray-200 h-2 mt-2 rounded-full overflow-hidden">
//                 <div 
//                   className={`h-full transition-all duration-500 ${liveStatus.is_crying ? 'bg-red-500' : 'bg-green-500'}`}
//                   style={{ width: `${liveStatus.confidence}%` }}
//                 ></div>
//               </div>
//             </div>

//           </div>
//         )}

//         <p className="mt-4 text-[10px] text-center text-gray-400 italic">
//           Real-time audio processing enabled via Python Backend
//         </p>
//       </div>

//       {/* ─── MANUAL AI TESTER (Your original active code) ─── */}
//       <div className="p-6 bg-white rounded-2xl shadow-xl border border-indigo-100">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="font-bold text-gray-800">Local AI Tester</h3>
//           {isMonitoring && <Activity className="text-red-500 animate-pulse" />}
//         </div>

//         <button
//           onClick={startRecording}
//           disabled={isMonitoring || isProcessing}
//           className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
//         >
//           {isProcessing ? <Loader2 className="animate-spin" /> : <Mic size={20} />}
//           <span>{isMonitoring ? 'Recording 5s...' : 'Test 5s Sample'}</span>
//         </button>

//         {result && (
//           <div className={`mt-6 p-4 rounded-xl border-2 ${result.label === 'Crying' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
//             <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Result</p>
//             <p className={`text-2xl font-black ${result.label === 'Crying' ? 'text-red-600' : 'text-green-600'}`}>
//               {result.label} ({result.confidence}%)
//             </p>
//           </div>
//         )}
//       </div>

//     </div>
//   );
// }



// creates cry_log in firebasse , 

// import { useState, useRef, useEffect } from 'react';
// import { Mic, Activity, Loader2, ShieldCheck, AlertCircle, Radio, Moon, Footprints, Thermometer } from 'lucide-react';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { db } from '../lib/firebase'; // Ensure this path points to your firebase config

// export default function LocalMonitor() {
  
//   // ==========================================
//   // 1. LIVE AI POLLING MONITOR STATE
//   // ==========================================
//   const [liveStatus, setLiveStatus] = useState<{
//     label: string;
//     confidence: number;
//     is_crying: boolean;
//     status: string;
//     is_moving?: boolean;
//     time_since_move?: number;
//     temperature?: number;
//     music_playing?: boolean; // <-- Python sends this now
//   }>({
//     label: "Connecting...",
//     confidence: 0,
//     is_crying: false,
//     status: "Offline",
//     is_moving: false,
//     time_since_move: 0,
//     temperature: 0,
//     music_playing: false
//   });
  
//   const [liveError, setLiveError] = useState<string | null>(null);
  
//   // Ref to track the *previous* music state so we only log ONCE when it starts
//   const prevMusicPlaying = useRef(false);

//   // Poll the backend every 1 second
//   useEffect(() => {
//     const fetchStatus = async () => {
//       try {
//         const res = await fetch('http://localhost:8000/status');
//         if (!res.ok) throw new Error("Backend unreachable");
//         const data = await res.json();
        
//         setLiveStatus(data);
//         setLiveError(null);
//       } catch (err) {
//         setLiveError("Cannot connect to AI Backend. Ensure main_test.py is running.");
//       }
//     };

//     const interval = setInterval(fetchStatus, 1000); 
//     return () => clearInterval(interval);
//   }, []);

//   // ==========================================
//   // NEW: FIREBASE LOGGING LOGIC
//   // ==========================================
//   useEffect(() => {
//     // If music JUST started playing, we know the 5-sec threshold was reached
//     if (liveStatus.music_playing && !prevMusicPlaying.current) {
//       logCryToFirebase(liveStatus.confidence);
//     }
    
//     // Update the ref for the next polling cycle
//     prevMusicPlaying.current = !!liveStatus.music_playing;
//   }, [liveStatus.music_playing, liveStatus.confidence]);

//   const logCryToFirebase = async (confidence: number) => {
//     try {
//       await addDoc(collection(db, 'cry_log'), {
//         detected_at: new Date().toISOString(),
//         server_timestamp: serverTimestamp(),
//         intensity: confidence,
//         status: 'crying',
//         action_taken: 'lullaby_triggered'
//       });
//       console.log("🔥 Successfully logged prolonged cry event to Firebase!");
//     } catch (err) {
//       console.error("Firestore log error:", err);
//     }
//   };

//   // ==========================================
//   // 2. EXISTING: MANUAL 5S MIC TESTER STATE
//   // ==========================================
//   const [isMonitoring, setIsMonitoring] = useState(false);
//   const [result, setResult] = useState<{ label: string; confidence: number } | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);

//   const startRecording = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     const recorder = new MediaRecorder(stream);
//     mediaRecorderRef.current = recorder;
//     const chunks: Blob[] = [];

//     recorder.ondataavailable = (e) => chunks.push(e.data);
//     recorder.onstop = async () => {
//       const blob = new Blob(chunks, { type: 'audio/wav' });
//       await sendToAI(blob);
//     };

//     recorder.start();
//     setIsMonitoring(true);

//     setTimeout(() => {
//       recorder.stop();
//       stream.getTracks().forEach(t => t.stop());
//       setIsMonitoring(false);
//     }, 5000);
//   };

//   const sendToAI = async (blob: Blob) => {
//     setIsProcessing(true);
//     const formData = new FormData();
//     formData.append('file', blob, 'clip.wav');

//     try {
//       const res = await fetch('http://localhost:8000/predict', {
//         method: 'POST',
//         body: formData,
//       });
//       const data = await res.json();
//       setResult({ label: data.label, confidence: data.confidence });
//     } catch (err) {
//       console.error("AI Server Error:", err);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
      
//       {/* ─── LIVE AI POLLING DASHBOARD ─── */}
//       <div className={`p-6 rounded-2xl shadow-xl border-2 transition-all duration-500 ${
//         liveStatus.is_crying ? 'bg-red-50 border-red-500 animate-pulse' : 'bg-white border-indigo-100'
//       }`}>
//         <div className="flex justify-between items-center mb-6">
//           <div className="flex items-center space-x-2">
//             <Radio className={liveStatus.status === "Monitoring" ? "text-green-500" : "text-gray-400"} size={20} />
//             <h3 className="font-bold text-gray-800 text-lg">AI Live Monitor</h3>
//           </div>
//           {liveStatus.status === "Monitoring" && (
//             <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
//               LIVE
//             </span>
//           )}
//         </div>

//         {liveError ? (
//           <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
//             <AlertCircle size={18} />
//             <p className="text-sm font-medium">{liveError}</p>
//           </div>
//         ) : (
//           <div className="space-y-4">
            
//             {/* Audio Detection Section */}
//             <div className="flex flex-col items-center justify-center py-6">
//               {liveStatus.is_crying ? (
//                 <div className="text-center mb-4">
//                   <Activity size={56} className="text-red-600 mx-auto mb-2" />
//                   <h2 className="text-3xl font-black text-red-600 tracking-tight">CRYING DETECTED</h2>
//                   <p className="text-red-500 font-bold">{liveStatus.confidence}% Audio Confidence</p>
//                   {liveStatus.music_playing && (
//                     <p className="mt-2 text-sm font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full animate-pulse">
//                       🎶 Lullaby Playing
//                     </p>
//                   )}
//                 </div>
//               ) : (
//                 <div className="text-center mb-4">
//                   <ShieldCheck size={56} className="text-green-500 mx-auto mb-2" />
//                   <h2 className="text-2xl font-bold text-gray-800">{liveStatus.label}</h2>
//                   <p className="text-gray-500">Audio System Monitoring</p>
//                 </div>
//               )}
//             </div>

//             {/* PHYSICAL MOTION TRACKER UI */}
//             <div className={`p-4 rounded-xl border-2 flex items-center justify-between transition-colors ${
//               liveStatus.is_moving ? 'bg-blue-50 border-blue-200' : 'bg-indigo-50 border-indigo-200'
//             }`}>
//               <div className="flex items-center space-x-3">
//                 {liveStatus.is_moving ? (
//                   <div className="p-2 bg-blue-100 text-blue-600 rounded-lg animate-bounce">
//                     <Footprints size={24} />
//                   </div>
//                 ) : (
//                   <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
//                     <Moon size={24} />
//                   </div>
//                 )}
//                 <div>
//                   <h4 className={`font-bold ${liveStatus.is_moving ? 'text-blue-800' : 'text-indigo-800'}`}>
//                     {liveStatus.is_moving ? 'Baby is Moving' : 'Baby is Sleeping / Still'}
//                   </h4>
//                   <p className="text-xs text-gray-500 font-medium">MPU6050 Accelerometer</p>
//                 </div>
//               </div>
              
//               <div className="flex flex-col items-end space-y-2">
//                 {/* Temperature Badge */}
//                 {liveStatus.temperature !== undefined && liveStatus.temperature > 0 && (
//                   <span className="flex items-center text-sm font-black text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
//                     <Thermometer size={14} className="mr-1" />
//                     {liveStatus.temperature}°C
//                   </span>
//                 )}
                
//                 {/* Stillness Badge */}
//                 {!liveStatus.is_moving && liveStatus.time_since_move !== undefined && (
//                   <span className="text-sm font-black text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
//                     Still for {liveStatus.time_since_move}s
//                   </span>
//                 )}
//               </div>
//             </div>

//             {/* Audio Confidence Bar */}
//             <div className="bg-gray-50 p-3 rounded-xl mt-4">
//               <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
//                 <span>Audio Sensor Status</span>
//                 <span>{liveStatus.status}</span>
//               </div>
//               <div className="w-full bg-gray-200 h-2 mt-2 rounded-full overflow-hidden">
//                 <div 
//                   className={`h-full transition-all duration-500 ${liveStatus.is_crying ? 'bg-red-500' : 'bg-green-500'}`}
//                   style={{ width: `${liveStatus.confidence}%` }}
//                 ></div>
//               </div>
//             </div>

//           </div>
//         )}

//         <p className="mt-4 text-[10px] text-center text-gray-400 italic">
//           Real-time audio processing enabled via Python Backend
//         </p>
//       </div>

//       {/* ─── MANUAL AI TESTER ─── */}
//       <div className="p-6 bg-white rounded-2xl shadow-xl border border-indigo-100">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="font-bold text-gray-800">Local AI Tester</h3>
//           {isMonitoring && <Activity className="text-red-500 animate-pulse" />}
//         </div>

//         <button
//           onClick={startRecording}
//           disabled={isMonitoring || isProcessing}
//           className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
//         >
//           {isProcessing ? <Loader2 className="animate-spin" /> : <Mic size={20} />}
//           <span>{isMonitoring ? 'Recording 5s...' : 'Test 5s Sample'}</span>
//         </button>

//         {result && (
//           <div className={`mt-6 p-4 rounded-xl border-2 ${result.label === 'Crying' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
//             <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Result</p>
//             <p className={`text-2xl font-black ${result.label === 'Crying' ? 'text-red-600' : 'text-green-600'}`}>
//               {result.label} ({result.confidence}%)
//             </p>
//           </div>
//         )}
//       </div>

//     </div>
//   );
// }





// before adding temp in frontend

// import { useState, useRef, useEffect } from 'react';
// import { Mic, Activity, Loader2, ShieldCheck, AlertCircle, Radio, Moon, Footprints, Thermometer } from 'lucide-react';
// // NEW IMPORTS: getDoc, doc from firestore, and getAuth, onAuthStateChanged from auth
// import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
// import { getAuth, onAuthStateChanged } from 'firebase/auth'; 
// import { db } from '../lib/firebase'; 

// export default function LocalMonitor() {
  
//   // ==========================================
//   // 1. LIVE AI POLLING MONITOR STATE
//   // ==========================================
//   const [liveStatus, setLiveStatus] = useState<{
//     label: string;
//     confidence: number;
//     is_crying: boolean;
//     status: string;
//     is_moving?: boolean;
//     time_since_move?: number;
//     temperature?: number;
//     music_playing?: boolean; 
//   }>({
//     label: "Connecting...",
//     confidence: 0,
//     is_crying: false,
//     status: "Offline",
//     is_moving: false,
//     time_since_move: 0,
//     temperature: 0,
//     music_playing: false
//   });
  
//   const [liveError, setLiveError] = useState<string | null>(null);
  
//   // NEW: State to hold the baby's name
//   const [babyName, setBabyName] = useState<string>("Baby");

//   // Ref to track the *previous* music state so we only log ONCE when it starts
//   const prevMusicPlaying = useRef(false);

//   // Poll the backend every 1 second
//   useEffect(() => {
//     const fetchStatus = async () => {
//       try {
//         const res = await fetch('http://localhost:8000/status');
//         if (!res.ok) throw new Error("Backend unreachable");
//         const data = await res.json();
        
//         setLiveStatus(data);
//         setLiveError(null);
//       } catch (err) {
//         setLiveError("Cannot connect to AI Backend. Ensure main_test.py is running.");
//       }
//     };

//     const interval = setInterval(fetchStatus, 1000); 
//     return () => clearInterval(interval);
//   }, []);

//   // ==========================================
//   // NEW: FETCH BABY NAME ON LOAD
//   // ==========================================
//   useEffect(() => {
//     const auth = getAuth();
    
//     // Listen for the user logging in
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         try {
//           // Fetch the profile document for this user
//           const profileRef = doc(db, 'baby_profiles', user.uid);
//           const profileSnap = await getDoc(profileRef);
          
//           if (profileSnap.exists()) {
//             // Assuming your profile document has a 'name' or 'babyName' field
//             // Adjust 'name' below if your field is called something else (e.g., 'baby_name')
//             const data = profileSnap.data();
//             if (data.name) {
//               setBabyName(data.name);
//             }
//           }
//         } catch (error) {
//           console.error("Error fetching baby profile:", error);
//         }
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   // ==========================================
//   // FIREBASE LOGGING LOGIC
//   // ==========================================
//   useEffect(() => {
//     // If music JUST started playing, we know the 5-sec threshold was reached
//     if (liveStatus.music_playing && !prevMusicPlaying.current) {
//       logCryToFirebase(liveStatus.confidence);
//     }
    
//     // Update the ref for the next polling cycle
//     prevMusicPlaying.current = !!liveStatus.music_playing;
//   }, [liveStatus.music_playing, liveStatus.confidence]);

//   const logCryToFirebase = async (confidence: number) => {
//     try {
//       await addDoc(collection(db, 'cry_log'), {
//         detected_at: new Date().toISOString(),
//         server_timestamp: serverTimestamp(),
//         intensity: confidence,
//         status: 'crying',
//         action_taken: 'lullaby_triggered',
//         child_name: babyName // <-- NEW: Adding the fetched baby name here!
//       });
//       console.log(`🔥 Successfully logged prolonged cry event for ${babyName} to Firebase!`);
//     } catch (err) {
//       console.error("Firestore log error:", err);
//     }
//   };

//   // ==========================================
//   // 2. EXISTING: MANUAL 5S MIC TESTER STATE
//   // ==========================================
//   const [isMonitoring, setIsMonitoring] = useState(false);
//   const [result, setResult] = useState<{ label: string; confidence: number } | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);

//   const startRecording = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     const recorder = new MediaRecorder(stream);
//     mediaRecorderRef.current = recorder;
//     const chunks: Blob[] = [];

//     recorder.ondataavailable = (e) => chunks.push(e.data);
//     recorder.onstop = async () => {
//       const blob = new Blob(chunks, { type: 'audio/wav' });
//       await sendToAI(blob);
//     };

//     recorder.start();
//     setIsMonitoring(true);

//     setTimeout(() => {
//       recorder.stop();
//       stream.getTracks().forEach(t => t.stop());
//       setIsMonitoring(false);
//     }, 5000);
//   };

//   const sendToAI = async (blob: Blob) => {
//     setIsProcessing(true);
//     const formData = new FormData();
//     formData.append('file', blob, 'clip.wav');

//     try {
//       const res = await fetch('http://localhost:8000/predict', {
//         method: 'POST',
//         body: formData,
//       });
//       const data = await res.json();
//       setResult({ label: data.label, confidence: data.confidence });
//     } catch (err) {
//       console.error("AI Server Error:", err);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
      
//       {/* ─── LIVE AI POLLING DASHBOARD ─── */}
//       <div className={`p-6 rounded-2xl shadow-xl border-2 transition-all duration-500 ${
//         liveStatus.is_crying ? 'bg-red-50 border-red-500 animate-pulse' : 'bg-white border-indigo-100'
//       }`}>
//         <div className="flex justify-between items-center mb-6">
//           <div className="flex items-center space-x-2">
//             <Radio className={liveStatus.status === "Monitoring" ? "text-green-500" : "text-gray-400"} size={20} />
//             <h3 className="font-bold text-gray-800 text-lg">AI Live Monitor</h3>
//           </div>
//           {liveStatus.status === "Monitoring" && (
//             <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
//               LIVE
//             </span>
//           )}
//         </div>

//         {liveError ? (
//           <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
//             <AlertCircle size={18} />
//             <p className="text-sm font-medium">{liveError}</p>
//           </div>
//         ) : (
//           <div className="space-y-4">
            
//             {/* Audio Detection Section */}
//             <div className="flex flex-col items-center justify-center py-6">
//               {liveStatus.is_crying ? (
//                 <div className="text-center mb-4">
//                   <Activity size={56} className="text-red-600 mx-auto mb-2" />
//                   <h2 className="text-3xl font-black text-red-600 tracking-tight">CRYING DETECTED</h2>
//                   <p className="text-red-500 font-bold">{liveStatus.confidence}% Audio Confidence</p>
//                   {liveStatus.music_playing && (
//                     <p className="mt-2 text-sm font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full animate-pulse">
//                       🎶 Lullaby Playing for {babyName}
//                     </p>
//                   )}
//                 </div>
//               ) : (
//                 <div className="text-center mb-4">
//                   <ShieldCheck size={56} className="text-green-500 mx-auto mb-2" />
//                   <h2 className="text-2xl font-bold text-gray-800">{liveStatus.label}</h2>
//                   <p className="text-gray-500">Audio System Monitoring</p>
//                 </div>
//               )}
//             </div>

//             {/* PHYSICAL MOTION TRACKER UI */}
//             <div className={`p-4 rounded-xl border-2 flex items-center justify-between transition-colors ${
//               liveStatus.is_moving ? 'bg-blue-50 border-blue-200' : 'bg-indigo-50 border-indigo-200'
//             }`}>
//               <div className="flex items-center space-x-3">
//                 {liveStatus.is_moving ? (
//                   <div className="p-2 bg-blue-100 text-blue-600 rounded-lg animate-bounce">
//                     <Footprints size={24} />
//                   </div>
//                 ) : (
//                   <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
//                     <Moon size={24} />
//                   </div>
//                 )}
//                 <div>
//                   <h4 className={`font-bold ${liveStatus.is_moving ? 'text-blue-800' : 'text-indigo-800'}`}>
//                     {liveStatus.is_moving ? `${babyName} is Moving` : `${babyName} is Sleeping / Still`}
//                   </h4>
//                   <p className="text-xs text-gray-500 font-medium">MPU6050 Accelerometer</p>
//                 </div>
//               </div>
              
//               <div className="flex flex-col items-end space-y-2">
//                 {/* Temperature Badge */}
//                 {liveStatus.temperature !== undefined && liveStatus.temperature > 0 && (
//                   <span className="flex items-center text-sm font-black text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
//                     <Thermometer size={14} className="mr-1" />
//                     {liveStatus.temperature}°C
//                   </span>
//                 )}
                
//                 {/* Stillness Badge */}
//                 {!liveStatus.is_moving && liveStatus.time_since_move !== undefined && (
//                   <span className="text-sm font-black text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
//                     Still for {liveStatus.time_since_move}s
//                   </span>
//                 )}
//               </div>
//             </div>

//             {/* Audio Confidence Bar */}
//             <div className="bg-gray-50 p-3 rounded-xl mt-4">
//               <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
//                 <span>Audio Sensor Status</span>
//                 <span>{liveStatus.status}</span>
//               </div>
//               <div className="w-full bg-gray-200 h-2 mt-2 rounded-full overflow-hidden">
//                 <div 
//                   className={`h-full transition-all duration-500 ${liveStatus.is_crying ? 'bg-red-500' : 'bg-green-500'}`}
//                   style={{ width: `${liveStatus.confidence}%` }}
//                 ></div>
//               </div>
//             </div>

//           </div>
//         )}

//         <p className="mt-4 text-[10px] text-center text-gray-400 italic">
//           Real-time audio processing enabled via Python Backend
//         </p>
//       </div>

//       {/* ─── MANUAL AI TESTER ─── */}
//       <div className="p-6 bg-white rounded-2xl shadow-xl border border-indigo-100">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="font-bold text-gray-800">Local AI Tester</h3>
//           {isMonitoring && <Activity className="text-red-500 animate-pulse" />}
//         </div>

//         <button
//           onClick={startRecording}
//           disabled={isMonitoring || isProcessing}
//           className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
//         >
//           {isProcessing ? <Loader2 className="animate-spin" /> : <Mic size={20} />}
//           <span>{isMonitoring ? 'Recording 5s...' : 'Test 5s Sample'}</span>
//         </button>

//         {result && (
//           <div className={`mt-6 p-4 rounded-xl border-2 ${result.label === 'Crying' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
//             <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Result</p>
//             <p className={`text-2xl font-black ${result.label === 'Crying' ? 'text-red-600' : 'text-green-600'}`}>
//               {result.label} ({result.confidence}%)
//             </p>
//           </div>
//         )}
//       </div>

//     </div>
//   );
// }

import { useState, useRef, useEffect } from 'react';
// import { Mic, Activity, Loader2, ShieldCheck, AlertCircle, Radio, Moon, Footprints, Thermometer, Droplets, TriangleAlert } from 'lucide-react';
import { Mic, Activity, Loader2, ShieldCheck, AlertCircle, Radio, Moon, Footprints, Thermometer, Droplets, AlertTriangle } from 'lucide-react';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; 
import { db } from '../lib/firebase'; 

// SET YOUR TEMPERATURE LIMIT HERE
const MAX_TEMP_ALERT = 30.0; 

export default function LocalMonitor() {
  
  // ==========================================
  // 1. LIVE AI POLLING MONITOR STATE
  // ==========================================
  const [liveStatus, setLiveStatus] = useState<{
    label: string;
    confidence: number;
    is_crying: boolean;
    status: string;
    is_moving?: boolean;
    time_since_move?: number;
    temperature?: number;
    humidity?: number; // <-- Added humidity
    music_playing?: boolean; 
  }>({
    label: "Connecting...",
    confidence: 0,
    is_crying: false,
    status: "Offline",
    is_moving: false,
    time_since_move: 0,
    temperature: 0,
    humidity: 0,
    music_playing: false
  });
  
  const [liveError, setLiveError] = useState<string | null>(null);
  const [babyName, setBabyName] = useState<string>("Baby");
  const prevMusicPlaying = useRef(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('http://localhost:8000/status');
        if (!res.ok) throw new Error("Backend unreachable");
        const data = await res.json();
        
        setLiveStatus(data);
        setLiveError(null);
      } catch (err) {
        setLiveError("Cannot connect to AI Backend. Ensure main.py is running.");
      }
    };

    const interval = setInterval(fetchStatus, 1000); 
    return () => clearInterval(interval);
  }, []);

  // Fetch Baby Name
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profileRef = doc(db, 'baby_profiles', user.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists() && profileSnap.data().name) {
            setBabyName(profileSnap.data().name);
          }
        } catch (error) {
          console.error("Error fetching baby profile:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Logging Cry Event
  useEffect(() => {
    if (liveStatus.music_playing && !prevMusicPlaying.current) {
      logCryToFirebase(liveStatus.confidence);
    }
    prevMusicPlaying.current = !!liveStatus.music_playing;
  }, [liveStatus.music_playing, liveStatus.confidence]);

  const logCryToFirebase = async (confidence: number) => {
    try {
      await addDoc(collection(db, 'cry_log'), {
        detected_at: new Date().toISOString(),
        server_timestamp: serverTimestamp(),
        intensity: confidence,
        status: 'crying',
        action_taken: 'lullaby_triggered',
        child_name: babyName 
      });
    } catch (err) {
      console.error("Firestore log error:", err);
    }
  };

  // ==========================================
  // 2. EXISTING: MANUAL 5S MIC TESTER STATE
  // ==========================================
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [result, setResult] = useState<{ label: string; confidence: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/wav' });
      await sendToAI(blob);
    };

    recorder.start();
    setIsMonitoring(true);

    setTimeout(() => {
      recorder.stop();
      stream.getTracks().forEach(t => t.stop());
      setIsMonitoring(false);
    }, 5000);
  };

  const sendToAI = async (blob: Blob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', blob, 'clip.wav');

    try {
      const res = await fetch('http://localhost:8000/predict', { method: 'POST', body: formData });
      const data = await res.json();
      setResult({ label: data.label, confidence: data.confidence });
    } catch (err) {} finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ─── HIGH TEMPERATURE ALERT BANNER ─── */}
      {liveStatus.temperature !== undefined && liveStatus.temperature > MAX_TEMP_ALERT && (
        <div className="bg-red-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-3">
            <AlertTriangle size={28} />
            <div>
              <h3 className="font-bold text-lg">Temperature Alert!</h3>
              <p className="text-red-100 text-sm">Room is too hot for {babyName} ({liveStatus.temperature}°C).</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── LIVE AI POLLING DASHBOARD ─── */}
      <div className={`p-6 rounded-2xl shadow-xl border-2 transition-all duration-500 ${
        liveStatus.is_crying ? 'bg-red-50 border-red-500 animate-pulse' : 'bg-white border-indigo-100'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Radio className={liveStatus.status === "Monitoring" ? "text-green-500" : "text-gray-400"} size={20} />
            <h3 className="font-bold text-gray-800 text-lg">AI Live Monitor</h3>
          </div>
          {liveStatus.status === "Monitoring" && (
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">LIVE</span>
          )}
        </div>

        {liveError ? (
          <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
            <AlertCircle size={18} />
            <p className="text-sm font-medium">{liveError}</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Audio Detection Section */}
            <div className="flex flex-col items-center justify-center py-6">
              {liveStatus.is_crying ? (
                <div className="text-center mb-4">
                  <Activity size={56} className="text-red-600 mx-auto mb-2" />
                  <h2 className="text-3xl font-black text-red-600 tracking-tight">CRYING DETECTED</h2>
                  <p className="text-red-500 font-bold">{liveStatus.confidence}% Audio Confidence</p>
                  {liveStatus.music_playing && (
                    <p className="mt-2 text-sm font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full animate-pulse">
                      🎶 Lullaby Playing for {babyName}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center mb-4">
                  <ShieldCheck size={56} className="text-green-500 mx-auto mb-2" />
                  <h2 className="text-2xl font-bold text-gray-800">{liveStatus.label}</h2>
                  <p className="text-gray-500">Audio System Monitoring</p>
                </div>
              )}
            </div>

            {/* PHYSICAL MOTION & ENVIRONMENT UI */}
            <div className={`p-4 rounded-xl border-2 flex flex-col md:flex-row items-center justify-between transition-colors gap-4 ${
              liveStatus.is_moving ? 'bg-blue-50 border-blue-200' : 'bg-indigo-50 border-indigo-200'
            }`}>
              
              <div className="flex items-center space-x-3 w-full md:w-auto">
                {liveStatus.is_moving ? (
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg animate-bounce">
                    <Footprints size={24} />
                  </div>
                ) : (
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Moon size={24} />
                  </div>
                )}
                <div>
                  <h4 className={`font-bold ${liveStatus.is_moving ? 'text-blue-800' : 'text-indigo-800'}`}>
                    {liveStatus.is_moving ? `${babyName} is Moving` : `${babyName} is Sleeping`}
                  </h4>
                  <div className="flex space-x-2 mt-1">
                    {!liveStatus.is_moving && liveStatus.time_since_move !== undefined && (
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                        {liveStatus.time_since_move}s
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Climate Data Badges */}
              <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                {liveStatus.temperature !== undefined && liveStatus.temperature > 0 && (
                  <span className={`flex items-center text-sm font-black px-3 py-1 rounded-full ${
                    liveStatus.temperature > MAX_TEMP_ALERT ? 'text-white bg-red-500' : 'text-orange-600 bg-orange-100'
                  }`}>
                    <Thermometer size={14} className="mr-1" />
                    {liveStatus.temperature}°C
                  </span>
                )}
                
                {liveStatus.humidity !== undefined && liveStatus.humidity > 0 && (
                  <span className="flex items-center text-sm font-black text-cyan-700 bg-cyan-100 px-3 py-1 rounded-full">
                    <Droplets size={14} className="mr-1" />
                    {liveStatus.humidity}%
                  </span>
                )}
              </div>
            </div>

            {/* Audio Confidence Bar */}
            <div className="bg-gray-50 p-3 rounded-xl mt-4">
              <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                <span>Audio Sensor Status</span>
                <span>{liveStatus.status}</span>
              </div>
              <div className="w-full bg-gray-200 h-2 mt-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${liveStatus.is_crying ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${liveStatus.confidence}%` }}
                ></div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ─── MANUAL AI TESTER ─── */}
      <div className="p-6 bg-white rounded-2xl shadow-xl border border-indigo-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-800">Local AI Tester</h3>
          {isMonitoring && <Activity className="text-red-500 animate-pulse" />}
        </div>
        <button
          onClick={startRecording}
          disabled={isMonitoring || isProcessing}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isProcessing ? <Loader2 className="animate-spin" /> : <Mic size={20} />}
          <span>{isMonitoring ? 'Recording 5s...' : 'Test 5s Sample'}</span>
        </button>
        {result && (
          <div className={`mt-6 p-4 rounded-xl border-2 ${result.label === 'Crying' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Result</p>
            <p className={`text-2xl font-black ${result.label === 'Crying' ? 'text-red-600' : 'text-green-600'}`}>
              {result.label} ({result.confidence}%)
            </p>
          </div>
        )}
      </div>

    </div>
  );
}