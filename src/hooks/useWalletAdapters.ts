import { Adapter, WalletName, WalletReadyState } from '@solana/wallet-adapter-base'
import { useWallet } from '@solana/wallet-adapter-react'
import { chain } from 'lodash'

import { MAGIC_EDEN_DOWNLOAD_URL, MAGIC_EDEN_WALLET_NAME } from '@banx/constants'

type UseWalletAdapters = (
  props?: Partial<{
    onWalletSelect?: () => void
  }>,
) => Array<{ adapter: Adapter; select: () => void }>

export const useWalletAdapters: UseWalletAdapters = (props) => {
  const { onWalletSelect } = props ?? {}

  const { wallets, select } = useWallet()

  const createSelectHanlder = (walletName: WalletName, readyState: WalletReadyState) => () => {
    //? If ME wallet not detected --> open chrome extenstions download ME tab
    if (walletName === MAGIC_EDEN_WALLET_NAME && readyState === WalletReadyState.NotDetected) {
      window.open(MAGIC_EDEN_DOWNLOAD_URL, '_blank')
    }
    select(walletName)
    onWalletSelect?.()
  }

  const adapters = chain(wallets)
    //? Put ME adapter on first place in adapters array
    .sortBy(({ adapter }) => adapter.name !== MAGIC_EDEN_WALLET_NAME)
    .map(({ adapter }) => ({
      adapter,
      select: createSelectHanlder(adapter.name, adapter.readyState),
    }))
    .value()

  return adapters
}
