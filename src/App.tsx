
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FC, PropsWithChildren } from 'react'

import { RPC_ENDPOINTS, WALLETS } from '@frakt/constants'

import { useBestWorkingRPC } from '@frakt/hooks'
import { DialectProvider, initSentry } from '@frakt/utils'

initSentry()
const queryClient = new QueryClient()

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

const App: FC = () => {
  return (
    // <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <SolanaConnectionWalletProvider>
        <DialectProvider>
          <div>Banx here</div>
          {/* <Router /> */}
        </DialectProvider>
        {/* <VerifyWalletModal /> */}
        {/* <NotificationModal /> */}
        {/* <Confetti /> */}
      </SolanaConnectionWalletProvider>
    </QueryClientProvider>
    // </ErrorBoundary>
  )
}

export default App
