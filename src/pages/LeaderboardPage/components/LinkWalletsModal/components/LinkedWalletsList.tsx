import { FC, useState } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

import { LinkedWallet } from '@banx/api/user'
import { House, LoaderCircle, Unlink } from '@banx/icons'
import { shortenAddress } from '@banx/utils'

import { useLinkWalletsModal } from '../hooks'

import styles from '../LinkWalletsModal.module.less'

export const LinkedWalletsList: FC = () => {
  const { wallet, canUnlink, onUnlink, linkedWalletsData, savedLinkingState } =
    useLinkWalletsModal()
  const { publicKey } = wallet

  const isWalletActive = (walletPubkey: string) => walletPubkey === publicKey?.toBase58()

  const isUnlinkAvailable = (wallet: LinkedWallet) =>
    wallet.type === 'linked' && canUnlink && !savedLinkingState.savedLinkingData

  return (
    <ul className={styles.linkedWalletsList}>
      {linkedWalletsData?.map((linkedWallet, idx) => {
        return (
          <LinkedWalletItem
            className={classNames({ [styles.linkedWalletItemDeepBg]: idx % 2 === 0 })}
            key={idx}
            linkedWallet={linkedWallet}
            isActive={isWalletActive(linkedWallet.wallet)}
            onUnlink={
              isUnlinkAvailable(linkedWallet) ? () => onUnlink(linkedWallet.wallet) : undefined
            }
          />
        )
      })}
    </ul>
  )
}

type LinkedWalletProps = {
  linkedWallet: LinkedWallet
  isActive?: boolean
  onUnlink?: () => Promise<void>
  className?: string
}
const LinkedWalletItem: FC<LinkedWalletProps> = ({
  linkedWallet,
  isActive = false,
  onUnlink,
  className,
}) => {
  //? For loading state
  const [isUnlinking, setIsUnlinking] = useState(false)

  const isMainWallet = linkedWallet.type === 'main'

  const unlink = async () => {
    if (!onUnlink) return
    try {
      setIsUnlinking(true)
      await onUnlink()
    } finally {
      setIsUnlinking(false)
    }
  }

  return (
    <li className={classNames(styles.linkedWalletItem, className)}>
      <p
        className={classNames(styles.linkedWalletKey, { [styles.linkedWalletKeyActive]: isActive })}
      >
        {shortenAddress(linkedWallet.wallet)}
      </p>
      <div className={styles.linkedWalletRightContainer}>
        {isMainWallet && <House className={styles.houseIco} />}
        {onUnlink && !isUnlinking && (
          <Button onClick={unlink} type="circle" variant="secondary" className={styles.unlinkBtn}>
            <Unlink />
          </Button>
        )}
        {isUnlinking && (
          <div className={styles.unlinkLoader}>
            <LoaderCircle gradientColor="#AEAEB2" />
          </div>
        )}
      </div>
    </li>
  )
}
