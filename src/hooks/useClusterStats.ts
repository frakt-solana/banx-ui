import { useConnection } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { solana } from '@banx/api/common'

export const useClusterStats = () => {
  const { connection } = useConnection()

  const { data, isLoading } = useQuery(
    ['clusterStats'],
    () => solana.getClusterStats({ connection }),
    {
      staleTime: 5000,
      refetchOnWindowFocus: false,
    },
  )

  return { data, isLoading }
}
