import { FC } from 'react'

import classNames from 'classnames'

import { NftType } from '@banx/api/banxTokenStake'

import styles from './styled.module.less'

interface NftCheckboxProps {
  nft: NftType
  selected?: boolean
  additionalText?: string
  disabled?: boolean
  onClick?: (nft: NftType) => void
}

export const NftCheckbox: FC<NftCheckboxProps> = ({
  nft,
  selected = false,
  additionalText = '',
  disabled = false,
  onClick,
}) => {
  return (
    <div
      className={classNames(
        styles.nft,
        { [styles.nftPointer]: onClick && !disabled },
        { [styles.nftDisabled]: disabled },
      )}
      onClick={() => onClick?.(nft)}
    >
      <div className={styles.image}>
        {selected && <div className={styles.selected} />}
        {additionalText && !selected && (
          <div className={styles.additionalText}>{additionalText}</div>
        )}
        <img src={nft.meta.imageUrl} alt={nft.meta.name} />
      </div>

      <p>{nft.meta.partnerPoints} Partner points</p>
    </div>
  )
}
