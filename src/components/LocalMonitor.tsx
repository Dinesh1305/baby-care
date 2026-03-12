import { useEffect, useRef, useState } from 'react';
import { useTFLite } from '../hooks/useTFLite';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Mic, MicOff, Activity } from 'lucide-react';

export default function LocalMonitor() {
  const { model, isLoading, error } = useTFLite('/cry_detection_model.tflite');
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number>();

  const startMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioCtx = new window.AudioContext();
      audioContextRef.current = audioCtx;
      
      const source = audioCtx.createMediaStreamSource(stream);
      const analyzer = audioCtx.createAnalyser();
      analyzer.fftSize = 256; 
      
      source.connect(analyzer);
      analyzerRef.current = analyzer;
      
      setIsMonitoring(true);
      processAudio();
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopMonitoring = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    setIsMonitoring(false);
  };

  const processAudio = async () => {
    if (!model || !analyzerRef.current || !window.tf) return;

    const dataArray = new Float32Array(analyzerRef.current.frequencyBinCount);
    analyzerRef.current.getFloatFrequencyData(dataArray);

    // Using window.tf to bypass the NPM package
    const inputTensor = window.tf.tensor(dataArray).reshape([1, 128]); 

    try {
      const outputTensor = model.predict(inputTensor);
      const result = await outputTensor.data();
      
      const cryProbability = result[0];

      if (cryProbability > 0.85) {
        handleCryDetected(cryProbability);
      }

      inputTensor.dispose();
      outputTensor.dispose();

    } catch (err) {
      console.error("Inference error:", err);
    }

    requestRef.current = requestAnimationFrame(processAudio);
  };

  const handleCryDetected = async (probability: number) => {
    try {
      await addDoc(collection(db, 'cry_events'), {
        detected_at: new Date().toISOString(),
        intensity: Math.round(probability * 100),
        status: 'crying',
        duration: 0 
      });
      console.log("Cry detected and logged!");
    } catch (err) {
      console.error("Error logging cry to Firestore:", err);
    }
  };

  useEffect(() => {
    return () => stopMonitoring();
  }, []);

  if (isLoading) return <div className="p-4 text-gray-500 animate-pulse">Loading AI Model...</div>;
  if (error) return <div className="p-4 text-red-500">Failed to load AI Model: {error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-4 border-indigo-100 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">On-Device AI Monitor</h2>
        <div className={`p-3 rounded-full ${isMonitoring ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
          <Activity className="w-6 h-6" />
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-6">
        Uses local TFLite model to analyze audio in the browser without sending raw audio to the server.
      </p>

      <button
        onClick={isMonitoring ? stopMonitoring : startMonitoring}
        className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors text-white font-medium ${
          isMonitoring ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'
        }`}
      >
        {isMonitoring ? (
          <>
            <MicOff className="w-5 h-5" />
            <span>Stop Monitoring</span>
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
            <span>Start AI Monitor</span>
          </>
        )}
      </button>
    </div>
  );
}