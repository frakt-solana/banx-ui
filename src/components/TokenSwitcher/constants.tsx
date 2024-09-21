import { ReactNode } from 'react'

import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { SOL, USDC } from '@banx/icons'

export interface TokenOption {
  key: LendingTokenType
  label: string
  icon: ReactNode
}

export const TOKEN_OPTIONS: TokenOption[] = [
  {
    key: LendingTokenType.BanxSol,
    label: 'SOL',
    icon: <SOL />,
  },
  {
    key: LendingTokenType.Usdc,
    label: 'USDC',
    icon: <USDC viewBox="1 1 14 14" />,
  },
]
