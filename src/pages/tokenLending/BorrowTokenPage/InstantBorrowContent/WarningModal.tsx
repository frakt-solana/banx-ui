import { FC } from 'react'

import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'

import { Button } from '@banx/components/Buttons'
import { createDisplayValueJSX } from '@banx/components/TableComponents'
import { Modal } from '@banx/components/modals/BaseModal'

import { BorrowOffer, CollateralToken } from '@banx/api/tokens'
import { useTokenType } from '@banx/store/common'
import { formatValueByTokenType, getTokenDecimals, getTokenUnit } from '@banx/utils'

import { getSummaryInfo } from './helpers'

import styles from './InstantBorrowContent.module.less'

interface WarningModalProps {
  offers: BorrowOffer[]
  collateral: CollateralToken | undefined
  onSubmit: () => void
  onCancel: () => void
}

const WarningModal: FC<WarningModalProps> = ({ offers, onSubmit, onCancel, collateral }) => {
  const marketPubkey = collateral?.marketPubkey ?? PUBKEY_PLACEHOLDER

  const { weightedApr, weeklyFee, totalAmountToGet, totalCollateralsAmount } = getSummaryInfo(
    offers,
    marketPubkey,
  )

  const { tokenType } = useTokenType()

  const marketTokenDecimals = getTokenDecimals(tokenType) //? 1e6, 1e9
  const tokenUnit = getTokenUnit(tokenType)

  const formattedTotalAmountToGet = formatValueByTokenType(totalAmountToGet, tokenType)
  const formattedWeeklyFee = formatValueByTokenType(weeklyFee, tokenType)

  const formattedCollateralsValue = formatNumber(totalCollateralsAmount / marketTokenDecimals)
  const formattedAprValue = (weightedApr / 100).toFixed(0)

  return (
    <Modal
      className={styles.warningModal}
      open
      onCancel={onCancel}
      footer={false}
      width={496}
      centered
    >
      <div className={styles.warningModalBody}>
        <h3 className={styles.warningModalTitle}>Please pay attention!</h3>

        <div className={styles.warningModalText}>
          Lenders can only provide{' '}
          <span className={styles.warningModalTokenValue}>
            {createDisplayValueJSX(formattedTotalAmountToGet, tokenUnit)}
          </span>{' '}
          collateralized by{' '}
          <span className={styles.warningModalTokenRow}>
            {formattedCollateralsValue} {collateral?.collateral.ticker}
          </span>{' '}
          with {formattedAprValue}% APR (est weekly fee is{' '}
          <span className={styles.warningModalTokenValue}>
            {createDisplayValueJSX(formattedWeeklyFee, tokenUnit)}
          </span>
          )
        </div>
      </div>

      <div className={styles.warningModalFooter}>
        <Button onClick={onCancel} className={styles.cancelButton}>
          Cancel
        </Button>
        <Button onClick={onSubmit} className={styles.confirmButton}>
          Confirm
        </Button>
      </div>
    </Modal>
  )
}

export default WarningModal

const formatNumber = (value = 0) => {
  if (!value) return '--'

  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}
