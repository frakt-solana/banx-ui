import { FC, useState } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

import { LinkedWallet } from '@banx/api/user'
import { House, LoaderCircle, Unlink } from '@banx/icons'
import { formatNumbersWithCommas, shortenAddress } from '@banx/utils'

import { useLinkWalletsModal } from '../hooks'

import styles from '../LinkWalletsModal.module.less'

export const LinkedWalletsTable: FC = () => {
  const { wallet, canUnlink, onUnlink, linkedWalletsData, savedLinkingState } =
    useLinkWalletsModal()
  const { publicKey } = wallet

  const isWalletActive = (walletPubkey: string) => walletPubkey === publicKey?.toBase58()

  const isUnlinkAvailable = (wallet: LinkedWallet) =>
    wallet.type === 'linked' && canUnlink && !savedLinkingState.savedLinkingData

  return (
    <div className={styles.linkedWalletsTableContainer}>
      <table className={styles.linkedWalletsTable}>
        <thead>
          <tr>
            <th>Wallet</th>
            <th>Borrower pts</th>
            <th>Lender pts</th>
            <th>Boost</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {linkedWalletsData?.map((linkedWallet, idx) => {
            return (
              <LinkedWalletItem
                key={idx}
                linkedWallet={linkedWallet}
                isActive={isWalletActive(linkedWallet.wallet)}
                onUnlink={
                  isUnlinkAvailable(linkedWallet) ? () => onUnlink(linkedWallet.wallet) : undefined
                }
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

type LinkedWalletProps = {
  linkedWallet: LinkedWallet
  isActive?: boolean
  onUnlink?: () => Promise<void>
}
const LinkedWalletItem: FC<LinkedWalletProps> = ({ linkedWallet, isActive = false, onUnlink }) => {
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
    <tr>
      <td
        className={classNames(styles.linkedWalletKey, { [styles.linkedWalletKeyActive]: isActive })}
      >
        {shortenAddress(linkedWallet.wallet)}
      </td>
      <td>{formatNumbersWithCommas(linkedWallet.borrowerPoints?.toFixed(0))}</td>
      <td>{formatNumbersWithCommas(linkedWallet.lenderPoints?.toFixed(0))}</td>
      <td className={styles.linkedWalletBoost}>{formatNumbersWithCommas(linkedWallet.boost)}x</td>
      <td className={styles.linkedWalletRightContainer}>
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
      </td>
    </tr>
  )
}
