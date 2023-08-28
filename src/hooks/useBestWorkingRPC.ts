import { useEffect, useState } from 'react'

import { Connection, clusterApiUrl } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'

interface GetBestWorkingEndpointProps {
  endpoints: Array<string>
  fallbackEndpoint?: string
  logErrors?: boolean
}

const getBestWorkingEndpoint = async ({
  endpoints,
  fallbackEndpoint = clusterApiUrl('mainnet-beta'),
  logErrors = false,
}: GetBestWorkingEndpointProps) => {
  for (const endpoint of endpoints) {
    try {
      await new Connection(endpoint, {
        disableRetryOnRateLimit: true,
      }).getLatestBlockhash()
      return endpoint
    } catch (error) {
      if (logErrors) {
        console.warn(`RPC endpoint doesnt work\n${endpoint}`)
      }
    }
  }

  return fallbackEndpoint
}

type UseBestWorkingRPC = ({
  endpoints,
  fallbackEndpoint,
  logErrors,
}: GetBestWorkingEndpointProps) => {
  endpoint: string | null
  isLoading: boolean
}

export const useBestWorkingRPC: UseBestWorkingRPC = ({
  endpoints,
  fallbackEndpoint = clusterApiUrl('mainnet-beta'),
  logErrors,
}) => {
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
  return { endpoint: endpoint ?? null, isLoading }
}

export const useBestWorkingRPCPure: UseBestWorkingRPC = ({
  endpoints,
  fallbackEndpoint = clusterApiUrl('mainnet-beta'),
  logErrors,
}) => {
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
