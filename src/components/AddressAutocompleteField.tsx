import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()
const googleMapsCallbackName = '__initGoogleMapsPlaces'
const googleMapsScriptId = 'google-maps-places-script'

type AddressPrediction = {
  description: string
  place_id: string
}

type PlacesLibrary = {
  AutocompleteSessionToken: new () => unknown
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions: (request: Record<string, unknown>) => Promise<{
      suggestions?: Array<{
        placePrediction?: {
          placeId?: string
          text?: {
            toString: () => string
          }
        }
      }>
    }>
  }
}

type GoogleMapsWindow = Window &
  typeof globalThis & {
    google?: {
      maps: {
        importLibrary?: (name: string) => Promise<PlacesLibrary>
      }
    }
    __googleMapsLoadError?: string
    __googleMapsPlacesPromise?: Promise<void>
    __initGoogleMapsPlaces?: () => void
  }

type AddressAutocompleteFieldProps = {
  id: string
  label: string
  name: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  value: string
}

function getBrowserWindow() {
  return window as GoogleMapsWindow
}

function buildGoogleMapsScriptUrl() {
  const params = new URLSearchParams({
    callback: googleMapsCallbackName,
    key: googleMapsApiKey,
    libraries: 'places',
    loading: 'async',
  })

  return `https://maps.googleapis.com/maps/api/js?${params.toString()}`
}

function loadGoogleMapsPlacesLibrary() {
  if (!googleMapsApiKey) {
    return Promise.resolve()
  }

  const browserWindow = getBrowserWindow()

  if (browserWindow.google?.maps?.importLibrary) {
    return Promise.resolve()
  }

  if (browserWindow.__googleMapsPlacesPromise) {
    return browserWindow.__googleMapsPlacesPromise
  }

  const existingScript = document.getElementById(googleMapsScriptId) as
    | HTMLScriptElement
    | null

  browserWindow.__googleMapsPlacesPromise = new Promise<void>((resolve, reject) => {
    browserWindow[googleMapsCallbackName] = () => {
      resolve()
    }

    const script = existingScript ?? document.createElement('script')

    script.id = googleMapsScriptId
    script.src = buildGoogleMapsScriptUrl()
    script.async = true
    script.defer = true

    script.onerror = () => {
      browserWindow.__googleMapsLoadError = 'Failed to load the Google Maps script.'
      reject(new Error(browserWindow.__googleMapsLoadError))
    }

    if (!existingScript) {
      document.head.appendChild(script)
    }
  })

  return browserWindow.__googleMapsPlacesPromise
}

