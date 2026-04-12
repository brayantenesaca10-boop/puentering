'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { QUESTIONS } from '@/lib/questions';

interface ProfileData {
  user: {
    name: string;
    username: string;
    hometown: string;
    photo_url: string | null;
    created_at: string;
  };
  voice_answers: {
    question_index: number;
    audio_data: string;
    transcript: string | null;
    photo_data: string | null;
  }[];
  connection_count: number;
}

// Passion section icons/colors for each question
const PASSION_STYLES = [
  { color: '#B05C2F', bg: 'rgba(176, 92, 47, 0.08)', icon: '👋', sectionTitle: 'Introduction' },
  { color: '#5B8C6A', bg: 'rgba(91, 140, 106, 0.08)', icon: '✨', sectionTitle: 'The Hidden Side' },
  { color: '#8B6914', bg: 'rgba(139, 105, 20, 0.08)', icon: '🏠', sectionTitle: 'A Taste of Home' },
  { color: '#6B7AA1', bg: 'rgba(107, 122, 161, 0.08)', icon: '🔥', sectionTitle: 'What Sets Me on Fire' },
  { color: '#9B5E8C', bg: 'rgba(155, 94, 140, 0.08)', icon: '💎', sectionTitle: 'The Surprise' },
];

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storyStarted, setStoryStarted] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [showConnect, setShowConnect] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [connected, setConnected] = useState(false);
  const [matches, setMatches] = useState<string[]>([]);
  const [connecting, setConnecting] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    fetch(`/api/profile?username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setProfile(data);
        setLoading(false);
      })
      .catch(() => { setError('Could not load profile.'); setLoading(false); });
  }, [username]);

  // Intersection observer for scroll animations
  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      const idx = Number(entry.target.getAttribute('data-section'));
      if (entry.isIntersecting && !isNaN(idx)) {
        setVisibleSections(prev => new Set([...prev, idx]));
      }
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });
    sectionRefs.current.forEach(ref => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, [storyStarted, profile, observerCallback]);

  function playAudio(audioData: string, index: number) {
    if (audioRef.current) { audioRef.current.pause(); }
    const audio = new Audio(audioData);
    audioRef.current = audio;
    setPlayingIndex(index);
    audio.onended = () => setPlayingIndex(null);
    audio.play();
  }

  function startStory() {
    setStoryStarted(true);
    // Auto-play the introduction after a short delay
    setTimeout(() => {
      if (profile?.voice_answers[0]) {
        playAudio(profile.voice_answers[0].audio_data, 0);
      }
    }, 800);
  }

  async function handleConnect() {
    if (!visitorName) return;
    setConnecting(true);
    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileUsername: username, visitorName, visitorEmail, visitorPhone }),
      });
      const data = await res.json();
      if (data.success) { setConnected(true); setMatches(data.matches || []); }
    } catch { alert('Something went wrong.'); }
    setConnecting(false);
  }

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#B05C2F] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  // Not found
  if (error || !profile) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-[family-name:var(--font-instrument-serif)] text-3xl text-[#F5F0EB] mb-4">Profile not found</h1>
        <p className="text-[#8A8580]">This person hasn&apos;t created their profile yet.</p>
      </main>
    );
  }

  // Connected state
  if (connected) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#B05C2F] flex items-center justify-center mb-8">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="font-[family-name:var(--font-instrument-serif)] text-4xl text-[#F5F0EB] mb-3">
          Connected with {profile.user.name.split(' ')[0]}
        </h1>
        <p className="text-[#8A8580] mb-10 text-lg font-light">Now they know who you are too.</p>

        {matches.length > 0 && (
          <div className="bg-[rgba(176,92,47,0.06)] border border-[rgba(176,92,47,0.15)] rounded-3xl p-8 max-w-sm w-full mb-8">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#B05C2F] mb-4">What connects you</p>
            {matches.map((match, i) => (
              <p key={i} className="text-[#F5F0EB] text-base mb-2 font-light">{match}</p>
            ))}
          </div>
        )}

        <a href="https://puentering.com" className="text-[#B05C2F] text-sm hover:underline mt-4">
          Want your own ring? Get Puente
        </a>
      </main>
    );
  }

  // HERO: "Hear my story" gate
  if (!storyStarted) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        {/* Warm glow behind avatar */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(176,92,47,0.3) 0%, transparent 60%)' }} />

        <div className="relative z-10">
          {/* Avatar */}
          {profile.voice_answers[0]?.photo_data ? (
            <img src={profile.voice_answers[0].photo_data} alt={profile.user.name} className="w-28 h-28 rounded-full object-cover mx-auto mb-8 shadow-2xl shadow-[rgba(176,92,47,0.3)] border-2 border-[rgba(176,92,47,0.3)]" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#B05C2F] to-[#8B4513] flex items-center justify-center mx-auto mb-8 text-white font-[family-name:var(--font-instrument-serif)] text-4xl shadow-2xl shadow-[rgba(176,92,47,0.3)]">
              {profile.user.name.charAt(0)}
            </div>
          )}

          <h1 className="font-[family-name:var(--font-instrument-serif)] text-5xl md:text-6xl text-[#F5F0EB] mb-3">
            {profile.user.name}
          </h1>
          <p className="text-[#8A8580] text-lg font-light mb-2">{profile.user.hometown}</p>
          <p className="text-[#8A8580] text-sm mb-12">
            {Number(profile.connection_count)} connection{Number(profile.connection_count) !== 1 ? 's' : ''}
          </p>

          {/* Hear my story button */}
          <button
            onClick={startStory}
            className="group relative inline-flex items-center gap-3 bg-[#B05C2F] text-white px-10 py-4 rounded-full text-base font-medium tracking-wide hover:bg-[#C97A4F] transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[rgba(176,92,47,0.3)]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="group-hover:scale-110 transition-transform">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Hear my story
          </button>

          <p className="text-[#8A8580] text-xs mt-6 opacity-60">Tap to listen</p>
        </div>

        {/* Puente watermark */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <a href="https://puentering.com" className="font-[family-name:var(--font-instrument-serif)] text-sm text-[rgba(255,255,255,0.15)] hover:text-[#B05C2F] transition-colors">
            Puente
          </a>
        </div>
      </main>
    );
  }

  // THE FULL STORY PROFILE
  return (
    <main className="min-h-screen bg-[#0A0A0A]">

      {/* Sticky header */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[rgba(10,10,10,0.9)] backdrop-blur-xl">
        <span className="font-[family-name:var(--font-instrument-serif)] text-[#F5F0EB] text-lg">{profile.user.name.split(' ')[0]}</span>
        <button
          onClick={() => setShowConnect(true)}
          className="text-xs font-medium tracking-wider uppercase bg-[#B05C2F] text-white px-5 py-2 rounded-full hover:bg-[#C97A4F] transition-colors"
        >
          Connect
        </button>
      </nav>

      {/* Hero section with name and intro playing */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center pt-20 pb-16 relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(176,92,47,0.4) 0%, transparent 60%)' }} />

        <div className="relative z-10">
          {profile.voice_answers[0]?.photo_data ? (
            <img src={profile.voice_answers[0].photo_data} alt={profile.user.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-6 border-2 border-[rgba(176,92,47,0.3)]" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#B05C2F] to-[#8B4513] flex items-center justify-center mx-auto mb-6 text-white font-[family-name:var(--font-instrument-serif)] text-3xl">
              {profile.user.name.charAt(0)}
            </div>
          )}
          <h1 className="font-[family-name:var(--font-instrument-serif)] text-5xl md:text-7xl text-[#F5F0EB] mb-3">
            {profile.user.name}
          </h1>
          <p className="text-[#8A8580] text-lg font-light mb-1">{profile.user.hometown}</p>

          {/* Voice wave indicator if playing intro */}
          {playingIndex === 0 && (
            <div className="flex gap-1 items-center justify-center h-8 mt-6">
              {[...Array(14)].map((_, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-full bg-[#B05C2F]"
                  style={{
                    height: `${8 + Math.random() * 20}px`,
                    animation: `wave 1.8s ease-in-out infinite`,
                    animationDelay: `${i * 0.07}s`,
                  }}
                />
              ))}
            </div>
          )}
          {playingIndex !== 0 && profile.voice_answers[0] && (
            <button
              onClick={() => playAudio(profile.voice_answers[0].audio_data, 0)}
              className="mt-6 inline-flex items-center gap-2 text-[#B05C2F] text-sm hover:text-[#C97A4F] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Play introduction
            </button>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-[5px] h-[5px] rounded-full bg-[#8A8580] animate-pulse" />
        </div>
      </section>

      {/* Passion sections */}
      {profile.voice_answers.slice(1).map((answer, idx) => {
        const actualIndex = idx + 1;
        const style = PASSION_STYLES[actualIndex] || PASSION_STYLES[0];
        const q = QUESTIONS[answer.question_index];
        if (!q) return null;
        const isVisible = visibleSections.has(actualIndex);

        return (
          <section
            key={actualIndex}
            ref={el => { sectionRefs.current[actualIndex] = el; }}
            data-section={actualIndex}
            className="px-6 py-24 md:py-32 transition-all duration-1000"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
            }}
          >
            <div className="max-w-2xl mx-auto">
              {/* Section icon and label */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{style.icon}</span>
                <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: style.color }}>
                  {style.sectionTitle}
                </span>
              </div>

              {/* Photo */}
              {answer.photo_data && (
                <div className="mb-8 rounded-2xl overflow-hidden">
                  <img
                    src={answer.photo_data}
                    alt={style.sectionTitle}
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
              )}

              {/* Question as big headline */}
              <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl md:text-4xl text-[#F5F0EB] mb-8 leading-tight">
                {q.prompt}
              </h2>

              {/* Play button card */}
              <button
                onClick={() => playAudio(answer.audio_data, actualIndex)}
                className="w-full rounded-2xl p-6 text-left transition-all hover:scale-[1.01] border"
                style={{
                  background: style.bg,
                  borderColor: playingIndex === actualIndex ? style.color : 'rgba(255,255,255,0.06)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {playingIndex === actualIndex ? (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: style.color }}>
                        <div className="flex gap-[3px] items-center h-5">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className="w-[3px] rounded-full bg-white"
                              style={{
                                height: `${6 + Math.random() * 14}px`,
                                animation: 'wave 1.5s ease-in-out infinite',
                                animationDelay: `${i * 0.1}s`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center border" style={{ borderColor: `${style.color}40` }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={style.color}>
                          <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="text-[#F5F0EB] text-sm font-medium">
                        {playingIndex === actualIndex ? 'Listening...' : `Hear ${profile.user.name.split(' ')[0]}'s answer`}
                      </p>
                      <p className="text-[#8A8580] text-xs mt-0.5">In their own voice</p>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </section>
        );
      })}

      {/* Hometown section */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A8580] mb-4 block">From</span>
          <h2 className="font-[family-name:var(--font-instrument-serif)] text-4xl md:text-5xl text-[#F5F0EB] mb-4">
            {profile.user.hometown}
          </h2>
          <div className="w-16 h-[1px] bg-[rgba(255,255,255,0.1)] mx-auto mt-6" />
        </div>
      </section>

      {/* Connect section */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-md mx-auto text-center">
          {!showConnect ? (
            <>
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#B05C2F] mb-6">Now you know their story</p>
              <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl md:text-4xl text-[#F5F0EB] mb-4">
                Connect with {profile.user.name.split(' ')[0]}
              </h2>
              <p className="text-[#8A8580] text-base font-light mb-8">
                Share a little about yourself and see what connects you.
              </p>
              <button
                onClick={() => setShowConnect(true)}
                className="bg-[#B05C2F] text-white px-10 py-4 rounded-full text-base font-medium tracking-wide hover:bg-[#C97A4F] transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[rgba(176,92,47,0.3)]"
              >
                Connect with {profile.user.name.split(' ')[0]}
              </button>
            </>
          ) : (
            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-3xl p-8">
              <h3 className="font-[family-name:var(--font-instrument-serif)] text-2xl text-[#F5F0EB] mb-2">
                Connect with {profile.user.name.split(' ')[0]}
              </h3>
              <p className="text-[#8A8580] text-sm mb-6">
                Tell them a little about you.
              </p>
              <div className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-medium tracking-wider uppercase text-[#8A8580] mb-1.5">Your name</label>
                  <input
                    type="text"
                    value={visitorName}
                    onChange={e => setVisitorName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-transparent border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-sm text-[#F5F0EB] placeholder:text-[#8A8580] focus:outline-none focus:border-[#B05C2F] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium tracking-wider uppercase text-[#8A8580] mb-1.5">Email</label>
                  <input
                    type="email"
                    value={visitorEmail}
                    onChange={e => setVisitorEmail(e.target.value)}
                    placeholder="Your email"
                    className="w-full bg-transparent border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-sm text-[#F5F0EB] placeholder:text-[#8A8580] focus:outline-none focus:border-[#B05C2F] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium tracking-wider uppercase text-[#8A8580] mb-1.5">Phone (optional)</label>
                  <input
                    type="tel"
                    value={visitorPhone}
                    onChange={e => setVisitorPhone(e.target.value)}
                    placeholder="Your phone"
                    className="w-full bg-transparent border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-sm text-[#F5F0EB] placeholder:text-[#8A8580] focus:outline-none focus:border-[#B05C2F] transition-colors"
                  />
                </div>
              </div>
              <button
                onClick={handleConnect}
                disabled={!visitorName || connecting}
                className="w-full mt-6 bg-[#B05C2F] text-white py-3.5 rounded-full text-sm font-medium hover:bg-[#C97A4F] transition-all disabled:opacity-50"
              >
                {connecting ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 border-t border-[rgba(255,255,255,0.05)]">
        <a href="https://puentering.com" className="font-[family-name:var(--font-instrument-serif)] text-sm text-[rgba(255,255,255,0.2)] hover:text-[#B05C2F] transition-colors">
          Puente
        </a>
        <p className="text-[rgba(255,255,255,0.1)] text-xs mt-2">Every person has a story worth knowing</p>
      </footer>

      {/* Connect overlay on mobile */}
      {showConnect && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setShowConnect(false)} />
      )}

      {/* CSS animation for wave bars */}
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.4); opacity: 0.4; }
          50% { transform: scaleY(1.2); opacity: 0.8; }
        }
      `}</style>
    </main>
  );
}
