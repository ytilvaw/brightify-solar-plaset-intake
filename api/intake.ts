import { createHmac } from 'node:crypto'
import { put } from '@vercel/blob'
import { Resend } from 'resend'
import { z } from 'zod'

const fileFields = [
  {
    name: 'mainPanelPhoto',
    label: 'Main Panel',
  },
  {
    name: 'frontHousePhoto',
    label: 'Front of House',
  },
  {
    name: 'sidewallPhoto',
    label: 'Sidewall',
  },
  {
    name: 'roofPhoto',
    label: 'Roof Area',
  },
  {
    name: 'meterPhoto',
    label: 'Utility Meter',
  },
  {
    name: 'additionalPhoto',
    label: 'Additional Context',
  },
] as const

type FileFieldName = (typeof fileFields)[number]['name']

const allowedFieldNames = fileFields.map((field) => field.name) as [
  FileFieldName,
  ...FileFieldName[],
]

const uploadSchema = z.object({
  contentType: z.string().min(1),
  downloadUrl: z.string().url().optional(),
  field: z.enum(allowedFieldNames),
  label: z.string().min(1),
  originalName: z.string().min(1),
  pathname: z.string().min(1),
  size: z.number().nonnegative(),
  url: z.string().url(),
})

const submissionSchema = z.object({
  battery: z.string().max(200).default(''),
  companyName: z.string().max(200).default(''),
  contactName: z.string().min(2).max(200),
  desiredSystemSize: z.string().min(1).max(80),
  email: z.string().email(),
  inverter: z.string().max(200).default(''),
  mainPanelRating: z.string().max(80).default(''),
  notes: z.string().max(4000).default(''),
  phone: z.string().min(7).max(40),
  roofType: z.string().max(80).default(''),
  siteAddress: z.string().min(5).max(300),
  solarPanel: z.string().max(200).default(''),
  uploads: z.array(uploadSchema).max(fileFields.length),
})

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderField(label: string, value: string) {
  return `<tr><td style="padding:10px 14px;border:1px solid #dbe4f0;font-weight:600;background:#f8fafc;">${escapeHtml(label)}</td><td style="padding:10px 14px;border:1px solid #dbe4f0;">${escapeHtml(value || '—')}</td></tr>`
}

function getUploadLinkSecret() {
  return process.env.UPLOAD_LINK_SECRET ?? process.env.BLOB_READ_WRITE_TOKEN ?? ''
}

function signUploadPath(pathname: string) {
  return createHmac('sha256', getUploadLinkSecret()).update(pathname).digest('hex')
}

function buildUploadViewerLink(baseUrl: string, pathname: string) {
  const url = new URL('/api/view-upload', baseUrl)
  url.searchParams.set('pathname', pathname)
  url.searchParams.set('sig', signUploadPath(pathname))
  return url.toString()
}

