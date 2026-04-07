// src/components/Profile.tsx
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

// ─── CUTE DRINKING BABY ANIMATION (Side Profile - Bald & Pink Dress) ────────
const AnimatedDrinkingBaby = () => (
  <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
    <style>{`
      @keyframes drinkTilt {
        0%, 100% { transform: translate(82px, 60px) rotate(-65deg); }
        50% { transform: translate(82px, 60px) rotate(-58deg); }
      }
      @keyframes cheekSuck {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(0.85); }
      }
      @keyframes floatHeart {
        0% { opacity: 0; transform: translateY(0) scale(0.5); }
        50% { opacity: 1; }
        100% { opacity: 0; transform: translateY(-25px) scale(1.2); }
      }
      @keyframes blink {
        0%, 96%, 100% { transform: scaleY(1); }
        98% { transform: scaleY(0.1); }
      }
      
      .animate-bottle { animation: drinkTilt 1.5s ease-in-out infinite; }
      .animate-cheeks { animation: cheekSuck 1.5s ease-in-out infinite; transform-origin: 70px 60px; }
      .animate-heart-1 { animation: floatHeart 2.5s ease-in infinite 0s; }
      .animate-heart-2 { animation: floatHeart 3s ease-in infinite 1.2s; }
      .animate-blink { animation: blink 4s infinite; transform-origin: 73px 51px; }
    `}</style>

    <svg viewBox="0 0 140 140" className="w-full h-full drop-shadow-sm overflow-visible">
      {/* Background Shadow */}
      <ellipse cx="70" cy="130" rx="45" ry="6" fill="#e2e8f0" opacity="0.8" />

      {/* ── BODY (Pink Dress - Side profile) ── */}
      <g>
        {/* Dress Base */}
        <path d="M 42 78 Q 20 100 25 130 L 85 130 Q 95 100 75 80 Z" fill="#f472b6" />
        {/* Dress frills at the bottom edge */}
        <path d="M 25 130 Q 35 125 40 130 T 55 130 T 70 130 T 85 130" fill="none" stroke="#f472b6" strokeWidth="4" strokeLinecap="round" />
        {/* Soft pink collar */}
        <path d="M 45 78 Q 60 85 75 78 Z" fill="#fbcfe8" />
      </g>

      {/* ── HEAD & FACE (Skin - Bald) ── */}
      <g>
        {/* Skull */}
        <circle cx="55" cy="50" r="30" fill="#ffe0d2" />
        {/* Jaw/Lower face */}
        <ellipse cx="68" cy="60" rx="16" ry="18" fill="#ffe0d2" />
        {/* Nose bump */}
        <circle cx="84" cy="53" r="4.5" fill="#ffe0d2" />
        {/* Upper lip */}
        <circle cx="85" cy="59" r="3" fill="#ffe0d2" />
        {/* Chin */}
        <circle cx="81" cy="67" r="5" fill="#ffe0d2" />
      </g>

      {/* ── EAR ── */}
      <g>
        <circle cx="48" cy="60" r="6.5" fill="#ffc2a8" />
        <path d="M 45 58 Q 48 60 48 63" fill="none" stroke="#d99f87" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* ── EYE (Big Blue Eye looking down) ── */}
      <g className="animate-blink">
        <ellipse cx="73" cy="51" rx="4.5" ry="6" fill="#ffffff" transform="rotate(15 73 51)" />
        <circle cx="75" cy="52" r="3" fill="#3b82f6" />
        <circle cx="75.5" cy="52.5" r="1.5" fill="#0f172a" />
        <circle cx="74" cy="51" r="1" fill="#ffffff" />
        {/* Eyelash/Lid */}
        <path d="M 67 46 Q 73 43 79 47" fill="none" stroke="#3e2723" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* ── CHEEK ── */}
      <circle cx="70" cy="60" r="5.5" fill="#ffbfa8" opacity="0.6" className="animate-cheeks" />

      {/* ── ARM (Pink Sleeve) ── */}
      <g>
        <path d="M 50 85 Q 75 105 105 71" fill="none" stroke="#f472b6" strokeWidth="12" strokeLinecap="round" />
        <path d="M 50 85 Q 75 105 105 71" fill="none" stroke="#fbcfe8" strokeWidth="2" strokeDasharray="4 2" strokeLinecap="round" opacity="0.5" />
      </g>

      {/* ── BOTTLE & HAND (Animated) ── */}
      <g className="animate-bottle">
        
        {/* Nipple pointing into mouth */}
        <path d="M -2 -1 Q 0 -8 4 -1 Z" fill="#f8fafc" opacity="0.9" />
        
        {/* Bottle Ring (White plastic base for nipple) */}
        <path d="M -8 0 L 8 0 L 6 6 L -6 6 Z" fill="#ffffff" />
        
        {/* Mason Jar Rim (Silver/Grey) */}
        <rect x="-10" y="6" width="20" height="4" rx="1" fill="#cbd5e1" />
        
        {/* Jar Body (Wide Glass) */}
        <rect x="-14" y="10" width="28" height="38" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
        
        {/* Milk Inside */}
        <path d="M -12 25 L 12 25 L 12 40 Q 12 46 8 46 L -8 46 Q -12 46 -12 40 Z" fill="#ffffff" />
        
        {/* Hand wrapping over the bottle */}
        <circle cx="0" cy="26" r="8" fill="#ffe0d2" />
        
        {/* Cute little finger curves */}
        <path d="M -6 23 Q 0 19 6 23" fill="none" stroke="#ffc2a8" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M -6 28 Q 0 24 6 28" fill="none" stroke="#ffc2a8" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>

    {/* Floating Hearts of Happiness */}
    <div className="absolute top-2 right-4 animate-heart-1 text-pink-400 drop-shadow-sm text-2xl">❤️</div>
    <div className="absolute top-10 left-2 animate-heart-2 text-pink-300 drop-shadow-sm text-lg">❤️</div>
  </div>
);

