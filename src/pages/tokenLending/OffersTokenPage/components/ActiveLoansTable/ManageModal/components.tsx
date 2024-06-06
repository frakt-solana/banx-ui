import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { Loader } from '@banx/components/Loader'
import { Slider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import Timer from '@banx/components/Timer'

import { core } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'
import {
  HealthColorIncreasing,
  calculateLentTokenValueWithInterest,
  formatValueByTokenType,
  getColorByPercent,
  getTokenUnit,
} from '@banx/utils'

import { useClosureContent } from './hooks/useClosureContent'
import { useRepaymentCallContent } from './hooks/useRepaymentCallContent'

import styles from './ManageModal.module.less'

export const ClosureContent: FC<{ loan: core.TokenLoan }> = ({ loan }) => {
  const {
    freezeExpiredAt,
    isFreezeExpired,
    canRefinance,
    canTerminate,
    instantLoan,
    terminateLoan,
    isLoading,
  } = useClosureContent(loan)

  const { tokenType } = useNftTokenType()
  const tokenUnit = getTokenUnit(tokenType)

  const lentValue = calculateLentTokenValueWithInterest(loan).toNumber()

  return (
    <div className={styles.closureContent}>
      <div
        className={classNames(styles.modalContent, styles.twoColumnsContent, styles.closureTexts)}
      >
        <h3>Exit</h3>
        <h3>Terminate</h3>
        <p>Instantly receive your total claim</p>
        <p>
          Send your loan to refinancing auction to seek new lenders. If successful, you will receive
          SOL in your wallet. If unsuccessful after 72 hours you will receive the collateral instead
        </p>
      </div>
      {isFreezeExpired && (
        <div className={styles.modalContent}>
          {isLoading && <Loader />}
          {!isLoading && (
            <div className={styles.twoColumnsContent}>
              <Button onClick={instantLoan} disabled={!canRefinance} variant="secondary">
                {canRefinance ? (
                  <div className={styles.exitValue}>
                    Exit +{formatValueByTokenType(lentValue, tokenType)}
                    {tokenUnit}
                  </div>
                ) : (
                  'No suitable offers yet'
                )}
              </Button>
              <Button
                className={styles.terminateButton}
                onClick={terminateLoan}
                disabled={!canTerminate}
                variant="secondary"
              >
                Terminate
              </Button>
            </div>
          )}
        </div>
      )}
      {!isFreezeExpired && (
        <div className={styles.freezeTimerWrapper}>
          Exit and termination are frozen for <Timer expiredAt={freezeExpiredAt} />
        </div>
      )}
    </div>
  )
}

export const RepaymentCallContent: FC<{ loan: core.TokenLoan }> = ({ loan }) => {
  const {
    repayPercent,
    onPartialPercentChange,
    remainingDebt,
    ltv,
    sendBtnDisabled,
    onSend,
    repaymentCallActive,
    paybackValue,
  } = useRepaymentCallContent(loan)

  return (
    <div className={styles.modalContent}>
      <Slider
        value={repayPercent}
        onChange={onPartialPercentChange}
        marks={DEFAULT_SLIDER_MARKS}
        max={MAX_SLIDER_VALUE}
      />
      <div className={styles.repaimentCallAdditionalInfo}>
        <StatInfo
          label="Ask borrower to repay"
          value={<DisplayValue value={paybackValue} />}
          flexType="row"
        />
        <StatInfo
          label="Debt after repayment"
          value={<DisplayValue value={remainingDebt} />}
          flexType="row"
        />
        <StatInfo
          label="Ltv after repayment"
          value={ltv}
          valueStyles={{ color: getColorByPercent(ltv, HealthColorIncreasing) }}
          valueType={VALUES_TYPES.PERCENT}
          flexType="row"
        />
      </div>
      <Button className={styles.repaymentCallButton} onClick={onSend} disabled={sendBtnDisabled}>
        {!repaymentCallActive ? 'Send' : 'Update'}
      </Button>
    </div>
  )
}

const MAX_SLIDER_VALUE = 90
const DEFAULT_SLIDER_MARKS = {
  0: '0%',
  25: '25%',
  50: '50%',
  75: '75%',
  90: '90%',
}
