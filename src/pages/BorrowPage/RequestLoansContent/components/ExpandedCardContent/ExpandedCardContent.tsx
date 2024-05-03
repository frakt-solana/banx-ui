import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

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
import { ChevronDown, SOL, USDC } from '@banx/icons'
import { isSolTokenType } from '@banx/utils'

import RequestLoansTable from '../RequestLoansTable'
import { INPUT_TOKEN_STEP, TABS, TabName } from './constants'
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
    disabledListAction,
    actionButtonText,
    lenderSeesLoanValue,
  } = useRequestLoansForm(market)

  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: TABS,
    defaultValue: TabName.NFTS,
  })

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <Summary ltv={ltv} upfrontFee={upfrontFee} weeklyInterest={weeklyInterest} />

        <div className={styles.fields}>
          <div className={styles.selectCurrencyField}>
            <SelectCurrencyInput
              label="Borrow"
              value={inputLoanValue}
              onChange={handleChangeLoanValue}
              disabled={!connected || !nfts.length}
              tokenType={tokenType}
            />
            <p className={styles.lenderSeesMessage}>
              {!!inputLoanValue && <>Lender sees: {<DisplayValue value={lenderSeesLoanValue} />}</>}
            </p>
          </div>

          <NumericStepInput
            label="Freeze"
            value={inputFreezeValue}
            onChange={handleChangeFreezeValue}
            disabled={!connected || !nfts.length}
            className={styles.field}
            placeholder="0"
            postfix="d" //? d => days
            max={DAYS_IN_YEAR}
            tooltipText="Period during which loan can't be terminated"
            step={1}
          />
          <NumericStepInput
            label="Apr"
            value={inputAprValue}
            onChange={handleChangeAprValue}
            disabled={!connected || !nfts.length}
            className={styles.field}
            placeholder="0"
            postfix="%"
            max={MAX_APR_VALUE}
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
            className={styles.submitButton}
            disabled={disabledListAction}
          >
            {actionButtonText}
          </Button>
        </div>
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

interface SelectCurrencyInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  disabled: boolean
  tokenType: LendingTokenType
}

//? Without the ability to select a token, it will be added in the future
const SelectCurrencyInput: FC<SelectCurrencyInputProps> = ({
  label,
  value,
  onChange,
  disabled,
  tokenType,
}) => {
  const isSol = isSolTokenType(tokenType)

  const tokenTicker = isSol ? 'SOL' : 'USDC'
  const Icon = isSol ? SOL : USDC

  return (
    <div className={styles.selectCurrencyWrapper}>
      <div className={styles.selectCurrencyInfo}>
        <Icon />
        <span>{tokenTicker}</span>
        <ChevronDown className={styles.chevronIcon} />
      </div>
      <NumericStepInput
        label={label}
        value={value}
        onChange={onChange}
        placeholder="0"
        disabled={disabled}
        className={styles.selectCurrencyInput}
        step={INPUT_TOKEN_STEP[tokenType]}
      />
    </div>
  )
}
