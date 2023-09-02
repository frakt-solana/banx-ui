import { FC, PropsWithChildren } from 'react'

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { compress, decompress } from 'lz-string'

import { RPC_ENDPOINTS, WALLETS } from '@banx/constants'
import { useBestWorkingRPC } from '@banx/hooks'
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
  serialize: (data) => compress(JSON.stringify(data)),
  deserialize: (data) => JSON.parse(decompress(data)),
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
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
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
