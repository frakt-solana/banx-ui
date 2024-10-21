import { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { Skeleton } from 'antd'
import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, isEmpty } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { createDisplayValueJSX } from '@banx/components/TableComponents'
import Timer from '@banx/components/Timer'

import { convertBondOfferV3ToCore } from '@banx/api/nft'
import { core } from '@banx/api/tokens'
import { useTokenMarketOffers } from '@banx/pages/tokenLending/LendTokenPage'
import { useTokenType } from '@banx/store/common'
import {
  caclulateBorrowTokenLoanValue,
  calculateIdleFundsInOffer,
  calculateLentTokenValueWithInterest,
  formatValueByTokenType,
  getTokenDecimals,
  getTokenUnit,
  isTokenLoanActive,
  isTokenLoanSelling,
  isTokenLoanTerminating,
} from '@banx/utils'

import { useTokenLenderLoansTransactions } from '../hooks'
import {
  calculateCollateralsPerTokenByLoan,
  calculateFreezeExpiredAt,
  checkIfFreezeExpired,
} from './helpers'

import styles from './ManageModal.module.less'

export const ClosureContent: FC<{ loan: core.TokenLoan }> = ({ loan }) => {
  const { publicKey } = useWallet()

  const marketPubkey = loan.fraktBond.hadoMarket || ''
  const {
    offers,
    updateOrAddOffer,
    isLoading: isLoadingOffers,
  } = useTokenMarketOffers(marketPubkey)

  const { instantTokenLoan, terminateTokenLoan, revertTerminateTokenLoan } =
    useTokenLenderLoansTransactions()

  const { tokenType } = useTokenType()

  const marketTokenDecimals = Math.log10(getTokenDecimals(tokenType)) //? 1e9 => 9, 1e6 => 6

  const bestOffer = useMemo(() => {
    const loanDebt = caclulateBorrowTokenLoanValue(loan)
    const maxCollateralsPerToken = calculateCollateralsPerTokenByLoan(loan, marketTokenDecimals)
    const loanApr = loan.bondTradeTransaction.amountOfBonds

    return (
      chain(offers)
        //? Filter out user offers
        .filter((offer) => offer.assetReceiver.toBase58() !== publicKey?.toBase58())
        //? Filter out offers that can't fully cover the loan debt
        .filter((offer) => loanDebt.lt(calculateIdleFundsInOffer(convertBondOfferV3ToCore(offer))))
        //? Filter out offers with an LTV lower than the loan LTV
        .filter((offer) => offer.validation.collateralsPerToken.lte(maxCollateralsPerToken))
        //? Filter out offers with an APR greater than the loan APR
        .filter((offer) => offer.loanApr.toNumber() <= loanApr)
        .sortBy((offer) => offer.loanApr.toNumber())
        .first()
        .value()
    )
  }, [loan, offers, marketTokenDecimals, publicKey])

  const isLoanActive = isTokenLoanActive(loan)
  const isLoanSelling = isTokenLoanSelling(loan)
  const isLoanTerminating = isTokenLoanTerminating(loan)

  const hasRefinanceOffer = !isEmpty(bestOffer)

  const canRefinance = hasRefinanceOffer && isLoanActive
  const canTerminate = !isLoanTerminating && !isLoanSelling && isLoanActive

  const freezeExpiredAt = calculateFreezeExpiredAt(loan)
  const isFreezeExpired = checkIfFreezeExpired(loan)

  const lentValue = calculateLentTokenValueWithInterest(loan).toNumber()

  const handleInstantLoan = async () => {
    await instantTokenLoan(loan, bestOffer, updateOrAddOffer)
  }

  return (
    <div className={styles.closureContent}>
      <ExitContentInfo
        exitValue={lentValue}
        onActionClick={handleInstantLoan}
        isLoading={isLoadingOffers}
        tokenType={tokenType}
        disabled={!canRefinance || !isFreezeExpired}
      />

      <ListLoanContentInfo
        onListActionClick={() => terminateTokenLoan(loan, false)}
        onDelistActionClick={() => revertTerminateTokenLoan(loan)}
        disabled={!canTerminate || !isFreezeExpired}
        isLoanSelling={isLoanSelling}
      />

      <TerminateContentInfo
        onActionClick={() => terminateTokenLoan(loan)}
        disabled={!canTerminate || !isFreezeExpired}
      />

      {!isFreezeExpired && <TimerContent expiredAt={freezeExpiredAt} />}
    </div>
  )
}

interface ExitContentInfoProps {
  onActionClick: () => Promise<void>
  disabled: boolean
  exitValue: number

  isLoading: boolean
  tokenType: LendingTokenType
}

const ExitContentInfo: FC<ExitContentInfoProps> = ({
  onActionClick,
  disabled,
  exitValue,
  isLoading,
  tokenType,
}) => {
  const tokenUnit = getTokenUnit(tokenType)

  const formattedExitValue = formatValueByTokenType(exitValue, tokenType)

  const displayExitValueJSX = !disabled ? (
    <div className={styles.exitValue}>
      Exit + {createDisplayValueJSX(formattedExitValue, tokenUnit)}
    </div>
  ) : (
    <>No offers</>
  )

  return (
    <div className={styles.closureContentInfo}>
      <div className={styles.closureContentTexts}>
        <h3>Exit</h3>
        <p>Instantly receive your total claim</p>
      </div>

      {isLoading && <Skeleton.Button className={styles.skeletonButton} />}

      {!isLoading && (
        <Button
          onClick={onActionClick}
          className={styles.actionButton}
          disabled={disabled}
          variant="secondary"
        >
          {displayExitValueJSX}
        </Button>
      )}
    </div>
  )
}

interface ListLoanContentInfo {
  onListActionClick: () => Promise<void>
  onDelistActionClick: () => Promise<void>
  isLoanSelling: boolean
  disabled: boolean
}

const ListLoanContentInfo: FC<ListLoanContentInfo> = ({
  onListActionClick,
  onDelistActionClick,
  isLoanSelling,
  disabled,
}) => {
  return (
    <div className={styles.closureContentInfo}>
      <div className={styles.closureContentTexts}>
        <h3>List loan</h3>
        <p>Receive your total claim after new lender funds loan</p>
      </div>

      {isLoanSelling && (
        <Button className={styles.actionButton} onClick={onDelistActionClick} variant="secondary">
          Delist
        </Button>
      )}

      {!isLoanSelling && (
        <Button
          className={styles.actionButton}
          onClick={onListActionClick}
          disabled={disabled}
          variant="secondary"
        >
          List
        </Button>
      )}
    </div>
  )
}

interface TerminateContentInfo {
  onActionClick: () => Promise<void>
  disabled: boolean
}

const TerminateContentInfo: FC<TerminateContentInfo> = ({ onActionClick, disabled }) => {
  return (
    <div className={styles.closureContentInfo}>
      <div className={styles.closureContentTexts}>
        <h3>Terminate</h3>
        <p>
          Send your loan to refinancing auction to seek new lenders. If successful you will receive
          repayment in escrow. If unsuccessful after 72 hours you will receive the collateral
          instead
        </p>
      </div>

      <Button
        className={classNames(styles.actionButton, styles.terminateButton)}
        onClick={onActionClick}
        disabled={disabled}
        variant="secondary"
      >
        Terminate
      </Button>
    </div>
  )
}

const TimerContent: FC<{ expiredAt: number }> = ({ expiredAt }) => (
  <div className={styles.freezeTimerWrapper}>
    Exit, list and termination are frozen for <Timer expiredAt={expiredAt} />
  </div>
)
