import { FC } from 'react'

import classNames from 'classnames'

import { BanxStakeNft } from '@banx/api/staking'

import styles from './StakeNftsModal.module.less'

interface NftCheckboxProps {
  nft: BanxStakeNft
  selected?: boolean
  additionalText?: string
  disabled?: boolean
  onClick?: () => void
}

export const NftCheckbox: FC<NftCheckboxProps> = ({
  nft,
  selected = false,
  additionalText = '',
  disabled = false,
  onClick,
}) => {
  if (!nft?.meta) {
    return null
  }

  return (
    <div
      className={classNames(
        styles.nft,
        { [styles.nftPointer]: onClick && !disabled },
        { [styles.nftDisabled]: disabled },
      )}
      onClick={() => onClick?.()}
    >
      {disabled && (
        <div className={styles.cover}>
          <span>Loaned</span>
        </div>
      )}
      <div className={styles.image}>
        {disabled || (selected && <div className={styles.selected} />)}
        {additionalText && !selected && (
          <div className={styles.additionalText}>{additionalText}</div>
        )}
        <img src={nft.meta.imageUrl} alt={nft.meta.name} />
      </div>

      <p>{nft.meta.partnerPoints} Partner points</p>
    </div>
  )
}