export default function AddressAutocompleteField({
  id,
  label,
  name,
  onChange,
  placeholder = '123 Main St, City, State, ZIP',
  required = false,
  value,
}: AddressAutocompleteFieldProps) {
  const [addressPredictions, setAddressPredictions] = useState<AddressPrediction[]>([])
  const [showAddressPredictions, setShowAddressPredictions] = useState(false)
  const [activePredictionIndex, setActivePredictionIndex] = useState(-1)
  const [addressAutocompleteStatus, setAddressAutocompleteStatus] = useState<
    'disabled' | 'loading' | 'ready' | 'error'
  >(googleMapsApiKey ? 'loading' : 'disabled')
  const [addressAutocompleteMessage, setAddressAutocompleteMessage] = useState(
    googleMapsApiKey
      ? 'Loading Google address suggestions...'
      : '',
  )
  const inputRef = useRef<HTMLInputElement | null>(null)
  const placesLibraryRef = useRef<PlacesLibrary | null>(null)
  const sessionTokenRef = useRef<unknown | null>(null)
  const newestPredictionRequestIdRef = useRef(0)
  const blurTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        window.clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!googleMapsApiKey || !inputRef.current) {
      return
    }

    let active = true

    void (async () => {
      try {
        await loadGoogleMapsPlacesLibrary()

        const browserWindow = getBrowserWindow()

        if (!active || !browserWindow.google?.maps?.importLibrary) {
          return
        }

        const placesLibrary = await browserWindow.google.maps.importLibrary('places')

        if (!active) {
          return
        }

        placesLibraryRef.current = placesLibrary
        sessionTokenRef.current = new placesLibrary.AutocompleteSessionToken()
        setAddressAutocompleteStatus('ready')
        setAddressAutocompleteMessage(
          'Google Places Autocomplete is enabled for U.S. street addresses.',
        )
      } catch (mapsError) {
        console.error(mapsError)
        setAddressAutocompleteStatus('error')
        setAddressAutocompleteMessage(
          mapsError instanceof Error
            ? mapsError.message
            : 'Google address suggestions could not be initialized.',
        )
      }
    })()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (
      addressAutocompleteStatus !== 'ready' ||
      !placesLibraryRef.current ||
      !sessionTokenRef.current
    ) {
      return
    }

    const query = value.trim()

    if (query.length < 3) {
      setAddressPredictions([])
      setActivePredictionIndex(-1)
      return
    }

    const timeoutId = window.setTimeout(() => {
      const requestId = ++newestPredictionRequestIdRef.current

      void placesLibraryRef.current?.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        includedRegionCodes: ['us'],
        input: query,
        language: 'en-US',
        region: 'us',
        sessionToken: sessionTokenRef.current,
      })
        .then((result) => {
          if (requestId !== newestPredictionRequestIdRef.current) {
            return
          }

          const predictions = (result.suggestions ?? [])
            .map((suggestion) => suggestion.placePrediction)
            .filter(Boolean)
            .map((prediction) => ({
              description: prediction?.text?.toString().trim() ?? '',
              place_id: prediction?.placeId ?? '',
            }))
            .filter((prediction) => prediction.description && prediction.place_id)

          setAddressPredictions(predictions)
          setActivePredictionIndex(predictions.length ? 0 : -1)
        })
        .catch((predictionError) => {
          console.error(predictionError)

          if (requestId !== newestPredictionRequestIdRef.current) {
            return
          }

          setAddressPredictions([])
          setActivePredictionIndex(-1)
          setAddressAutocompleteStatus('error')
          setAddressAutocompleteMessage(
            predictionError instanceof Error
              ? predictionError.message
              : 'Google address suggestions could not be loaded.',
          )
        })
    }, 200)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [addressAutocompleteStatus, value])

  const selectAddressPrediction = (prediction: AddressPrediction) => {
    onChange(prediction.description)
    setShowAddressPredictions(false)
    setAddressPredictions([])
    setActivePredictionIndex(-1)

    if (placesLibraryRef.current) {
      sessionTokenRef.current = new placesLibraryRef.current.AutocompleteSessionToken()
    }
  }

  const handleAddressKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showAddressPredictions || !addressPredictions.length) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActivePredictionIndex((current) =>
        current >= addressPredictions.length - 1 ? 0 : current + 1,
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActivePredictionIndex((current) =>
        current <= 0 ? addressPredictions.length - 1 : current - 1,
      )
      return
    }

    if (event.key === 'Enter' && activePredictionIndex >= 0) {
      event.preventDefault()
      selectAddressPrediction(addressPredictions[activePredictionIndex])
      return
    }

    if (event.key === 'Escape') {
      setShowAddressPredictions(false)
    }
  }

  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="address-autocomplete">
        <input
          autoComplete="street-address"
          className="field-input"
          id={id}
          name={name}
          onBlur={() => {
            blurTimeoutRef.current = window.setTimeout(() => {
              setShowAddressPredictions(false)
            }, 120)
          }}
          onChange={(event) => {
            onChange(event.target.value)
            setShowAddressPredictions(true)
          }}
          onFocus={() => {
            if (addressPredictions.length) {
              setShowAddressPredictions(true)
            }
          }}
          onKeyDown={handleAddressKeyDown}
          placeholder={placeholder}
          ref={inputRef}
          required={required}
          spellCheck={false}
          type="text"
          value={value}
        />
        {showAddressPredictions && addressPredictions.length > 0 ? (
          <div className="address-suggestions" role="listbox">
            {addressPredictions.map((prediction, index) => (
              <button
                aria-selected={index === activePredictionIndex}
                className={`address-suggestion ${index === activePredictionIndex ? 'address-suggestion-active' : ''}`}
                key={prediction.place_id}
                onMouseDown={(event) => {
                  event.preventDefault()
                  selectAddressPrediction(prediction)
                }}
                type="button"
              >
                {prediction.description}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {addressAutocompleteMessage ? (
        <p
          className={`field-hint ${addressAutocompleteStatus === 'error' ? 'field-hint-error' : ''}`}
        >
          {addressAutocompleteMessage}
        </p>
      ) : null}
    </div>
  )
}
