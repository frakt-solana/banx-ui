import { TxnErrorDefinition, TxnErrorHumanName } from './types'

export const TXN_ERROR_DEFINITIONS: Array<TxnErrorDefinition> = [
  {
    humanMessage: TxnErrorHumanName.TRANSACTION_REJECTED,
    keyphrases: ['Transaction rejected', 'User rejected the request'],
    type: 'warning',
  },
  {
    humanMessage: TxnErrorHumanName.INSUFFICIENT_LAMPORTS,
    keyphrases: ['insufficient lamports'],
    type: 'error',
  },
  {
    humanMessage: TxnErrorHumanName.TOKEN_IS_LOCKED,
    keyphrases: ['Token is locked'],
    type: 'error',
  },
]

export enum BorrowType {
  StakedBanx = 'StakedBanx',
  CNft = 'CNft',
  Default = 'Default',
}

export enum ListingType {
  CNft = 'CNft',
  Default = 'Default',
}
