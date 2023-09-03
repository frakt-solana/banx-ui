import { FC, PropsWithChildren } from 'react'

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'

//TODO Use compression on production
// import { compress, decompress } from 'lz-string'
import { RPC_ENDPOINTS, WALLETS } from '@banx/constants'
import { useBestWorkingRPC } from '@banx/hooks'
import { Router } from '@banx/router'
import { DialectProvider, initSentry } from '@banx/utils'

import { USE_BORROW_NFTS_QUERY_KEY } from './pages/BorrowPage/hooks'
import { USE_WALLET_LOANS_QUERY_KEY } from './pages/LoansPage/hooks'

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
  serialize: (data) => JSON.stringify(data),
  deserialize: (data) => JSON.parse(data),
  key: '@banx.queryData',
  // serialize: (data) => compress(JSON.stringify(data)),
  // deserialize: (data) => JSON.parse(decompress(data)),
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
              const persist = !![USE_BORROW_NFTS_QUERY_KEY, USE_WALLET_LOANS_QUERY_KEY].find(
                (key) => queryKey.includes(key),
              )
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
        {/* <NotificationModal /> */}
        {/* <Confetti /> */}
      </SolanaConnectionWalletProvider>
    </PersistQueryClientProvider>
    // </ErrorBoundary>
  )
}

export default App
