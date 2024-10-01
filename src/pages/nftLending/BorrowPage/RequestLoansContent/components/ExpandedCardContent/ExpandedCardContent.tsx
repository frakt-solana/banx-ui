import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import { ActivityTable } from '@banx/components/CommonTables'
import { MAX_BORROWER_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'
import { Tabs, useTabs } from '@banx/components/Tabs'
import { NumericStepInput } from '@banx/components/inputs'

import { core } from '@banx/api/nft'
import { DAYS_IN_YEAR } from '@banx/constants'
import { getTokenUnit } from '@banx/utils'

import RequestLoansTable from '../RequestLoansTable'
import { INPUT_TOKEN_STEP, TABS, TabName } from './constants'
import { useRequestLoansForm } from './hooks'

import styles from './ExpandedCardContent.module.less'

const ExpandedCardContent: FC<{ market: core.MarketPreview }> = ({ market }) => {
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
    disabledListAction,
    actionButtonText,
    lenderSeesLoanValue,
    lenderSeesAprValue,
  } = useRequestLoansForm(market)

  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: TABS,
    defaultValue: TabName.NFTS,
  })

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <div className={styles.fields}>
          <div className={styles.borrowFieldWrapper}>
            <NumericStepInput
              label="Borrow"
              value={inputLoanValue}
              onChange={handleChangeLoanValue}
              disabled={!connected || !nfts.length}
              placeholder="0"
              className={styles.selectCurrencyInput}
              step={INPUT_TOKEN_STEP[tokenType]}
              postfix={getTokenUnit(tokenType)}
            />

            <p className={styles.lenderSeesMessage}>
              {!!lenderSeesLoanValue && (
                <>Lender sees: {<DisplayValue value={lenderSeesLoanValue} />}</>
              )}
            </p>
          </div>
          <div className={styles.aprFieldWrapper}>
            <NumericStepInput
              label="Apr"
              value={inputAprValue}
              onChange={handleChangeAprValue}
              disabled={!connected || !nfts.length}
              placeholder="0"
              postfix="%"
              max={MAX_BORROWER_APR_VALUE}
              step={1}
            />
            <p className={styles.lenderSeesMessage}>
              {!!lenderSeesAprValue && (
                <>Lender sees: {createPercentValueJSX(lenderSeesAprValue)}</>
              )}
            </p>
          </div>
          <NumericStepInput
            label="Freeze"
            value={inputFreezeValue}
            onChange={handleChangeFreezeValue}
            disabled={!connected || !nfts.length}
            className={styles.freezeField}
            placeholder="0"
            postfix="d" //? d => days
            max={DAYS_IN_YEAR}
            tooltipText="Period during which loan can't be terminated"
            step={1}
          />
        </div>

        <div className={styles.actionsContainer}>
          <CounterSlider
            label="# NFTs"
            value={totalNftsToRequest}
            onChange={handleNftsSelection}
            rootClassName={styles.slider}
            className={styles.sliderContainer}
            max={nfts.length}
            disabled={!connected || !nfts.length}
          />
          <Button
            onClick={requestLoans}
            className={styles.mobileSubmitButton}
            disabled={disabledListAction}
          >
            {actionButtonText}
          </Button>
        </div>

        <Summary ltv={ltv} upfrontFee={upfrontFee} weeklyInterest={weeklyInterest} />

        <Button
          onClick={requestLoans}
          className={styles.submitButton}
          disabled={disabledListAction}
        >
          {actionButtonText}
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
          <ActivityTable
            marketPubkey={market.marketPubkey}
            classNamesProps={{ wrapper: styles.activityTableWrapper }}
            hideToggle
          />
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
  const statClassNames = {
    container: styles.statContainer,
    value: styles.fixedValueContent,
  }

  return (
    <div className={styles.summary}>
      <StatInfo
        label="LTV"
        value={ltv}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={statClassNames}
        tooltipText="The ratio of a loan value to the floor price of the collateral"
        flexType="row"
      />
      <StatInfo
        label="Upfront fee"
        value={<DisplayValue value={upfrontFee} />}
        classNamesProps={statClassNames}
        tooltipText="1% upfront fee charged on the loan principal amount, paid when loan is funded"
        flexType="row"
      />
      <StatInfo
        label="Weekly interest"
        value={<DisplayValue value={weeklyInterest} />}
        classNamesProps={statClassNames}
        tooltipText="Expected weekly interest on your loans. Interest is added to your debt balance"
        flexType="row"
      />
    </div>
  )
}
