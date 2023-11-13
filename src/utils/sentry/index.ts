import * as Sentry from '@sentry/browser'
import { Dictionary } from 'lodash'
import { TxnError } from 'solana-transactions-executor'

import { SENTRY } from '@banx/constants'

const IGNORE_ERRORS = [
  'Registration failed - push service error',
  'We are unable to register the default service worker',
  'The notification permission was not granted and blocked instead',
  'The string did not match the expected pattern',
  'User rejected the request',
  'WalletSignTransactionError',
  'Transaction rejected',
]

export const initSentry = () => {
  Sentry.init({
    dsn: SENTRY.APP_DSN,
    ignoreErrors: IGNORE_ERRORS,
    defaultIntegrations: false,
    tracesSampleRate: 0.05,
    beforeSend: (event) => {
      const ignore = !!event.exception?.values?.find(({ type, value }) => {
        if (!type || !value) return false
        if (IGNORE_ERRORS.includes(type) || IGNORE_ERRORS.includes(value)) return true
      })
      return !ignore ? event : null
    },
  })
}

type CaptureSentryTxnError = (props: {
  error: TxnError | unknown
  additionalData?: unknown
  walletPubkey?: string
  transactionName?: string
  params?: Dictionary<unknown>
}) => void

export const captureSentryTxnError: CaptureSentryTxnError = ({
  error,
  additionalData,
  walletPubkey = '',
  transactionName = 'Unknown transaction',
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

      if (additionalData) {
        scope.setExtra('data', JSON.stringify(additionalData))
      }

      if ('logs' in error && Array.isArray(error.logs)) {
        scope.setExtra('Transaction logs: ', error.logs.join('\n'))
      }

      return scope
    })
  }
}
