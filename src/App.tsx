import IntakeForm from './components/IntakeForm'

const workflowItems = [
  'Capture the job details and photos in one pass from the field.',
  'Upload images directly into Vercel Blob instead of relying on platform form hacks.',
  'Store a structured JSON intake package so downstream automation can pick it up.',
]

const checklistItems = [
  'Primary contact, email, and callback number',
  'Accurate site address and service details',
  'Desired system size and equipment assumptions',
  'Photo set covering panel, meter, house, and roof area',
]

export default function App() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-18 pt-6 sm:px-6 lg:px-8">
      <section className="hero-shell overflow-hidden rounded-[40px] border border-white/10 px-6 py-8 shadow-[0_25px_100px_rgba(2,6,23,0.55)] md:px-10 md:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#f1b24a]">
              <span className="h-2 w-2 rounded-full bg-[#f1b24a]" />
              Vercel-ready intake system
            </div>

            <img
              alt="Brightify Solar"
              className="mt-8 h-16 w-auto md:h-20"
              src="/brightify-logo.png"
            />

            <h1 className="mt-8 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-white md:text-6xl">
              Brightify Solar planset intake, rebuilt for Vercel from the ground up.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 md:text-lg">
              The old build mixed TanStack Start scaffolding with Netlify-only form handling. This version strips that out and uses a simpler deployment model: Vite for the frontend, Vercel Functions for submission handling, and Vercel Blob for photo storage.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            <article className="rounded-[30px] border border-white/12 bg-slate-950/45 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f1b24a]">
                What changed
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                {workflowItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="rounded-[30px] border border-white/12 bg-white/8 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f1b24a]">
                Field checklist
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                {checklistItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="info-card">
          <p className="info-card-eyebrow">Stack</p>
          <h2 className="info-card-title">Plain Vite + Vercel Functions</h2>
          <p className="info-card-copy">
            No adapter mismatch, no framework-specific hosting config, and no static form workarounds.
          </p>
        </article>

        <article className="info-card">
          <p className="info-card-eyebrow">Uploads</p>
          <h2 className="info-card-title">Direct-to-Blob image flow</h2>
          <p className="info-card-copy">
            Photos bypass a single multipart server request, which is a better fit for Vercel’s function model.
          </p>
        </article>

        <article className="info-card">
          <p className="info-card-eyebrow">Output</p>
          <h2 className="info-card-title">Structured intake manifest</h2>
          <p className="info-card-copy">
            Each submission is persisted as JSON so downstream review or automation has a stable schema to work from.
          </p>
        </article>
      </section>

      <div className="mt-6">
        <IntakeForm />
      </div>
    </main>
  )
}
