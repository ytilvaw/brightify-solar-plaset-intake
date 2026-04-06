import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

const fileFields = [
  'mainPanelPhoto',
  'frontHousePhoto',
  'sidewallPhoto',
  'roofPhoto',
  'meterPhoto',
  'additionalPhoto',
] as const

const uploadContentTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const

const allowedFieldNames = new Set(fileFields)

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody

  try {
    const response = await handleUpload({
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!pathname.startsWith('intake-temp/')) {
          throw new Error('Invalid upload destination.')
        }

        const parsedPayload =
          typeof clientPayload === 'string' && clientPayload
            ? JSON.parse(clientPayload)
            : null

        if (!parsedPayload || !allowedFieldNames.has(parsedPayload.field)) {
          throw new Error('Invalid upload payload.')
        }

        return {
          addRandomSuffix: false,
          allowedContentTypes: [...uploadContentTypes],
          tokenPayload: JSON.stringify(parsedPayload),
        }
      },
      request,
    })

    return Response.json(response)
  } catch (error) {
    console.error('blob upload authorization failed', error)

    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Could not authorize upload.',
      },
      { status: 400 },
    )
  }
}
