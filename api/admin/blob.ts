import { get } from '@vercel/blob'

import { isAuthorizedAdminRequest, unauthorizedResponse } from '../_admin.js'

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
