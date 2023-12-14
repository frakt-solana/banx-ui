import { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { chain, sortBy } from 'lodash'

import { InputCounter, InputErrorMessage, NumericInputField } from '@banx/components/inputs'

import { fetchLenderLoansByCertainOffer } from '@banx/api/core'
import { convertOffersToSimple } from '@banx/pages/BorrowPage/helpers'

import { BorrowerMessage } from '../components'
import { getUpdatedBondOffer } from '../helpers'
import { OfferParams } from '../hooks'
import { ActionsButtons, Summary } from './components'
import {
  convertLoanToMark,
  convertOfferToMark,
  convertSimpleOfferToMark,
} from './components/Diagram'
import Diagram from './components/Diagram/Diagram'

import styles from './PlaceOfferContent.module.less'

const PlaceOfferContent: FC<OfferParams> = ({
  loanValue,
  loansAmount,
  deltaValue,
  onLoanValueChange,
  onLoanAmountChange,
  onDeltaValueChange,
  onCreateOffer,
  onRemoveOffer,
  onUpdateOffer,
  isEditMode,
  offerSize,
  offerErrorMessage,
  hasFormChanges,
  marketPreview,
  optimisticOffer,
  syntheticOffer,
}) => {
  const { connected } = useWallet()
  const disabled = !connected

  const showBorrowerMessage = !offerErrorMessage && !!offerSize
  const disablePlaceOffer = !!offerErrorMessage || !offerSize
  const disableUpdateOffer = !hasFormChanges || !!offerErrorMessage || !offerSize

  const { lenderLoans } = useLenderLoans(syntheticOffer.publicKey)

  const diagramData = useMemo(() => {
    const loansQuantity = parseFloat(loansAmount)
    const loanValueNumber = parseFloat(loanValue)
    const deltaValueNumber = parseFloat(deltaValue)

    if (!isEditMode) {
      return chain(new Array(loansQuantity))
        .fill(loanValueNumber)
        .map((offerValue, index) => convertOfferToMark(offerValue, index, deltaValueNumber))
        .sortBy(({ loanValue }) => loanValue)
        .value()
    } else {
      if (!optimisticOffer) return

      const offer = hasFormChanges
        ? getUpdatedBondOffer({
            loanValue: loanValueNumber * 1e9,
            deltaValue: deltaValueNumber * 1e9,
            loansQuantity,
            syntheticOffer,
          })
        : optimisticOffer

      const loansToMarks = lenderLoans.map(convertLoanToMark)
      const simpleOffersToMarks = convertOffersToSimple([offer]).map(convertSimpleOfferToMark)

      return sortBy([...loansToMarks, ...simpleOffersToMarks], ({ loanValue }) => loanValue)
    }
  }, [
    lenderLoans,
    deltaValue,
    hasFormChanges,
    isEditMode,
    loanValue,
    loansAmount,
    optimisticOffer,
    syntheticOffer,
  ])

  return (
    <>
      <div className={styles.fields}>
        <NumericInputField
          label="Max offer"
          value={loanValue}
          onChange={onLoanValueChange}
          className={styles.numericField}
          disabled={disabled}
        />
        {onDeltaValueChange && (
          <NumericInputField
            label="Avg Delta"
            onChange={onDeltaValueChange}
            value={deltaValue}
            disabled={disabled}
            tooltipText="The average difference between loans taken from this pool given 100% utilization. For example: initialOffer: 1 SOL, delta 0.2 SOL, number of offers 2. The loans can be either the max 1, 0.8; or 0.2, 0.4, 0.4, 0,6, 0.1, 0.1. In both cases the average delta is 0.2. And the sum of loans is same"
          />
        )}
        <InputCounter
          label="Number of offers"
          onChange={onLoanAmountChange}
          value={loansAmount}
          disabled={disabled}
        />
      </div>
      <div className={styles.messageContainer}>
        {offerErrorMessage && <InputErrorMessage message={offerErrorMessage} />}
        {showBorrowerMessage && <BorrowerMessage loanValue={loanValue} />}
      </div>
      <Diagram marks={diagramData} />
      <Summary
        offer={optimisticOffer}
        isEditMode={isEditMode}
        offerSize={offerSize}
        market={marketPreview}
        loansQuantity={parseFloat(loansAmount)}
      />
      <ActionsButtons
        isEditMode={isEditMode}
        disableUpdateOffer={disableUpdateOffer}
        disablePlaceOffer={disablePlaceOffer}
        onUpdateOffer={onUpdateOffer}
        onCreateOffer={onCreateOffer}
        onRemoveOffer={onRemoveOffer}
      />
    </>
  )
}

export default PlaceOfferContent

export const useLenderLoans = (offerPubKey: string) => {
  const { publicKey } = useWallet()

  const { data, isLoading, refetch } = useQuery(
    ['lenderLoans', publicKey?.toBase58(), offerPubKey],
    () =>
      fetchLenderLoansByCertainOffer({ walletPublicKey: publicKey?.toBase58() || '', offerPubKey }),
    {
      staleTime: 60_000,
      refetchInterval: 5_000,
      refetchOnWindowFocus: false,
    },
  )

  const lenderLoans = useMemo(() => {
    if (!data) return []

    return data.flatMap(({ loans }) => loans)
  }, [data])

  return {
    data: data ?? [],
    lenderLoans,
    isLoading,
    refetch,
  }
}
