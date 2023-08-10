import * as Sentry from '@sentry/browser'
import { Dictionary } from 'lodash'

import { SENTRY } from '@banx/constants'

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

export interface TxnError extends Error {
  logs?: Array<string>
}

type CaptureSentryTxnError = (props: {
  error: TxnError
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
  Sentry.captureException(error, (scope) => {
    scope.clear()

    scope.setTransactionName(transactionName)

    if (walletPubkey) {
      scope.setUser({ id: walletPubkey })
      scope.setTag('wallet', walletPubkey)
    }

    scope.setTag('transaction', transactionName)

    scope.setExtra('Transaction params', JSON.stringify(params, null, ' '))
    error?.logs && scope.setExtra('Transaction logs: ', error.logs.join('\n'))

    return scope
  })
}
