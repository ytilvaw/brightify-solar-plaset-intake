import { useEffect, useMemo, useState } from 'react'

import type { SubmissionRecord } from '../lib/admin'

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}

function AdminKeyForm(props: {
  onSubmit: (value: string) => void
}) {
  const { onSubmit } = props
  const [value, setValue] = useState('')

  return (
    <section className="mx-auto max-w-xl rounded-[36px] border border-[#ececf0] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-8">
      <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#18181b]">
        Submission Review
      </h1>
      <p className="mt-3 text-base leading-7 text-[#666674]">
        Enter the admin access key to review saved intake submissions and uploaded images.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit(value.trim())
        }}
      >
        <div>
          <label className="field-label" htmlFor="adminAccessKey">
            Admin Access Key
          </label>
          <input
            className="field-input"
            id="adminAccessKey"
            onChange={(event) => setValue(event.target.value)}
            type="password"
            value={value}
          />
        </div>

        <button
          className="inline-flex items-center justify-center rounded-full bg-[#f3a43a] px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white shadow-[0_12px_30px_rgba(243,164,58,0.18)] transition hover:bg-[#e8982a]"
          type="submit"
        >
          Open Review
        </button>
      </form>
    </section>
  )
}

function SubmissionCard(props: {
  adminKey: string
  submission: SubmissionRecord
}) {
  const { adminKey, submission } = props
  const imageEntries = submission.uploads.filter((upload) =>
    upload.contentType.startsWith('image/'),
  )
  const documentEntries = submission.uploads.filter(
    (upload) => !upload.contentType.startsWith('image/'),
  )

  return (
    <article className="rounded-[32px] border border-[#ececf0] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 border-b border-[#ececf0] pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#18181b]">
            {submission.contactName}
          </h2>
          <p className="mt-1 text-sm text-[#666674]">
            {submission.siteAddress}
          </p>
        </div>
        <div className="text-sm text-[#666674]">
          <div>{formatDate(submission.submittedAt)}</div>
          <div className="mt-1 font-mono text-xs text-[#8a8a98]">
            {submission.submissionId}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-[24px] bg-[#fafafa] p-4">
          <p className="field-label">Contact</p>
          <div className="mt-3 space-y-2 text-sm text-[#2d2d34]">
            <p>{submission.email}</p>
            <p>{submission.phone}</p>
            <p>{submission.companyName || 'No company provided'}</p>
          </div>
        </div>
        <div className="rounded-[24px] bg-[#fafafa] p-4">
          <p className="field-label">System</p>
          <div className="mt-3 space-y-2 text-sm text-[#2d2d34]">
            <p>Panels: {submission.desiredSystemSize}</p>
            <p>Roof: {submission.roofType || '—'}</p>
            <p>Panel: {submission.solarPanel || '—'}</p>
            <p>Inverter: {submission.inverter || '—'}</p>
            <p>Battery: {submission.battery || '—'}</p>
            <p>Main panel: {submission.mainPanelRating || '—'}</p>
          </div>
        </div>
      </div>

      {submission.notes ? (
        <div className="mt-4 rounded-[24px] bg-[#fafafa] p-4">
          <p className="field-label">Notes</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#2d2d34]">
            {submission.notes}
          </p>
        </div>
      ) : null}

      <div className="mt-5">
        <div className="flex items-center justify-between gap-4">
          <p className="field-label">Uploaded Files</p>
          <span className="text-sm text-[#666674]">
            {submission.uploads.length} file{submission.uploads.length === 1 ? '' : 's'}
          </span>
        </div>

        {imageEntries.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {imageEntries.map((upload) => (
              <figure
                className="overflow-hidden rounded-[24px] border border-[#ececf0] bg-[#fafafa]"
                key={upload.pathname}
              >
                <img
                  alt={upload.label}
                  className="h-52 w-full bg-white object-cover"
                  src={`/api/admin/blob?pathname=${encodeURIComponent(upload.pathname)}&key=${encodeURIComponent(adminKey)}`}
                />
                <figcaption className="space-y-1 px-4 py-3 text-sm">
                  <div className="font-semibold text-[#18181b]">{upload.label}</div>
                  <div className="truncate text-[#666674]">{upload.originalName}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : null}

        {documentEntries.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {documentEntries.map((upload) => (
              <a
                className="rounded-[24px] border border-[#ececf0] bg-[#fafafa] p-4 transition hover:border-[#d8d8de] hover:bg-white"
                href={`/api/admin/blob?pathname=${encodeURIComponent(upload.pathname)}&key=${encodeURIComponent(adminKey)}`}
                key={upload.pathname}
                rel="noreferrer"
                target="_blank"
              >
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[#7a7a86]">
                  {upload.label}
                </p>
                <p className="mt-3 text-sm font-medium text-[#18181b]">{upload.originalName}</p>
                <p className="mt-2 text-sm text-[#666674]">Open file</p>
              </a>
            ))}
          </div>
        ) : null}

        {!submission.uploads.length ? (
          <div className="mt-4 rounded-[24px] border border-dashed border-[#d7d7dd] bg-[#fafafa] px-4 py-8 text-sm text-[#777785]">
            No files uploaded with this submission.
          </div>
        ) : null}
      </div>
    </article>
  )
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem('adminAccessKey') ?? '')
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const hasKey = useMemo(() => adminKey.trim().length > 0, [adminKey])

  useEffect(() => {
    if (!hasKey) {
      return
    }

    let cancelled = false

    async function loadSubmissions() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/admin/submissions', {
          headers: {
            Authorization: `Bearer ${adminKey}`,
          },
        })

        const result = (await response.json()) as
          | { error?: string; submissions?: SubmissionRecord[] }
          | undefined

        if (!response.ok) {
          throw new Error(result?.error ?? 'Unable to load submissions.')
        }

        if (!cancelled) {
          setSubmissions(result?.submissions ?? [])
          localStorage.setItem('adminAccessKey', adminKey)
        }
      } catch (loadError) {
        if (!cancelled) {
          setSubmissions([])
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load submissions.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadSubmissions()

    return () => {
      cancelled = true
    }
  }, [adminKey, hasKey])

  if (!hasKey) {
    return (
      <main className="mx-auto max-w-7xl px-4 pb-18 pt-6 sm:px-6 lg:px-8">
        <AdminKeyForm onSubmit={setAdminKey} />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-18 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[36px] border border-[#ececf0] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#18181b]">
              Submission Review
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#666674]">
              Review saved planset requests, image uploads, and intake notes from one place.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              className="rounded-full border border-[#ececf0] px-4 py-2 text-sm text-[#666674] transition hover:border-[#d7d7dd] hover:text-[#18181b]"
              onClick={() => {
                localStorage.removeItem('adminAccessKey')
                setAdminKey('')
              }}
              type="button"
            >
              Sign Out
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 rounded-[24px] border border-[#ececf0] bg-white px-5 py-8 text-sm text-[#666674] shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
          Loading submissions...
        </div>
      ) : null}

      {!loading && !error && submissions.length === 0 ? (
        <div className="mt-6 rounded-[24px] border border-[#ececf0] bg-white px-5 py-8 text-sm text-[#666674] shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
          No submissions found yet.
        </div>
      ) : null}

      <div className="mt-6 space-y-6">
        {submissions.map((submission) => (
          <SubmissionCard
            adminKey={adminKey}
            key={submission.submissionId}
            submission={submission}
          />
        ))}
      </div>
    </main>
  )
}
