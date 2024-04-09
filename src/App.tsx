import { FC, PropsWithChildren, useEffect } from 'react'

import { ConnectionProvider, WalletProvider, useLocalStorage } from '@solana/wallet-adapter-react'

import { ErrorBoundary } from '@banx/components/ErrorBoundary'

import { RPC_ENDPOINTS, WALLETS } from '@banx/constants'
import { useBestWorkingRPC } from '@banx/hooks'
import { Router } from '@banx/router'
import { DialectProvider, QueryProvider, initSentry, purgeIdb } from '@banx/utils'

initSentry()
purgeIdb()

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
  useCode()

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

const CODE_CONSTANT = ['banxpower', '111']
const BANX_BETA_CODE_LS_KEY = '@banx.usdcBetaCode'

const useCode = () => {
  const [code, setCode] = useLocalStorage(BANX_BETA_CODE_LS_KEY, '')

  useEffect(() => {
    if (!code) {
      let userCode = window.prompt('Enter code:') || ''
      while (!CODE_CONSTANT.includes(userCode)) {
        userCode = window.prompt('Incorrect code. Please try again:') || ''
      }
      setCode(userCode)
    }
  }, [code, setCode])

  return { code, setCode }
}
