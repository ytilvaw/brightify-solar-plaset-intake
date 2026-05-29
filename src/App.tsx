import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import AdminPage from './components/AdminPage'
import DesignLandingPage from './components/DesignLandingPage'
import IntakeSinglePage from './components/IntakeSinglePage'
import LandingPage from './components/LandingPage'
import RoofEvaluationForm from './components/RoofEvaluationForm'

function BackHomeNav() {
  return (
    <nav aria-label="Page navigation" className="mb-4 flex">
      <a
        className="inline-flex items-center justify-center rounded-full border border-[#ececf0] bg-white px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#666674] shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:border-[#d8d8de] hover:text-[#18181b]"
        href="/"
      >
        Home
      </a>
    </nav>
  )
}


function RoofPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-18 pt-6 sm:px-6 lg:px-8">
      <BackHomeNav />

      <section className="hero-shell overflow-hidden rounded-[40px] border border-[#ececf0] px-6 py-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:px-10 md:py-12">
        <a aria-label="Brightify Solar home" className="mx-auto block w-fit" href="/">
          <img
            alt="Brightify Solar"
            className="h-30 w-auto md:h-44"
            src="/brightify-logo.png"
          />
        </a>

        <h1 className="mx-auto mt-8 max-w-5xl text-[1.85rem] font-[500] uppercase leading-[1.02] tracking-[0.04em] text-[#09111f] md:text-[3.6rem]">
          SOLAR ROOF EVALUATION
        </h1>

        <p className="mx-auto mt-6 max-w-4xl text-[1.1rem] font-[500] leading-8 tracking-[-0.03em] text-[#1c2433] md:text-[1.45rem] md:leading-10">
          Enter your address so we can analyze your roof and estimate how many panels can fit.
        </p>
      </section>

      <div className="mt-6">
        <RoofEvaluationForm />
      </div>
    </main>
  )
}

export default function App() {
  if (window.location.pathname.startsWith('/design')) {
    return (
      <>
        <DesignLandingPage />
        <Analytics />
        <SpeedInsights />
      </>
    )
  }

  if (window.location.pathname.startsWith('/admin')) {
    return (
      <>
        <AdminPage />
        <Analytics />
        <SpeedInsights />
      </>
    )
  }

  if (window.location.pathname.startsWith('/planset')) {
    return (
      <>
        <IntakeSinglePage />
        <Analytics />
        <SpeedInsights />
      </>
    )
  }

  if (window.location.pathname.startsWith('/roof')) {
    return (
      <>
        <RoofPage />
        <Analytics />
        <SpeedInsights />
      </>
    )
  }

  return (
    <>
      <LandingPage />
      <Analytics />
      <SpeedInsights />
    </>
  )
}
