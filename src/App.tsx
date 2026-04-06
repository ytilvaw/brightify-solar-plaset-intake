import { Analytics } from '@vercel/analytics/react'
import AdminPage from './components/AdminPage'
import IntakeForm from './components/IntakeForm'

export default function App() {
  if (window.location.pathname.startsWith('/admin')) {
    return (
      <>
        <AdminPage />
        <Analytics />
      </>
    )
  }

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 pb-18 pt-6 sm:px-6 lg:px-8">
        <section className="hero-shell overflow-hidden rounded-[40px] border border-[#ececf0] px-6 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:px-10 md:py-12">
          <img
            alt="Brightify Solar"
            className="h-16 w-auto md:h-20"
            src="/brightify-logo.png"
          />

          <h1 className="mt-8 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-[#18181b] md:text-6xl">
            Brightify Solar Planset Intake
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-[#666674] md:text-lg">
            Submit the project details, equipment assumptions, and site photos needed to start design and permitting review.
          </p>
        </section>

        <div className="mt-6">
          <IntakeForm />
        </div>
      </main>
      <Analytics />
    </>
  )
}
