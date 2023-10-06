import { FC, PropsWithChildren } from 'react'

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { compress, decompress } from 'lz-string'

import { COMPRESS_QUERY_PERSISTER, RPC_ENDPOINTS, WALLETS } from '@banx/constants'
import { useBestWorkingRPC } from '@banx/hooks'
import { USE_BORROW_NFTS_QUERY_KEY } from '@banx/pages/BorrowPage/hooks'
import { USE_MARKETS_PREVIEW_QUERY_KEY } from '@banx/pages/LendPage/hooks'
import { USE_WALLET_LOANS_AND_OFFERS_QUERY_KEY } from '@banx/pages/LoansPage/hooks'
import { USE_USER_OFFERS_QUERY_KEY } from '@banx/pages/OffersPage/hooks'
import { Router } from '@banx/router'
import { DialectProvider, initSentry } from '@banx/utils'

initSentry()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 10 * 60 * 1000, //? 10 minutes
    },
  },
})

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: '@banx.queryData',
  serialize: (data) =>
    COMPRESS_QUERY_PERSISTER ? compress(JSON.stringify(data)) : JSON.stringify(data),
  deserialize: (data) =>
    COMPRESS_QUERY_PERSISTER ? JSON.parse(decompress(data)) : JSON.parse(data),
})

const SolanaConnectionWalletProvider: FC<PropsWithChildren> = ({ children }) => {
  const { endpoint, isLoading } = useBestWorkingRPC({
    endpoints: RPC_ENDPOINTS,
    logErrors: true,
  })

  if (isLoading || !endpoint) return <></>

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={WALLETS} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  )
}

const App = () => {
  return (
    // <ErrorBoundary>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            const queryIsReadyForPersistance = query.state.status === 'success'
            if (queryIsReadyForPersistance) {
              const { queryKey } = query
              const persist = !![
                USE_BORROW_NFTS_QUERY_KEY,
                USE_WALLET_LOANS_AND_OFFERS_QUERY_KEY,
                USE_MARKETS_PREVIEW_QUERY_KEY,
                USE_USER_OFFERS_QUERY_KEY,
              ].find((key) => queryKey.includes(key))
              return persist
            }
            return false
          },
        },
      }}
    >
      <SolanaConnectionWalletProvider>
        <DialectProvider>
          <Router />
        </DialectProvider>
        {/* <VerifyWalletModal /> */}
        {/* <Confetti /> */}
      </SolanaConnectionWalletProvider>
    </PersistQueryClientProvider>
    // </ErrorBoundary>
  )
}

export default App
