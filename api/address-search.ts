import { z } from 'zod'

const addressQuerySchema = z.object({
  q: z.string().trim().min(4).max(200),
})

type PhotonFeature = {
  properties?: {
    city?: string
    country?: string
    countrycode?: string
    county?: string
    district?: string
    housenumber?: string
    name?: string
    postcode?: string
    state?: string
    street?: string
  }
}

type PhotonResponse = {
  features?: PhotonFeature[]
}

function formatPhotonAddress(feature: PhotonFeature) {
  const details = feature.properties

  if (!details) {
    return ''
  }

  const streetLine = [details.housenumber, details.street ?? details.name]
    .filter(Boolean)
    .join(' ')
    .trim()

  const locality = [
    details.city ?? details.district ?? details.county,
    details.state,
    details.postcode,
  ]
    .filter(Boolean)
    .join(', ')

  const address = [streetLine, locality].filter(Boolean).join(', ').trim()

  if (!address) {
    return ''
  }

  if (details.countrycode?.toUpperCase() === 'US' || details.country === 'United States') {
    return address
  }

  return [address, details.country].filter(Boolean).join(', ')
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const parsedQuery = addressQuerySchema.safeParse({
    q: requestUrl.searchParams.get('q') ?? '',
  })

  if (!parsedQuery.success) {
    return Response.json({ error: 'A valid address query is required.' }, { status: 400 })
  }

  try {
    const photonUrl = new URL('https://photon.komoot.io/api/')
    photonUrl.searchParams.set('q', parsedQuery.data.q)
    photonUrl.searchParams.set('limit', '5')
    photonUrl.searchParams.set('lang', 'en')

    const response = await fetch(photonUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'brightify-solar-intake/1.0',
      },
    })

    if (!response.ok) {
      throw new Error(`Photon returned ${response.status}`)
    }

    const result = (await response.json()) as PhotonResponse
    const suggestions = Array.from(
      new Set((result.features ?? []).map(formatPhotonAddress).filter(Boolean)),
    )

    return Response.json(
      { suggestions },
      {
        headers: {
          'Cache-Control': 'public, max-age=300',
        },
      },
    )
  } catch (error) {
    console.error('address search failed', error)

    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Unable to search addresses.',
      },
      { status: 502 },
    )
  }
}
