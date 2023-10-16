import { FC, PropsWithChildren } from 'react'

import { QueryClient } from '@tanstack/react-query'
import {
  PersistQueryClientProvider,
  PersistedClient,
  Persister,
} from '@tanstack/react-query-persist-client'
import { del, get, set } from 'idb-keyval'

import { DEFAULT_QUERY_CACHE_TIME, IDB_QUERY_DATA_KEY, QUERY_KEYS_TO_PERSIST } from './constants'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: DEFAULT_QUERY_CACHE_TIME,
    },
  },
})

const persister = {
  persistClient: async (client: PersistedClient) => {
    await set(IDB_QUERY_DATA_KEY, client)
  },
  restoreClient: async () => {
    return await get<PersistedClient>(IDB_QUERY_DATA_KEY)
  },
  removeClient: async () => {
    await del(IDB_QUERY_DATA_KEY)
  },
} as Persister

export const QueryProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            const queryIsReadyForPersistance = query.state.status === 'success'
            if (queryIsReadyForPersistance) {
              const { queryKey } = query
              const persist = !!QUERY_KEYS_TO_PERSIST.find((key) => queryKey.includes(key))
              return persist
            }
            return false
          },
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}
