import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-medium tracking-[0.25em] uppercase text-[var(--color-accent)] mb-8">
        Every person has a story worth knowing
      </p>
      <h1 className="font-[family-name:var(--font-instrument-serif)] text-6xl md:text-8xl text-[var(--color-text-light)] mb-6">
        Puente
      </h1>
      <p className="text-[var(--color-text-dim)] text-lg font-light max-w-md mb-10 leading-relaxed">
        A ring that carries your story in your voice, in any language. One tap. Now they&apos;ll know.
      </p>
      <div className="flex gap-4 items-center">
        <Link
          href="/create"
          className="bg-[var(--color-accent)] text-white px-8 py-3 rounded-full text-sm font-medium tracking-wide hover:bg-[var(--color-accent-soft)] transition-all hover:-translate-y-0.5"
        >
          Create your profile
        </Link>
      </div>
    </main>
  );
}
