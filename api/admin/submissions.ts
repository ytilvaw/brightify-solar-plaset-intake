import { get, list } from '@vercel/blob'

interface UploadedAsset {
  field: string
  label: string
  pathname: string
  url: string
  size: number
  contentType: string
  originalName: string
}

interface SubmissionRecord {
  contactName: string
  companyName: string
  email: string
  phone: string
  siteAddress: string
  mainPanelRating: string
  roofType: string
  desiredSystemSize: string
  solarPanel: string
  inverter: string
  battery: string
  notes: string
  uploads: UploadedAsset[]
  source: string
  submissionId: string
  submittedAt: string
  userAgent: string
}

function readAdminKey(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim()
  }

  const url = new URL(request.url)
  return url.searchParams.get('key')?.trim() ?? ''
}

function isAuthorizedAdminRequest(request: Request) {
  const configuredKey = process.env.ADMIN_ACCESS_KEY?.trim()

  if (!configuredKey) {
    return false
  }

  return readAdminKey(request) === configuredKey
}

function unauthorizedResponse() {
  return Response.json(
    {
      error: 'Unauthorized',
    },
    { status: 401 },
  )
}

async function readSubmission(pathname: string) {
  const result = await get(pathname, {
    access: 'private',
  })

  if (!result || result.statusCode !== 200) {
    return null
  }

  const raw = await new Response(result.stream).text()
  return JSON.parse(raw) as SubmissionRecord
}

export async function GET(request: Request) {
  if (!isAuthorizedAdminRequest(request)) {
    return unauthorizedResponse()
  }

  try {
    const listed = await list({
      limit: 100,
      prefix: 'submissions/',
    })

    const records = (
      await Promise.all(
        listed.blobs
          .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
          .map((blob) => readSubmission(blob.pathname)),
      )
    ).filter(Boolean) as SubmissionRecord[]

    return Response.json({
      submissions: records,
    })
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load submissions.',
      },
      { status: 500 },
    )
  }
}
