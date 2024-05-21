import { ErrorBoundary } from '@banx/components/ErrorBoundary'

import { DialectProvider, QueryProvider, SolanaConnectionWalletProvider } from '@banx/providers'
import { Router } from '@banx/router'
import { initSentry, purgeIdb } from '@banx/utils'

initSentry()
purgeIdb()

const App = () => {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <SolanaConnectionWalletProvider>
          <DialectProvider>
            <Router />
          </DialectProvider>
        </SolanaConnectionWalletProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}

export default App
