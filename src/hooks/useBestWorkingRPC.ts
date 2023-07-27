import { useEffect, useState } from 'react'
import { Connection, clusterApiUrl } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'

export const useBestWorkingRPC = ({
  endpoints,
  fallbackEndpoint = clusterApiUrl('mainnet-beta'),
  logErrors,
}: GetBestWorkingEndpointProps) => {
  const { data: endpoint, isLoading } = useQuery(
    ['bestWorkingRPC'],
    () =>
      getBestWorkingEndpoint({
        endpoints,
        fallbackEndpoint,
        logErrors,
      }),
    {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    },
  )
  return { endpoint, isLoading }
}

export const useBestWorkingRPCPure = ({
  endpoints,
  fallbackEndpoint = clusterApiUrl('mainnet-beta'),
  logErrors,
}: GetBestWorkingEndpointProps) => {
  const [endpoint, setEndpoint] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const setWorkingEndpoint = async () => {
      try {
        const endpoint = await getBestWorkingEndpoint({
          endpoints,
          fallbackEndpoint,
          logErrors,
        })
        setEndpoint(endpoint)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!endpoint) {
      setWorkingEndpoint()
    }
  }, [endpoints, fallbackEndpoint, logErrors, endpoint])

  return { endpoint, isLoading }
}

const getBestWorkingEndpoint = async ({
  endpoints,
  fallbackEndpoint = clusterApiUrl('mainnet-beta'),
  logErrors = false,
}: GetBestWorkingEndpointProps) => {
  const results: Array<CheckEndpointResult> = await Promise.all(
    endpoints.map((endpoint) =>
      new Connection(endpoint, { disableRetryOnRateLimit: true })
        .getLatestBlockhash()
        .then(() => ({ endpoint, error: null }))
        .catch(() => ({
          endpoint: null,
          error: `RPC endpoint doesnt work\n${endpoint}`,
        })),
    ),
  )

  if (logErrors) {
    // eslint-disable-next-line no-console
    results.forEach(({ error }) => !!error && console.warn(error))
  }

  return results.find(({ endpoint }) => !!endpoint)?.endpoint ?? fallbackEndpoint
}

interface CheckEndpointResult {
  endpoint: string | null
  error: string | null
}

interface GetBestWorkingEndpointProps {
  endpoints: Array<string>
  fallbackEndpoint?: string
  logErrors?: boolean
}
