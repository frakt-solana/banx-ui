import { FC } from 'react'

import classNames from 'classnames'
import { find, last } from 'lodash'

import { staking } from '@banx/api/common'

import styles from './StakeNftsModal.module.less'

interface NftCheckboxProps {
  nft: staking.BanxStakeNft
  selected?: boolean
  additionalText?: string
  onClick: () => void
  isLoaned?: boolean
  isTerminationFreeze?: boolean
}

export const NftCheckbox: FC<NftCheckboxProps> = ({
  nft,
  selected = false,
  additionalText = '',
  onClick,
  isLoaned = false,
  isTerminationFreeze = false,
}) => {
  if (!nft?.meta) {
    return null
  }

  const disabled = isLoaned || isTerminationFreeze

  return (
    <div
      onClick={onClick}
      className={classNames(
        styles.nft,
        { [styles.nftPointer]: !disabled },
        { [styles.nftDisabled]: disabled },
      )}
    >
      {disabled && (
        <div className={styles.cover}>
          <span>{getStatusText(nft)}</span>
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

enum NftStatus {
  Loaned = 'Loaned',
  Listed = 'Loan listed',
  Default = '',
}

const getStatusText = (nft: staking.BanxStakeNft) => {
  const { isLoaned, isTerminationFreeze } = nft

  const statusConditions: Array<[boolean, NftStatus]> = [
    [isLoaned, NftStatus.Loaned],
    [isTerminationFreeze, NftStatus.Listed],
  ]

  const status = find(statusConditions, ([condition]) => condition)
  const statusText = last(status)
  return status ? statusText : NftStatus.Default
}
