export function readAdminKey(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim()
  }

  const url = new URL(request.url)
  return url.searchParams.get('key')?.trim() ?? ''
}

export function isAuthorizedAdminRequest(request: Request) {
  const configuredKey = process.env.ADMIN_ACCESS_KEY?.trim()

  if (!configuredKey) {
    return false
  }

  return readAdminKey(request) === configuredKey
}

export function unauthorizedResponse() {
  return Response.json(
    {
      error: 'Unauthorized',
    },
    { status: 401 },
  )
}