async function sendNotificationEmail(input: {
  appBaseUrl: string
  manifest: z.infer<typeof submissionSchema> & {
    source: string
    submissionId: string
    submittedAt: string
    userAgent: string
  }
}) {
  const apiKey = process.env.RESEND_API_KEY
  const to =
    process.env.INTAKE_NOTIFICATION_EMAIL ?? 'yrtilvawala@gmail.com'
  const from =
    process.env.INTAKE_FROM_EMAIL ?? 'Brightify Intake <onboarding@resend.dev>'

  if (!apiKey) {
    return { sent: false as const, skipped: true as const }
  }

  const resend = new Resend(apiKey)
  const { appBaseUrl, manifest } = input
  const uploadList = manifest.uploads.length
    ? manifest.uploads
        .map(
          (upload) => {
            const uploadUrl = buildUploadViewerLink(appBaseUrl, upload.pathname)
            return `<li style="margin:0 0 8px;"><a href="${escapeHtml(uploadUrl)}">${escapeHtml(upload.label)}</a> <span style="color:#475569;">(${escapeHtml(upload.originalName)})</span></li>`
          },
        )
        .join('')
    : '<li>No files uploaded.</li>'

  const textUploads = manifest.uploads.length
    ? manifest.uploads
        .map(
          (upload) =>
            `${upload.label}: ${upload.originalName} - ${buildUploadViewerLink(appBaseUrl, upload.pathname)}`,
        )
        .join('\n')
    : 'No files uploaded.'

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:760px;margin:0 auto;padding:24px;color:#0f172a;">
      <h1 style="margin:0 0 8px;font-size:28px;">New Brightify intake submission</h1>
      <p style="margin:0 0 20px;color:#475569;">Submission ID: ${escapeHtml(manifest.submissionId)}</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        ${renderField('Submitted', manifest.submittedAt)}
        ${renderField('Primary contact', manifest.contactName)}
        ${renderField('Email', manifest.email)}
        ${renderField('Phone', manifest.phone)}
        ${renderField('Company', manifest.companyName)}
        ${renderField('Site address', manifest.siteAddress)}
        ${renderField('Main panel rating', manifest.mainPanelRating)}
        ${renderField('Roof type', manifest.roofType)}
        ${renderField('Desired system size', manifest.desiredSystemSize)}
        ${renderField('Solar panel', manifest.solarPanel)}
        ${renderField('Inverter', manifest.inverter)}
        ${renderField('Battery', manifest.battery)}
        ${renderField('Notes', manifest.notes)}
      </table>
      <h2 style="margin:0 0 12px;font-size:20px;">Uploaded files</h2>
      <ul style="padding-left:20px;margin:0 0 24px;">
        ${uploadList}
      </ul>
    </div>
  `

  const text = `New Brightify intake submission

Submission ID: ${manifest.submissionId}
Submitted: ${manifest.submittedAt}
Primary contact: ${manifest.contactName}
Email: ${manifest.email}
Phone: ${manifest.phone}
Company: ${manifest.companyName || '—'}
Site address: ${manifest.siteAddress}
Main panel rating: ${manifest.mainPanelRating || '—'}
Roof type: ${manifest.roofType || '—'}
Desired system size: ${manifest.desiredSystemSize}
Solar panel: ${manifest.solarPanel || '—'}
Inverter: ${manifest.inverter || '—'}
Battery: ${manifest.battery || '—'}
Notes: ${manifest.notes || '—'}

Uploaded files:
${textUploads}
`

  const { data, error } = await resend.emails.send({
    from,
    html,
    replyTo: manifest.email,
    subject: `New intake: ${manifest.contactName} - ${manifest.siteAddress}`,
    text,
    to,
  })

  if (error) {
    throw new Error(error.message)
  }

  return {
    id: data?.id ?? null,
    sent: true as const,
    skipped: false as const,
  }
}

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      {
        error:
          'Vercel Blob is not configured. Attach a Blob store to this project or set BLOB_READ_WRITE_TOKEN locally.',
      },
      { status: 500 },
    )
  }

  try {
    const payload = submissionSchema.parse(await request.json())
    const requestUrl = new URL(request.url)
    const appBaseUrl =
      process.env.APP_BASE_URL?.trim() ||
      `${requestUrl.protocol}//${requestUrl.host}`
    const submissionId = `intake_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`
    const submittedAt = new Date().toISOString()
    const manifest = {
      ...payload,
      source: 'brightify-vercel-intake',
      submissionId,
      submittedAt,
      userAgent: request.headers.get('user-agent') ?? '',
    }

    const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], {
      type: 'application/json',
    })

    await put(`submissions/${submissionId}.json`, manifestBlob, {
      access: 'private',
    })

    const emailResult = await sendNotificationEmail({ appBaseUrl, manifest })

    return Response.json({
      emailSent: emailResult.sent,
      ok: true,
      submissionId,
      submittedAt,
    })
  } catch (error) {
    console.error('intake submission failed', error)

    if (error instanceof z.ZodError) {
      return Response.json(
        {
          error: error.issues[0]?.message ?? 'Invalid intake payload.',
        },
        { status: 400 },
      )
    }

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to save the intake package.',
      },
      { status: 500 },
    )
  }
}
