import { FC, PropsWithChildren } from 'react'

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'

import { ErrorBoundary } from '@banx/components/ErrorBoundary'

import { RPC_ENDPOINTS, WALLETS } from '@banx/constants'
import { useBestWorkingRPC } from '@banx/hooks'
import { Router } from '@banx/router'
import { DialectProvider, QueryProvider, initSentry } from '@banx/utils'

initSentry()
localStorage.removeItem('@banx.queryData') //TODO Remove after a while. Just to make sure that there is no garbage in LS

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
    <ErrorBoundary>
      <QueryProvider>
        <SolanaConnectionWalletProvider>
          <DialectProvider>
            <Router />
          </DialectProvider>
          {/* <Confetti /> */}
        </SolanaConnectionWalletProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}

export default App
