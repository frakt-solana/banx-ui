import { FC, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BN } from 'fbonds-core'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Loader } from '@banx/components/Loader'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
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
  calculateIdleFundsInOffer,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
} from '@banx/utils'

import { getCurrentLoanInfo } from '../../helpers'
import { useSelectedTokenLoans } from '../../loansState'
import OrderBook from './OrderBook'

import styles from './RefinanceTokenModal.module.less'

interface RefinanceTokenModalProps {
  loan: core.TokenLoan
}

const RefinanceTokenModal: FC<RefinanceTokenModalProps> = ({ loan }) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const { tokenType } = useNftTokenType()
  const { close: closeModal } = useModal()

  const { offers, updateOrAddOffer, isLoading } = useTokenMarketOffers(
    loan.fraktBond.hadoMarket || '',
  )

  const { update: updateLoansOptimistic } = useTokenLoansOptimistic()

  const { clear: clearSelection } = useSelectedTokenLoans()

  const refinance = async (offer: BondOfferV3, tokensToRefinance: BN) => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createBorrowTokenRefinanceTxnData(
        {
          loan,
          offer: convertBondOfferV3ToCore(offer),
          solToRefinance: tokensToRefinance,
          aprRate: offer.loanApr,
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
                bondTradeTransaction,
                fraktBond: {
                  ...fraktBond,
                  hadoMarket: params.loan.fraktBond.hadoMarket,
                },
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

  const { currentLoanDebt, currentLoanBorrowedAmount, currentApr } = getCurrentLoanInfo(loan)

  const filteredOffers = useMemo(() => {
    const loanDebt = caclulateBorrowTokenLoanValue(loan)

    return (
      chain(offers)
        //? Filter out user offers
        .filter((offer) => wallet?.publicKey?.toBase58() !== offer.assetReceiver.toBase58())
        //? Filter out offers that can't fully cover the loan debt
        .filter((offer) => loanDebt.lt(calculateIdleFundsInOffer(convertBondOfferV3ToCore(offer))))
        .sortBy((offer) => offer.validation.collateralsPerToken.toNumber())
        .value()
    )
  }, [offers, loan, wallet])

  return (
    <Modal open onCancel={closeModal} width={572} className={styles.refinanceModal}>
      {isLoading && <Loader />}
      {!isLoading && (
        <>
          <h4 className={styles.refinanceModalTitle}>Current loan</h4>

          <LoansInfoStats
            apr={currentApr}
            borrowedAmount={currentLoanBorrowedAmount}
            debt={currentLoanDebt}
          />

          <h4 className={styles.refinanceModalSubtitle}>New loan</h4>

          <OrderBook
            loan={loan}
            offers={filteredOffers}
            refinance={refinance}
            isLoading={isLoading}
          />
        </>
      )}
    </Modal>
  )
}

export default RefinanceTokenModal

interface LoansInfoStats {
  borrowedAmount: number //? lamports
  debt: number //? lamports
  apr: number //? base points
}

const LoansInfoStats: FC<LoansInfoStats> = ({ borrowedAmount, debt, apr }) => {
  const statsClassName = {
    container: styles.loanInfoStat,
    label: styles.loanInfoLabel,
    value: styles.loanInfoValue,
  }

  return (
    <div className={styles.loanInfoStats}>
      <StatInfo
        label="Borrowed"
        value={<DisplayValue value={borrowedAmount} />}
        classNamesProps={statsClassName}
      />
      <StatInfo
        label="APR"
        valueType={VALUES_TYPES.PERCENT}
        value={(apr + BONDS.PROTOCOL_REPAY_FEE) / 100}
        classNamesProps={statsClassName}
      />
      <StatInfo
        label="Debt"
        value={<DisplayValue value={debt} />}
        classNamesProps={statsClassName}
      />
    </div>
  )
}
