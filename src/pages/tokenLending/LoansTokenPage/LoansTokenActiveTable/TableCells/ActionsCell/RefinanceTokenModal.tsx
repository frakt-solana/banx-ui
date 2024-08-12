import { FC, useEffect, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, map, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { Loader } from '@banx/components/Loader'
import { Slider } from '@banx/components/Slider'
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
  caclulateBorrowTokenLoanValue,
  calculateApr,
  calculateIdleFundsInOffer,
  calculateTokenLoanValueWithUpfrontFee,
  convertToHumanNumber,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
  filterOutWalletLoans,
  findSuitableOffer,
  getDecimalPlaces,
  getTokenUnit,
  isTokenLoanTerminating,
} from '@banx/utils'

import { useSelectedTokenLoans } from '../../loansState'

import styles from './ActionsCell.module.less'

interface RefinanceTokenModalProps {
  loan: core.TokenLoan
}

//TODO (TokenLending): Write new logic to find cuitable offer
//? You can ignore this file

export const RefinanceTokenModal: FC<RefinanceTokenModalProps> = ({ loan }) => {
  const { bondTradeTransaction, fraktBond } = loan

  const wallet = useWallet()
  const { connection } = useConnection()

  const { close } = useModal()
  const { tokenType } = useNftTokenType()

  const { offers, updateOrAddOffer, isLoading } = useTokenMarketOffers(fraktBond.hadoMarket || '')

  const bestOffer = useMemo(() => {
    return (
      chain(offers)
        .sortBy(({ validation }) => validation.collateralsPerToken)
        .thru((offers) =>
          filterOutWalletLoans({
            offers: map(offers, convertBondOfferV3ToCore),
            walletPubkey: wallet?.publicKey?.toBase58(),
          }),
        )
        // .filter(isOfferNotEmpty)
        .value()
        .at(0)
    )
  }, [offers, wallet])

  const initialCurrentSpotPrice = useMemo(() => {
    if (!bestOffer) return 0
    return calculateIdleFundsInOffer(bestOffer).toNumber()
  }, [bestOffer])

  useEffect(() => {
    setCurrentSpotPrice(initialCurrentSpotPrice)
  }, [initialCurrentSpotPrice])

  const { update: updateLoansOptimistic } = useTokenLoansOptimistic()
  const { clear: clearSelection } = useSelectedTokenLoans()

  const isLoanTerminating = isTokenLoanTerminating(loan)

  const [partialPercent, setPartialPercent] = useState<number>(100)
  const [currentSpotPrice, setCurrentSpotPrice] = useState<number>(initialCurrentSpotPrice)

  const onPartialPercentChange = (percentValue: number) => {
    setPartialPercent(percentValue)
    setCurrentSpotPrice(Math.max(Math.floor((initialCurrentSpotPrice * percentValue) / 100), 1000))
  }

  const currentLoanDebt = caclulateBorrowTokenLoanValue(loan).toNumber()
  const currentLoanBorrowedAmount = calculateTokenLoanValueWithUpfrontFee(loan).toNumber()
  const currentApr = bondTradeTransaction.amountOfBonds

  //? Upfron fee on reborrow is calculated: (newDebt - prevDebt) / 100
  const upfrontFee = Math.max((currentSpotPrice - currentLoanDebt) / 100, 0)

  const newLoanBorrowedAmount = currentSpotPrice - upfrontFee
  const newLoanDebt = currentSpotPrice

  const newApr = calculateApr({
    loanValue: newLoanBorrowedAmount,
    collectionFloor: loan.collateralPrice,
    marketPubkey: fraktBond.hadoMarket,
  })

  const differenceToPay = newLoanDebt - currentLoanDebt - upfrontFee

  const refinance = async () => {
    if (!bestOffer) return

    const suitableOffer = chain(offers)
      .thru((offers) =>
        filterOutWalletLoans({
          offers: map(offers, convertBondOfferV3ToCore),
          walletPubkey: wallet?.publicKey?.toBase58(),
        }),
      )
      .thru((offers) =>
        findSuitableOffer({
          loanValue: currentSpotPrice,
          offers,
        }),
      )
      .value()

    if (!suitableOffer) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createBorrowTokenRefinanceTxnData(
        {
          loan,
          offer: suitableOffer,
          solToRefinance: currentSpotPrice,
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
              close()
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
    <Modal open onCancel={close}>
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

          <Slider
            label="Loan"
            value={partialPercent}
            onChange={onPartialPercentChange}
            className={styles.refinanceModalSlider}
            marks={DEFAULT_SLIDER_MARKS}
            min={10}
            max={100}
          />

          <Button className={styles.refinanceModalButton} onClick={refinance} disabled={!bestOffer}>
            {isLoanTerminating ? 'Extend' : 'Reborrow'}
          </Button>
        </>
      )}
    </Modal>
  )
}

const DEFAULT_SLIDER_MARKS = {
  10: '10%',
  25: '25%',
  50: '50%',
  75: '75%',
  100: '100%',
}

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
