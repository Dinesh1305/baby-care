// src/components/LocalMonitor.tsx
import { useRef, useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Mic, MicOff, Activity, CheckCircle2, AlertTriangle, FileAudio, Play, Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:8000'; // Point this to your FastAPI backend

interface SessionResult {
  cryFramesDetected: number;
  maxIntensity: number;
  durationSeconds: number;
}

export default function LocalMonitor() {
  // States
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitorMode, setMonitorMode] = useState<'mic' | 'file' | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  
  // Media Refs
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  // Session Tracking Refs
  const startTimeRef = useRef<number>(0);
  const lastLogTimeRef = useRef<number>(0);
  const sessionStatsRef = useRef({ frames: 0, maxProb: 0 });

  const resetSession = () => {
    startTimeRef.current = Date.now();
    sessionStatsRef.current = { frames: 0, maxProb: 0 };
    setSessionResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // --- API COMMUNICATION ---
  const sendAudioToAPI = async (audioData: Blob | File, filename: string) => {
    const formData = new FormData();
    formData.append('file', audioData, filename);

    try {
      const response = await fetch(`${API_URL}/predict-media`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();

      if (data.success && data.ai_analysis) {
        const { cry_probability, is_crying } = data.ai_analysis;
        
        // Update max probability
        if (cry_probability > sessionStatsRef.current.maxProb) {
          sessionStatsRef.current.maxProb = cry_probability;
        }

        if (is_crying) {
          sessionStatsRef.current.frames += 1;
          handleCryDetected(cry_probability);
        }
      }
    } catch (err) {
      console.error("Error communicating with AI backend:", err);
    }
  };

  // --- LIVE MIC MONITORING ---
  const startMicMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Use MediaRecorder to capture audio chunks
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          await sendAudioToAPI(e.data, 'mic_chunk.webm');
        }
      };

      resetSession();
      setMonitorMode('mic');
      setIsMonitoring(true);
      
      // Record in 5-second intervals and fire the ondataavailable event
      mediaRecorder.start(5000); 
    } catch (err) {
      console.error("Error accessing mic:", err);
    }
  };

  // --- FILE TESTING ---
  const startFileMonitoring = async () => {
    if (!selectedFile) return;
    
    resetSession();
    setMonitorMode('file');
    setIsMonitoring(true);
    setIsProcessingFile(true);

    // Send the whole file to the backend
    await sendAudioToAPI(selectedFile, selectedFile.name);

    setIsProcessingFile(false);
    stopMonitoring();
  };

  const stopMonitoring = () => {
    if (!isMonitoring) return;

    if (monitorMode === 'mic') {
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
    }
    
    setIsMonitoring(false);
    setMonitorMode(null);

    const durationSecs = Math.round((Date.now() - startTimeRef.current) / 1000);
    setSessionResult({
      cryFramesDetected: sessionStatsRef.current.frames,
      maxIntensity: Math.round(sessionStatsRef.current.maxProb * 100),
      durationSeconds: durationSecs
    });
  };

  // --- FIREBASE LOGGING ---
  const handleCryDetected = async (probability: number) => {
    const now = Date.now();
    if (now - lastLogTimeRef.current < 5000) return; // 5-sec cooldown
    
    lastLogTimeRef.current = now;

    try {
      await addDoc(collection(db, 'cry_events'), {
        detected_at: new Date().toISOString(),
        intensity: Math.round(probability * 100),
        status: 'crying',
        duration: 0 
      });
    } catch (err) {
      console.error("Error logging cry:", err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-4 border-indigo-100 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Cloud AI Monitor</h2>
        <div className={`p-3 rounded-full ${isMonitoring ? 'bg-green-100 text-green-600 animate-pulse' : 'bg-gray-100 text-gray-600'}`}>
          <Activity className="w-6 h-6" />
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-6">
        Streams audio to your FastAPI backend for analysis.
      </p>

      {/* Mic Controls */}
      <button
        onClick={isMonitoring && monitorMode === 'mic' ? stopMonitoring : startMicMonitoring}
        disabled={isMonitoring && monitorMode === 'file'}
        className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors text-white font-medium mb-6 ${
          isMonitoring && monitorMode === 'mic' 
            ? 'bg-red-500 hover:bg-red-600 shadow-lg' 
            : 'bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed'
        }`}
      >
        {isMonitoring && monitorMode === 'mic' ? (
          <><MicOff className="w-5 h-5" /> <span>Stop Mic Monitor</span></>
        ) : (
          <><Mic className="w-5 h-5" /> <span>Start Live Mic Monitor</span></>
        )}
      </button>

      {/* File Upload Controls */}
      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <FileAudio className="w-4 h-4 mr-2" /> 
          Test with Audio File
        </h3>
        
        <input 
          type="file" 
          accept="audio/*" 
          onChange={handleFileUpload}
          disabled={isMonitoring}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mb-4 disabled:opacity-50 cursor-pointer"
        />
        
        {selectedFile && (
          <button
            onClick={isMonitoring && monitorMode === 'file' ? stopMonitoring : startFileMonitoring}
            disabled={isMonitoring && monitorMode === 'mic'}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors text-white font-medium ${
              isMonitoring && monitorMode === 'file' 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed'
            }`}
          >
            {isProcessingFile ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> <span>Analyzing in Cloud...</span></>
            ) : isMonitoring && monitorMode === 'file' ? (
              <><MicOff className="w-4 h-4" /> <span>Stop Test</span></>
            ) : (
              <><Play className="w-4 h-4" /> <span>Send File to API</span></>
            )}
          </button>
        )}
      </div>

      {/* Session Results */}
      {!isMonitoring && sessionResult && !isProcessingFile && (
        <div className={`mt-6 p-4 rounded-lg border-2 ${sessionResult.cryFramesDetected > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center space-x-2">
            {sessionResult.cryFramesDetected > 0 ? (
              <><AlertTriangle className="w-5 h-5 text-red-500" /> <span>Activity Detected</span></>
            ) : (
              <><CheckCircle2 className="w-5 h-5 text-green-500" /> <span>Peaceful Session</span></>
            )}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-gray-500">Duration</p>
              <p className="font-semibold text-gray-800">{sessionResult.durationSeconds}s</p>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-gray-500">Max Intensity</p>
              <p className="font-semibold text-gray-800">{sessionResult.maxIntensity}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}