// ─── MAIN PROFILE COMPONENT ─────────────────────────────────────────────────
export default function Profile() {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('not-specified');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  // Fetch existing profile data when the page loads
  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, 'baby_profiles', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setDob(data.dob || '');
          setGender(data.gender || 'not-specified');
        }
        setStatus('idle');
      } catch (error) {
        console.error("Error fetching profile:", error);
        setStatus('idle');
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setStatus('loading');
    try {
      // Save data to Firestore using the User's ID as the document ID
      await setDoc(doc(db, 'baby_profiles', auth.currentUser.uid), {
        name,
        dob,
        gender,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setStatus('success');
      setMessage('Baby details saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to save profile');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* ── Animated Header Banner ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400"></div>
          <div className="text-center md:text-left z-10">
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-2 tracking-tight">
              Baby Profile
            </h1>
            <p className="text-gray-500 font-medium bg-indigo-50 inline-block px-4 py-1.5 rounded-full">
              Manage your baby's important details
            </p>
          </div>
          <div className="mt-6 md:mt-0 z-10 bg-pink-50/50 rounded-full p-2 border-4 border-white shadow-sm">
            <AnimatedDrinkingBaby />
          </div>
        </div>

        {/* ── Form Card ── */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-50">
          <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gray-100">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Basic Information</h2>
          </div>

          {status === 'success' && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 mb-6 border border-green-100 shadow-sm animate-pulse">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <p className="font-medium">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-6 border border-red-100 shadow-sm">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <p className="font-medium">{message}</p>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Baby's Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                placeholder="Enter your baby's name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="not-specified">Not Specified</option>
                  <option value="boy">Boy</option>
                  <option value="girl">Girl</option>
                </select>
              </div>
            </div>

            <div className="pt-8 mt-4">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Save className="w-5 h-5" />
                {status === 'loading' ? 'Saving Data...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}