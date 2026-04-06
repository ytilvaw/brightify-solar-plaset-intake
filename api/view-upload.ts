import { createHmac, timingSafeEqual } from 'node:crypto'
import { get } from '@vercel/blob'

function getUploadLinkSecret() {
  return process.env.UPLOAD_LINK_SECRET ?? process.env.BLOB_READ_WRITE_TOKEN ?? ''
}

function signUploadPath(pathname: string) {
  return createHmac('sha256', getUploadLinkSecret()).update(pathname).digest('hex')
}

function signaturesMatch(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected)
  const receivedBuffer = Buffer.from(received)

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  )
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const pathname = url.searchParams.get('pathname')?.trim() ?? ''
  const signature = url.searchParams.get('sig')?.trim() ?? ''

  if (!pathname || !signature) {
    return new Response('Missing file link parameters.', { status: 400 })
  }

  if (!signaturesMatch(signUploadPath(pathname), signature)) {
    return new Response('Invalid file link.', { status: 403 })
  }

  const result = await get(pathname, {
    access: 'private',
    useCache: false,
  })

  if (!result || result.statusCode !== 200) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(result.stream, {
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Disposition': result.blob.contentDisposition,
      'Content-Type': result.blob.contentType,
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
