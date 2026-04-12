'use client';

import { useState, useRef } from 'react';
import { QUESTIONS } from '@/lib/questions';
import { useRouter } from 'next/navigation';

const PHOTO_PROMPTS = [
  "Show us you.",
  "Show us this side of you.",
  "Show us home.",
  "Show us your passion.",
  "Show us the surprise.",
];

export default function CreateProfile() {
  const router = useRouter();
  const [step, setStep] = useState<'info' | 'questions' | 'done'>('info');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [hometown, setHometown] = useState('');
  const [email, setEmail] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [recordings, setRecordings] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPhotoStep, setShowPhotoStep] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setHasRecording(true);
        stream.getTracks().forEach(t => t.stop());

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setRecordings(prev => {
            const updated = [...prev];
            updated[currentQuestion] = base64;
            return updated;
          });
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setHasRecording(false);
      setAudioUrl(null);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 15) {
            stopRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      alert('Please allow microphone access to record your story.');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64);
      setPhotos(prev => {
        const updated = [...prev];
        updated[currentQuestion] = base64;
        return updated;
      });
    };
    reader.readAsDataURL(file);
  }

  function proceedToNextQuestion() {
    setShowPhotoStep(false);
    setPhotoPreview(null);
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setHasRecording(false);
      setAudioUrl(null);
      setRecordingTime(0);
    } else {
      saveProfile();
    }
  }

  function goToPhotoStep() {
    setShowPhotoStep(true);
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          username: username.toLowerCase().replace(/[^a-z0-9]/g, ''),
          hometown,
          email,
          recordings,
          photos,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/${data.username}`);
      } else {
        alert(data.error || 'Something went wrong. Try again.');
        setSaving(false);
      }
    } catch {
      alert('Something went wrong. Try again.');
      setSaving(false);
    }
  }

  // INFO STEP
  if (step === 'info') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md">
          <h1 className="font-[family-name:var(--font-instrument-serif)] text-4xl text-[var(--color-text-light)] mb-2 text-center">
            Create your profile
          </h1>
          <p className="text-[var(--color-text-dim)] text-sm text-center mb-10">
            Five questions. Two minutes. Now they&apos;ll know who you are.
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium tracking-wider uppercase text-[var(--color-text-dim)] mb-2">Your name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Maria Gutierrez"
                className="w-full bg-transparent border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-[var(--color-text-light)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium tracking-wider uppercase text-[var(--color-text-dim)] mb-2">Username</label>
              <div className="flex items-center border border-[rgba(255,255,255,0.1)] rounded-xl overflow-hidden focus-within:border-[var(--color-accent)] transition-colors">
                <span className="pl-4 text-[var(--color-text-dim)] text-sm">puentering.com/</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                  placeholder="maria"
                  className="flex-1 bg-transparent px-1 py-3 text-[var(--color-text-light)] placeholder:text-[var(--color-text-dim)] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium tracking-wider uppercase text-[var(--color-text-dim)] mb-2">Where are you from?</label>
              <input
                type="text"
                value={hometown}
                onChange={e => setHometown(e.target.value)}
                placeholder="Guayaquil, Ecuador"
                className="w-full bg-transparent border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-[var(--color-text-light)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium tracking-wider uppercase text-[var(--color-text-dim)] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="maria@email.com"
                className="w-full bg-transparent border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-[var(--color-text-light)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (!name || !username || !hometown) {
                alert('Please fill in your name, username, and hometown.');
                return;
              }
              setStep('questions');
            }}
            className="w-full mt-8 bg-[var(--color-accent)] text-white py-3.5 rounded-full text-sm font-medium tracking-wide hover:bg-[var(--color-accent-soft)] transition-all"
          >
            Start recording
          </button>
        </div>
      </main>
    );
  }

  // PHOTO STEP (after recording)
  if (step === 'questions' && showPhotoStep) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          {/* Progress */}
          <div className="flex gap-2 justify-center mb-10">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-1 w-8 rounded-full transition-colors ${
                  i < currentQuestion ? 'bg-[var(--color-accent)]' :
                  i === currentQuestion ? 'bg-[var(--color-text-light)]' :
                  'bg-[rgba(255,255,255,0.1)]'
                }`}
              />
            ))}
          </div>

          <p className="text-xs font-medium tracking-wider uppercase text-[var(--color-accent)] mb-4">
            Add a photo
          </p>

          <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl text-[var(--color-text-light)] mb-8 leading-tight">
            {PHOTO_PROMPTS[currentQuestion]}
          </h2>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelect}
            className="hidden"
          />

          {!photoPreview ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-48 h-48 rounded-2xl border-2 border-dashed border-[rgba(255,255,255,0.15)] hover:border-[var(--color-accent)] transition-colors flex flex-col items-center justify-center mx-auto gap-3 group"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-dim)] group-hover:text-[var(--color-accent)] transition-colors">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span className="text-[var(--color-text-dim)] text-sm group-hover:text-[var(--color-accent)] transition-colors">
                Choose a photo
              </span>
            </button>
          ) : (
            <div className="relative mx-auto w-64">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-64 h-64 object-cover rounded-2xl border border-[rgba(255,255,255,0.1)]"
              />
              <button
                onClick={() => {
                  setPhotoPreview(null);
                  setPhotos(prev => {
                    const updated = [...prev];
                    updated[currentQuestion] = '';
                    return updated;
                  });
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-sm hover:bg-black/80 transition-colors"
              >
                x
              </button>
            </div>
          )}

          <div className="flex gap-3 justify-center mt-8">
            <button
              onClick={proceedToNextQuestion}
              className="px-6 py-2.5 rounded-full text-sm text-[var(--color-text-dim)] border border-[rgba(255,255,255,0.1)] hover:border-[var(--color-text-dim)] transition-colors"
            >
              {photoPreview ? 'Skip photo' : 'Skip'}
            </button>
            {photoPreview && (
              <button
                onClick={proceedToNextQuestion}
                disabled={saving}
                className="px-6 py-2.5 rounded-full text-sm bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-soft)] transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : currentQuestion < QUESTIONS.length - 1 ? 'Next question' : 'Finish'}
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  // QUESTIONS STEP (recording)
  if (step === 'questions') {
    const q = QUESTIONS[currentQuestion];
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          {/* Progress */}
          <div className="flex gap-2 justify-center mb-10">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-1 w-8 rounded-full transition-colors ${
                  i < currentQuestion ? 'bg-[var(--color-accent)]' :
                  i === currentQuestion ? 'bg-[var(--color-text-light)]' :
                  'bg-[rgba(255,255,255,0.1)]'
                }`}
              />
            ))}
          </div>

          <p className="text-xs font-medium tracking-wider uppercase text-[var(--color-accent)] mb-4">
            Question {currentQuestion + 1} of {QUESTIONS.length}
          </p>

          <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl text-[var(--color-text-light)] mb-3 leading-tight">
            {q.prompt}
          </h2>

          <p className="text-[var(--color-text-dim)] text-sm mb-10 italic">
            &quot;{q.placeholder}&quot;
          </p>

          {/* Recording UI */}
          <div className="mb-8">
            {!isRecording && !hasRecording && (
              <button
                onClick={startRecording}
                className="w-20 h-20 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-all flex items-center justify-center mx-auto hover:scale-105"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </button>
            )}

            {isRecording && (
              <div>
                <button
                  onClick={stopRecording}
                  className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-400 transition-all flex items-center justify-center mx-auto animate-pulse"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                </button>
                <p className="text-[var(--color-text-dim)] text-sm mt-4">
                  {recordingTime}s / 15s
                </p>
                <div className="w-48 h-1 bg-[rgba(255,255,255,0.1)] rounded-full mx-auto mt-2">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{ width: `${(recordingTime / 15) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {hasRecording && audioUrl && (
              <div>
                <audio controls src={audioUrl} className="mx-auto mb-4" />
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setHasRecording(false);
                      setAudioUrl(null);
                      setRecordingTime(0);
                    }}
                    className="px-6 py-2.5 rounded-full text-sm text-[var(--color-text-dim)] border border-[rgba(255,255,255,0.1)] hover:border-[var(--color-text-dim)] transition-colors"
                  >
                    Re-record
                  </button>
                  <button
                    onClick={goToPhotoStep}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-full text-sm bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-soft)] transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Add a photo'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {!isRecording && !hasRecording && (
            <p className="text-[var(--color-text-dim)] text-xs">
              Tap the microphone and speak for up to 15 seconds
            </p>
          )}
        </div>
      </main>
    );
  }

  return null;
}
