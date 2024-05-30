import { ReactNode } from 'react'

import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { SOL, USDC } from '@banx/icons'

interface NftTokenOption {
  key: LendingTokenType
  label: string
  unit: ReactNode
}

export const NFT_TOKEN_OPTIONS: NftTokenOption[] = [
  {
    key: LendingTokenType.NativeSol,
    label: 'SOL',
    unit: <SOL />,
  },
  {
    key: LendingTokenType.Usdc,
    label: 'USDC',
    unit: <USDC />,
  },
]

export const NFT_TOKEN_VALUE_DETAILS = {
  [LendingTokenType.NativeSol]: {
    ticker: 'SOL',
    //? Remove paddings in svg for USDC and SOL tokens. We need to do it in the svg files, but many views will be broken.
    icon: <SOL viewBox="-1 -1 18 18" />,
  },
  [LendingTokenType.BanxSol]: {
    ticker: 'SOL',
    icon: <SOL viewBox="-1 -1 18 18" />,
  },
  [LendingTokenType.Usdc]: {
    ticker: 'USDC',
    icon: <USDC viewBox="1 1 14 14" />,
  },
}

export interface TokenOption {
  key: LendingTokenType
  label: string
  unit: ReactNode
}

export const TOKEN_OPTIONS: TokenOption[] = [
  {
    key: LendingTokenType.NativeSol,
    label: 'SOL',
    unit: <SOL />,
  },
  {
    key: LendingTokenType.Usdc,
    label: 'USDC',
    unit: <USDC />,
  },
]
