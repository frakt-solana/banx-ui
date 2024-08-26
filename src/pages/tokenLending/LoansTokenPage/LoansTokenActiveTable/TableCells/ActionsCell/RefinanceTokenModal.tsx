import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { Loader } from '@banx/components/Loader'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'
import { Modal } from '@banx/components/modals/BaseModal'

import { convertBondOfferV3ToCore } from '@banx/api/nft'
import { core } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'
import { useTokenMarketOffers } from '@banx/pages/tokenLending/LendTokenPage'
import { useModal } from '@banx/store/common'
import { useNftTokenType } from '@banx/store/nft'
import { useTokenLoansOptimistic } from '@banx/store/token'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateBorrowTokenRefinanceTxnDataParams,
  createBorrowTokenRefinanceTxnData,
  parseBorrowTokenRefinanceSimulatedAccounts,
} from '@banx/transactions/tokenLending'
import {
  convertToHumanNumber,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
  getDecimalPlaces,
  getTokenDecimals,
  getTokenUnit,
  isTokenLoanTerminating,
} from '@banx/utils'

import { useSelectedTokenLoans } from '../../loansState'
import OrderBook from './OrderBook'
import { useSelectedOffer } from './OrderBook/useSelectedOffers'
import { calculateTokenToGet, getCurrentLoanInfo } from './helpers'

import styles from './ActionsCell.module.less'

interface RefinanceTokenModalProps {
  loan: core.TokenLoan
}

export const RefinanceTokenModal: FC<RefinanceTokenModalProps> = ({ loan }) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const { tokenType } = useNftTokenType()
  const { close: closeModal } = useModal()

  const marketTokenDecimals = Math.log10(getTokenDecimals(tokenType)) //? 1e9 => 9, 1e6 => 6

  const { offers, updateOrAddOffer, isLoading } = useTokenMarketOffers(
    loan.fraktBond.hadoMarket || '',
  )

  const { update: updateLoansOptimistic } = useTokenLoansOptimistic()

  const { clear: clearSelection } = useSelectedTokenLoans()
  const { selection: selectedOffer } = useSelectedOffer()

  const { currentLoanDebt, currentLoanBorrowedAmount, currentApr } = getCurrentLoanInfo(loan)

  const tokensToRefinance = selectedOffer
    ? calculateTokenToGet({ offer: selectedOffer, loan, marketTokenDecimals }).toNumber()
    : 0

  const diff = tokensToRefinance - currentLoanDebt
  const upfrontFee = Math.max(diff / 100, 0)

  const newLoanBorrowedAmount = selectedOffer ? tokensToRefinance - upfrontFee : 0
  const newLoanDebt = tokensToRefinance
  const newApr = selectedOffer?.loanApr.toNumber() || 0

  const differenceToPay = tokensToRefinance - currentLoanDebt - upfrontFee

  const refinance = async () => {
    if (!selectedOffer) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createBorrowTokenRefinanceTxnData(
        {
          loan,
          offer: convertBondOfferV3ToCore(selectedOffer),
          solToRefinance: tokensToRefinance,
          aprRate: newApr,
          tokenType,
        },
        walletAndConnection,
      )

      await new TxnExecutor<CreateBorrowTokenRefinanceTxnDataParams>(
        walletAndConnection,
        TXN_EXECUTOR_DEFAULT_OPTIONS,
      )
        .addTxnData(txnData)
        .on('sentSome', (results) => {
          results.forEach(({ signature }) => enqueueTransactionSent(signature))
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }

          return confirmed.forEach(({ params, accountInfoByPubkey, signature }) => {
            if (accountInfoByPubkey && wallet?.publicKey) {
              enqueueSnackbar({
                message: 'Loan successfully refinanced',
                type: 'success',
                solanaExplorerPath: `tx/${signature}`,
              })

              const { bondOffer, bondTradeTransaction, fraktBond } =
                parseBorrowTokenRefinanceSimulatedAccounts(accountInfoByPubkey)

              const optimisticLoan = {
                ...params.loan,
                publicKey: fraktBond.publicKey,
                fraktBond: fraktBond,
                bondTradeTransaction,
              }

              updateOrAddOffer(bondOffer)
              updateLoansOptimistic([optimisticLoan], wallet.publicKey.toBase58())
              clearSelection()
              closeModal()
            }
          })
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: loan,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'RefinanceTokenBorrow',
      })
    }
  }

  return (
    <Modal open onCancel={closeModal}>
      {isLoading && <Loader />}
      {!isLoading && (
        <>
          <LoanInfo
            title="Current loan"
            borrowedAmount={currentLoanBorrowedAmount}
            debt={currentLoanDebt}
            apr={currentApr}
            className={styles.currentLoanInfo}
            faded
          />
          <LoanInfo
            title="New loan"
            borrowedAmount={newLoanBorrowedAmount}
            debt={newLoanDebt}
            apr={newApr}
            className={styles.newLoanInfo}
          />

          <LoanDifference
            difference={differenceToPay}
            tokenType={tokenType}
            className={styles.difference}
          />

          {/* <Slider
            label="Loan"
            value={partialPercent}
            onChange={onPartialPercentChange}
            className={styles.refinanceModalSlider}
            marks={DEFAULT_SLIDER_MARKS}
            min={10}
            max={100}
          /> */}

          <OrderBook loan={loan} offers={offers} isLoading={isLoading} />

          <Button
            className={styles.refinanceModalButton}
            onClick={refinance}
            disabled={!selectedOffer}
          >
            {isTokenLoanTerminating(loan) ? 'Extend' : 'Reborrow'}
          </Button>
        </>
      )}
    </Modal>
  )
}

