import { FC } from 'react'

import { WalletName } from '@solana/wallet-adapter-base'
import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import { WalletItem } from '@banx/components/WalletModal/components'

import { useLinkWalletsModal } from './hooks'

type LinkingInProgressBlockProps = {
  onCancel: () => void
}
export const LinkingInProgressBlock: FC<LinkingInProgressBlockProps> = ({ onCancel }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
    }}
  >
    <pre>Linking in Progress</pre>
    <Button onClick={onCancel} variant="secondary" type="circle">
      x
    </Button>
  </div>
)

export const WalletsBlock = () => {
  const { wallets, select } = useWallet()

  const handleWalletSelect = (walletName: WalletName) => {
    select(walletName)
  }

  //TODO: Create new WalletItem component
  return (
    <div>
      {wallets.map(({ adapter }, idx) => (
        <WalletItem
          key={idx}
          onClick={() => handleWalletSelect(adapter.name)}
          image={adapter.icon}
          name={adapter.name}
        />
      ))}
    </div>
  )
}

//? Info about linked wallets here
//? + Optimistic
export const WalletInfo: FC = () => {
  const { wallet, canUnlink, onUnlink, linkedWalletsData, savedLinkingState } =
    useLinkWalletsModal()
  const { publicKey } = wallet

  //? No linking data and no BE info.
  // if (!savedLinkingData && !data) {
  //   return <p>{publicKey?.toBase58()}</p>
  // }

  return (
    <div>
      {(savedLinkingState.savedLinkingData?.data || linkedWalletsData)?.map(
        ({ type, wallet }, idx) => {
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <pre>
                {wallet}
                {type === 'main' && '🏠'}
              </pre>

              {wallet === publicKey?.toBase58() && <b>&nbsp;[Active]</b>}

              {type === 'linked' && canUnlink && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    onUnlink(wallet)
                  }}
                >
                  Unlink
                </Button>
              )}
            </div>
          )
        },
      )}
      <hr />
    </div>
  )
}
