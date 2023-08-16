import * as Sentry from '@sentry/browser'
import { Dictionary } from 'lodash'

import { SENTRY } from '@banx/constants'
import { TxnError } from '@banx/transactions'

const IGNORE_ERRORS = [
  'Registration failed - push service error',
  'We are unable to register the default service worker',
  'The notification permission was not granted and blocked instead',
  'The string did not match the expected pattern',
  'User rejected the request',
]

export const initSentry = (): void => {
  Sentry.init({
    dsn: SENTRY.APP_DSN,
    ignoreErrors: IGNORE_ERRORS,
    defaultIntegrations: false,
    tracesSampleRate: 0.05,
  })
}

type CaptureSentryTxnError = (props: {
  error: TxnError | unknown
  walletPubkey?: string
  transactionName?: string
  params?: Dictionary<unknown>
}) => void

export const captureSentryTxnError: CaptureSentryTxnError = ({
  error,
  walletPubkey = '',
  transactionName = 'Unknown transaction',
  params = {},
}) => {
  if (error instanceof Error) {
    Sentry.captureException(error, (scope) => {
      scope.clear()

      scope.setTransactionName(transactionName)

      if (walletPubkey) {
        scope.setUser({ id: walletPubkey })
        scope.setTag('wallet', walletPubkey)
      }

      scope.setTag('transaction', transactionName)

      scope.setExtra('Transaction params', JSON.stringify(params, null, ' '))

      if ('logs' in error && Array.isArray(error.logs)) {
        scope.setExtra('Transaction logs: ', error.logs.join('\n'))
      }

      return scope
    })
  }
}
