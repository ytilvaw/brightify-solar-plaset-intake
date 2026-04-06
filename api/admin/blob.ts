import { get } from '@vercel/blob'

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

export async function GET(request: Request) {
  if (!isAuthorizedAdminRequest(request)) {
    return unauthorizedResponse()
  }

  const url = new URL(request.url)
  const pathname = url.searchParams.get('pathname')

  if (!pathname) {
    return Response.json(
      {
        error: 'Missing pathname',
      },
      { status: 400 },
    )
  }

  const result = await get(pathname, {
    access: 'private',
  })

  if (!result || result.statusCode !== 200) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(result.stream, {
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Type': result.blob.contentType,
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
