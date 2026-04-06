import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import AdminPage from './components/AdminPage'
import IntakeForm from './components/IntakeForm'

export default function App() {
  if (window.location.pathname.startsWith('/admin')) {
    return (
      <>
        <AdminPage />
        <Analytics />
        <SpeedInsights />
      </>
    )
  }

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 pb-18 pt-6 sm:px-6 lg:px-8">
        <section className="hero-shell overflow-hidden rounded-[40px] border border-[#ececf0] px-6 py-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:px-10 md:py-12">
          <img
            alt="Brightify Solar"
            className="mx-auto h-30 w-auto md:h-44"
            src="/brightify-logo.png"
          />

          <h1 className="mx-auto mt-8 max-w-5xl text-[2.85rem] font-[400] leading-[0.98] tracking-[-0.06em] text-[#09111f] md:text-[5.6rem]">
            Solar Planset Intake
          </h1>

          <p className="mx-auto mt-6 max-w-4xl text-[1.1rem] font-[500] leading-8 tracking-[-0.03em] text-[#1c2433] md:text-[1.45rem] md:leading-10">
            Submit the project details, equipment assumptions, and site photos needed to start planset design.
          </p>
        </section>

        <div className="mt-6">
          <IntakeForm />
        </div>
      </main>
      <Analytics />
      <SpeedInsights />
    </>
  )
}
