import { BondFeatures } from 'fbonds-core/lib/fbond-protocol/types'

import { RBOption } from '@banx/components/RadioButton'

export const DEFAULTS_OPTIONS: RBOption[] = [
  {
    label: 'Receive NFT',
    value: BondFeatures.AutoReceiveAndReceiveNft,
  },
  {
    label: 'Receive SOL',
    value: BondFeatures.AutoreceiveSol,
  },
]

export const DEFAULT_BOND_FEATURE = BondFeatures.AutoReceiveAndReceiveNft
