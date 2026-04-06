import { get, list } from '@vercel/blob'

import { isAuthorizedAdminRequest, unauthorizedResponse } from '../_admin'
import type { SubmissionRecord } from '../../src/lib/admin'

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
