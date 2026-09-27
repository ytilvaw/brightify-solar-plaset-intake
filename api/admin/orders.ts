import { get, list } from '@vercel/blob'
import type { OrderRecord } from '../../src/lib/orders.js'

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

async function readOrder(pathname: string) {
  const result = await get(pathname, {
    access: 'private',
  })

  if (!result || result.statusCode !== 200) {
    return null
  }

  const raw = await new Response(result.stream).text()
  return JSON.parse(raw) as OrderRecord
}

export async function GET(request: Request) {
  if (!isAuthorizedAdminRequest(request)) {
    return unauthorizedResponse()
  }

  try {
    const listed = await list({
      limit: 100,
      prefix: 'orders/',
    })

    const records = (
      await Promise.all(
        listed.blobs
          .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
          .map((blob) => readOrder(blob.pathname)),
      )
    ).filter(Boolean) as OrderRecord[]

    return Response.json({
      orders: records,
    })
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to load orders.',
      },
      { status: 500 },
    )
  }
}
