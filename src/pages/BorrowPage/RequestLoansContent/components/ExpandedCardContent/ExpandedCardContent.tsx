import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import ActivityTable from '@banx/components/CommonTables'
import { MAX_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import { Tabs, useTabs } from '@banx/components/Tabs'
import { NumericStepInput } from '@banx/components/inputs'

import { MarketPreview } from '@banx/api/core'
import { DAYS_IN_YEAR } from '@banx/constants'
import { getTokenUnit } from '@banx/utils'

import RequestLoansTable from '../RequestLoansTable'
import { DEFAULT_TAB_VALUE, INPUT_TOKEN_STEP, TABS, TabName } from './constants'
import { useRequestLoansForm } from './hooks'

import styles from './ExpandedCardContent.module.less'

const ExpandedCardContent: FC<{ market: MarketPreview }> = ({ market }) => {
  const { connected } = useWallet()

  const {
    inputLoanValue,
    inputAprValue,
    inputFreezeValue,
    handleChangeLoanValue,
    handleChangeAprValue,
    handleChangeFreezeValue,
    handleNftsSelection,
    requestedLoanValue,
    totalNftsToRequest,
    nfts,
    isLoadingNfts,
    ltv,
    upfrontFee,
    weeklyInterest,
    tokenType,
    requestLoans,
    disabledListRequest,
  } = useRequestLoansForm(market)

  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: TABS,
    defaultValue: DEFAULT_TAB_VALUE,
  })

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <div className={styles.fields}>
          <NumericStepInput label="Currency" value="" onChange={() => null} />
          <NumericStepInput
            label="Borrow"
            value={inputLoanValue}
            onChange={handleChangeLoanValue}
            disabled={!connected || !nfts.length}
            placeholder="0"
            postfix={getTokenUnit(tokenType)}
            step={INPUT_TOKEN_STEP[tokenType]}
          />
          <NumericStepInput
            label="Apr"
            value={inputAprValue}
            onChange={handleChangeAprValue}
            disabled={!connected || !nfts.length}
            placeholder="0"
            postfix="%"
            max={MAX_APR_VALUE}
            step={1}
          />
          <NumericStepInput
            label="Freeze"
            value={inputFreezeValue}
            onChange={handleChangeFreezeValue}
            disabled={!connected || !nfts.length}
            placeholder="0"
            postfix="D" //? D => Days
            max={DAYS_IN_YEAR}
            step={1}
          />
          <CounterSlider
            label="# NFTs"
            value={totalNftsToRequest}
            onChange={handleNftsSelection}
            rootClassName={styles.slider}
            className={styles.sliderContainer}
            max={nfts.length}
            disabled={!connected || !nfts.length}
          />
        </div>

        <Summary ltv={ltv} upfrontFee={upfrontFee} weeklyInterest={weeklyInterest} />

        <Button
          onClick={requestLoans}
          className={styles.submitButton}
          disabled={disabledListRequest}
        >
          List {totalNftsToRequest <= 1 ? 'request' : `${totalNftsToRequest} requests`}
        </Button>
      </div>

      <div className={styles.tabsContent}>
        <Tabs value={currentTabValue} {...tabsProps} />
        {currentTabValue === TabName.NFTS && (
          <RequestLoansTable
            nfts={nfts}
            isLoading={isLoadingNfts}
            requestedLoanValue={requestedLoanValue}
          />
        )}
        {currentTabValue === TabName.ACTIVITY && (
          <ActivityTable marketPubkey={market.marketPubkey} />
        )}
      </div>
    </div>
  )
}

export default ExpandedCardContent

interface SummaryProps {
  ltv: number
  upfrontFee: number
  weeklyInterest: number
}

const Summary: FC<SummaryProps> = ({ ltv, upfrontFee, weeklyInterest }) => {
  return (
    <div className={styles.summary}>
      <StatInfo label="LTV" value={ltv} valueType={VALUES_TYPES.PERCENT} flexType="row" />
      <StatInfo label="Upfront fee" value={<DisplayValue value={upfrontFee} />} flexType="row" />
      <StatInfo
        label="Weekly interest"
        value={<DisplayValue value={weeklyInterest} />}
        flexType="row"
      />
    </div>
  )
}
