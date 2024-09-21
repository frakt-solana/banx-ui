import { FC, useMemo } from 'react'

import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { compact, first, isArray, last } from 'lodash'

import {
  DisplayValue,
  createDisplayValueJSX,
  createPercentValueJSX,
} from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import { core } from '@banx/api/nft'
import { useImagePreload } from '@banx/hooks'
import { PlaceholderPFP } from '@banx/icons'
import {
  HealthColorIncreasing,
  calculateBorrowedAmount,
  calculateLoanRepayValue,
  formatValueByTokenType,
  getColorByPercent,
  getTokenUnit,
} from '@banx/utils'

import { Mark } from './Diagram'
import { calculateStyle } from './helpers'

import styles from './Diagram.module.less'

const TooltipRow = ({ loan }: { loan: core.Loan }) => {
  const { nft } = loan

  const ltv = (calculateLoanRepayValue(loan) / nft.collectionFloor) * 100
  const loanValue = calculateBorrowedAmount(loan).toNumber()

  return (
    <div className={styles.tooltipRowContent}>
      <ImageWithPlaceholder className={styles.nftImage} url={nft.meta.imageUrl} />
      <DisplayValue value={loanValue} />
      <span style={{ color: getColorByPercent(ltv, HealthColorIncreasing) }}>
        {createPercentValueJSX(ltv)}
      </span>
    </div>
  )
}

const createTooltipContent = (loans: core.Loan[]) => {
  if (!loans.length) return null

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipHeaderContent}>
        <span className={styles.tooltipHeaderLabel}>Offer</span>
        <span className={styles.tooltipHeaderLabel}>LTV</span>
      </div>
      <div className={styles.tooltipBodyContent}>
        {loans.map((loan) => (
          <TooltipRow key={loan.publicKey} loan={loan} />
        ))}
      </div>
    </div>
  )
}

interface DiagramMarkProps {
  left: number
  mark: Mark[] | Mark
  tokenType: LendingTokenType
}

export const DiagramMark: FC<DiagramMarkProps> = ({ mark, left, tokenType }) => {
  const markers = isArray(mark) ? mark : [mark]

  const firstLoan = markers[0]?.loan
  const nftImageUrl = firstLoan?.nft.meta.imageUrl

  const loans = compact(markers.map((marker) => marker.loan))
  const tooltipContent = createTooltipContent(loans)

  const tokenUnit = getTokenUnit(tokenType)

  const displayOfferValue = getDisplayOfferValue(markers, tokenType)

  const MarkContent = (
    <div className={styles.mark} style={{ left: calculateStyle(left) }}>
      <CollateralImage markers={markers} url={nftImageUrl} />
      <div className={styles.dot} />
      <div className={styles.value}>{createDisplayValueJSX(displayOfferValue, tokenUnit)}</div>
    </div>
  )

  if (tooltipContent) {
    return <Tooltip title={tooltipContent}>{MarkContent}</Tooltip>
  }

  return MarkContent
}

const getDisplayOfferValue = (markers: Mark[], tokenType: LendingTokenType) => {
  const { value: firstValue = 0 } = first(markers) || {}
  const { value: lastValue = 0 } = last(markers) || {}

  const formattedFirstValue = formatValueByTokenType(firstValue, tokenType)

  if (markers.length > 1 && firstValue !== lastValue) {
    const formattedLastValue = formatValueByTokenType(lastValue, tokenType)

    return `${formattedFirstValue} - ${formattedLastValue}`
  }

  return formattedFirstValue || '0'
}

interface CollateralImageProps {
  url: string | undefined
  markers: Mark[]
}

export const CollateralImage: FC<CollateralImageProps> = ({ url = '', markers }) => {
  const offersCountAttribute = useMemo(() => {
    return markers.length > 1 ? { 'data-offers-count': markers.length } : {}
  }, [markers])

  if (!url) {
    return <div className={styles.square} {...offersCountAttribute} />
  }

  return (
    <ImageWithPlaceholder
      url={url}
      className={styles.imageSquare}
      attributes={offersCountAttribute}
    />
  )
}

interface ImageWithPlaceholderProps {
  url: string | undefined
  className: string
  attributes?: { [key: string]: number | undefined }
}

const ImageWithPlaceholder: FC<ImageWithPlaceholderProps> = ({
  url = '',
  className,
  attributes,
}) => {
  const imageLoaded = useImagePreload(url)

  return imageLoaded ? (
    <img src={url} className={className} {...attributes} />
  ) : (
    <PlaceholderPFP className={classNames(styles.nftPlaceholderIcon, className)} />
  )
}
