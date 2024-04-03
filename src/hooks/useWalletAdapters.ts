import { Adapter, WalletName } from '@solana/wallet-adapter-base'
import { useWallet } from '@solana/wallet-adapter-react'
import { chain } from 'lodash'

type UseWalletAdapters = (
  props?: Partial<{
    onWalletSelect: () => void
  }>,
) => Array<{ adapter: Adapter; select: () => void }>

export const useWalletAdapters: UseWalletAdapters = (props) => {
  const { onWalletSelect } = props ?? {}

  const { wallets, select } = useWallet()

  const createSelectHanlder = (walletName: WalletName) => () => {
    select(walletName)
    onWalletSelect?.()
  }

  const adapters = chain(wallets)
    .map(({ adapter }) => ({
      adapter,
      select: createSelectHanlder(adapter.name),
    }))
    .value()

  return adapters
}