// const DEFAULT_SLIDER_MARKS = {
//   10: '10%',
//   25: '25%',
//   50: '50%',
//   75: '75%',
//   100: '100%',
// }

interface LoanInfoProps {
  title: string
  borrowedAmount: number //? lamports
  debt: number //? lamports
  apr: number //? base points
  faded?: boolean //? Make gray text color
  className?: string
}

const LoanInfo: FC<LoanInfoProps> = ({ title, borrowedAmount, debt, apr, faded, className }) => {
  return (
    <div className={classNames(styles.loanInfo, faded && styles.loanInfoFaded, className)}>
      <h5 className={styles.loanInfoTitle}>{title}</h5>
      <div className={styles.loanInfoStats}>
        <div className={styles.loanInfoValue}>
          <p>
            <DisplayValue value={borrowedAmount} />
          </p>
          <p>Borrowed</p>
        </div>
        <div className={styles.loanInfoValue}>
          <p>{createPercentValueJSX((apr + BONDS.PROTOCOL_REPAY_FEE) / 100)}</p>
          <p>APR</p>
        </div>
        <div className={styles.loanInfoValue}>
          <p>
            <DisplayValue value={debt} />
          </p>
          <p>Debt</p>
        </div>
      </div>
    </div>
  )
}

interface LoanDifferenceProps {
  difference: number //? Integer representation of value
  tokenType: LendingTokenType
  className?: string
}

const LoanDifference: FC<LoanDifferenceProps> = ({ className, difference, tokenType }) => {
  const isDifferenceNegative = difference < 0

  const subtitle = isDifferenceNegative ? 'Difference you will pay' : 'Difference you will receive'

  const convertedValue = convertToHumanNumber(difference, tokenType)
  const tokenDecimalPlaces = getDecimalPlaces(convertedValue, tokenType)
  const tokenUnit = getTokenUnit(tokenType)

  return (
    <div className={classNames(styles.loanDifference, className)}>
      <p
        className={classNames(
          styles.loanDifferenceTitle,
          isDifferenceNegative && styles.loanDifferenceTitleRed,
        )}
      >
        {convertedValue?.toFixed(tokenDecimalPlaces)}
        {tokenUnit}
      </p>
      <p className={styles.loanDifferenceSubtitle}>{subtitle}</p>
    </div>
  )
}
