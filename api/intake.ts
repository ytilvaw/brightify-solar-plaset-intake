import { put } from '@vercel/blob'
import { z } from 'zod'

import { fileFields, type FileFieldName } from '../src/lib/intake'

const allowedFieldNames = fileFields.map((field) => field.name) as [
  FileFieldName,
  ...FileFieldName[],
]

const uploadSchema = z.object({
  contentType: z.string().min(1),
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

    return Response.json({
      ok: true,
      submissionId,
      submittedAt,
    })
  } catch (error) {
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
