import { createHmac } from 'node:crypto'
import { Resend } from 'resend'
import { z } from 'zod'

const optionalTextSchema = z.string().max(1200).default('')
const optionalShortTextSchema = z.string().max(80).default('')
const optionalEmailSchema = z
  .string()
  .max(320)
  .default('')
  .refine(
    (value) => value === '' || z.string().email().safeParse(value).success,
    {
      message: 'Invalid email address.',
    },
  )

const uploadedAssetSchema = z.object({
  contentType: z.string().min(1),
  downloadUrl: z.string().url().optional(),
  field: z.string().min(1),
  label: z.string().min(1),
  originalName: z.string().min(1),
  pathname: z.string().min(1),
  size: z.number().nonnegative(),
  url: z.string().url(),
})

const roofEvaluationSchema = z.object({
  customerEmail: optionalEmailSchema,
  desiredPanelCount: optionalShortTextSchema,
  notes: optionalTextSchema,
  panelSpecAttachment: uploadedAssetSchema.nullable().optional(),
  panelSize: optionalShortTextSchema,
  siteAddress: z.string().min(4).max(300),
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

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    return Response.json(
      {
        error:
          'Resend is not configured. Set RESEND_API_KEY before submitting roof evaluation requests.',
      },
      { status: 500 },
    )
  }

  try {
    const payload = roofEvaluationSchema.parse(await request.json())
    const requestUrl = new URL(request.url)
    const appBaseUrl =
      process.env.APP_BASE_URL?.trim() ||
      `${requestUrl.protocol}//${requestUrl.host}`
    const requestId = `roof_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`
    const submittedAt = new Date().toISOString()
    const panelSpecUrl = payload.panelSpecAttachment
      ? buildUploadViewerLink(appBaseUrl, payload.panelSpecAttachment.pathname)
      : ''
    const panelSpecFileName = payload.panelSpecAttachment?.originalName ?? '—'
    const attachmentHtml = payload.panelSpecAttachment
      ? `
        <h2 style="margin:0 0 12px;font-size:20px;">Attachments</h2>
        <ul style="padding-left:20px;margin:0;">
          <li style="margin:0 0 8px;"><a href="${escapeHtml(panelSpecUrl)}">Panel spec attachment</a> <span style="color:#475569;">(${escapeHtml(payload.panelSpecAttachment.originalName)})</span></li>
        </ul>
      `
      : ''
    const attachmentText = payload.panelSpecAttachment
      ? `Panel spec link: ${panelSpecUrl}`
      : 'Panel spec link: —'
    const to =
      process.env.ROOF_NOTIFICATION_EMAIL ??
      process.env.INTAKE_NOTIFICATION_EMAIL ??
      'yash.tilvawala@brightifysolar.com'
    const from =
      process.env.ROOF_FROM_EMAIL ??
      process.env.INTAKE_FROM_EMAIL ??
      'Brightify Intake <intake@brightifysolar.com>'

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:720px;margin:0 auto;padding:24px;color:#0f172a;">
        <h1 style="margin:0 0 8px;font-size:28px;">New Brightify roof evaluation request</h1>
        <p style="margin:0 0 20px;color:#475569;">Request ID: ${escapeHtml(requestId)}</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          ${renderField('Submitted', submittedAt)}
          ${renderField('Property address', payload.siteAddress)}
          ${renderField('Customer email', payload.customerEmail)}
          ${renderField('Desired number of panels', payload.desiredPanelCount)}
          ${renderField('Panel size', payload.panelSize)}
          ${renderField('Panel spec file', panelSpecFileName)}
          ${renderField('Roof notes', payload.notes)}
        </table>
        ${attachmentHtml}
      </div>
    `

    const text = `New Brightify roof evaluation request

Request ID: ${requestId}
Submitted: ${submittedAt}
Property address: ${payload.siteAddress}
Customer email: ${payload.customerEmail || '—'}
Desired number of panels: ${payload.desiredPanelCount || '—'}
Panel size: ${payload.panelSize || '—'}
Panel spec file: ${panelSpecFileName}
${attachmentText}
Roof notes: ${payload.notes || '—'}
`

    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from,
      html,
      ...(payload.customerEmail ? { replyTo: payload.customerEmail } : {}),
      subject: `New roof evaluation: ${payload.siteAddress}`,
      text,
      to,
    })

    if (error) {
      throw new Error(error.message)
    }

    return Response.json({
      emailId: data?.id ?? null,
      ok: true,
      requestId,
    })
  } catch (error) {
    console.error('roof evaluation request failed', error)

    if (error instanceof z.ZodError) {
      return Response.json(
        {
          error: error.issues[0]?.message ?? 'Invalid roof evaluation request.',
        },
        { status: 400 },
      )
    }

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to submit the roof evaluation request.',
      },
      { status: 500 },
    )
  }
}
