import { NotificationTypes } from '@banx/utils'

import { TxnErrorDefinition, TxnErrorHumanName } from './types'

export const TXN_ERROR_DEFINITIONS: Array<TxnErrorDefinition> = [
  {
    humanMessage: TxnErrorHumanName.TRANSACTION_REJECTED,
    keyphrases: ['Transaction rejected', 'User rejected the request'],
    type: NotificationTypes.WARNING,
  },
  {
    humanMessage: TxnErrorHumanName.INSUFFICIENT_LAMPORTS,
    keyphrases: ['insufficient lamports'],
    type: NotificationTypes.ERROR,
  },
  {
    humanMessage: TxnErrorHumanName.TOKEN_IS_LOCKED,
    keyphrases: ['Token is locked'],
    type: NotificationTypes.ERROR,
  },
]
