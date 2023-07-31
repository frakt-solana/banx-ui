import { FC } from 'react'

import { Ledger, MathWallet } from '@frakt/icons'

import styles from './WalletModal.module.less'

interface WalletItemProps {
  onClick: () => void
  image: string
  name: string
}

const CustomIcon: FC<{ name: string }> = ({ name }) => {
  if (name === 'Ledger') return <Ledger className={styles.walletIcon} />
  if (name === 'MathWallet') return <MathWallet className={styles.walletIcon} />
  return null
}

export const WalletItem: FC<WalletItemProps> = ({ onClick, image, name }) => {
  // To prevent same background for white icons
  const hasCustomIcon = name === 'Ledger' || name === 'MathWallet'

  return (
    <div className={styles.walletItem} onClick={onClick}>
      {hasCustomIcon ? <CustomIcon name={name} /> : <img alt={name} src={image} />}
      {name}
    </div>
  )
}
