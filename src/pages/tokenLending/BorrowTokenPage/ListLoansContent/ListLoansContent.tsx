import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { PROTOCOL_FEE_TOKEN } from 'fbonds-core/lib/fbond-protocol/constants'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'
import { NumericStepInput } from '@banx/components/inputs'

import { DAYS_IN_YEAR } from '@banx/constants'
import { HealthColorIncreasing, getColorByPercent } from '@banx/utils'

import { Separator } from '../components'
import InputTokenSelect from '../components/InputTokenSelect'
import { useListLoansContent } from './hooks'

import styles from './ListLoansContent.module.less'

const ListLoansContent = () => {
  const { connected } = useWallet()

  const {
    collateralsList,
    borrowTokensList,

    listLoan,

    borrowToken,
    setBorrowToken,
    borrowInputValue,
    setBorrowlInputValue,

    collateralToken,
    setCollateralToken,
    collateralInputValue,
    setCollateralInputValue,

    inputAprValue,
    inputFreezeValue,

    handleChangeFreezeValue,
    handleChangeAprValue,

    lenderAprValue,

    errorMessage,

    ltvPercent,
    upfrontFee,
    weeklyFee,
  } = useListLoansContent()

  const displayMessage = errorMessage || (!connected ? 'Connect wallet' : 'List request')

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <InputTokenSelect
          label="Your collateral"
          value={collateralInputValue}
          onChange={setCollateralInputValue}
          selectedToken={collateralToken}
          onChangeToken={setCollateralToken}
          tokensList={collateralsList}
          className={styles.collateralInput}
        />

        <Separator />

        <InputTokenSelect
          label="To borrow"
          value={borrowInputValue}
          onChange={setBorrowlInputValue}
          selectedToken={borrowToken}
          onChangeToken={setBorrowToken}
          tokensList={borrowTokensList}
          className={styles.borrowInput}
        />

        <div className={styles.fields}>
          <div className={styles.aprFieldWrapper}>
            <NumericStepInput
              label="Apr"
              value={inputAprValue}
              onChange={handleChangeAprValue}
              disabled={!connected}
              placeholder="0"
              postfix="%"
              step={1}
            />

            <LenderAprMessage apr={lenderAprValue} />
          </div>

          <NumericStepInput
            label="Freeze"
            value={inputFreezeValue}
            onChange={handleChangeFreezeValue}
            disabled={!connected}
            placeholder="0"
            postfix="d"
            max={DAYS_IN_YEAR}
            tooltipText="Period during which loan can't be terminated"
            step={1}
          />
        </div>

        <Summary ltv={ltvPercent} upfrontFee={upfrontFee} weeklyFee={weeklyFee} />

        <Button
          onClick={listLoan}
          className={styles.actionButton}
          disabled={!connected || !!errorMessage}
        >
          {displayMessage}
        </Button>
      </div>
    </div>
  )
}

export default ListLoansContent
interface SummaryProps {
  ltv: number
  weeklyFee: number
  upfrontFee: number
}

const Summary: FC<SummaryProps> = ({ ltv, upfrontFee, weeklyFee }) => {
  const statClassNames = {
    value: styles.fixedStatValue,
  }

  const formattedLtv = ltv.toFixed(0)

  return (
    <div className={styles.summary}>
      <StatInfo
        label="LTV"
        value={formattedLtv}
        classNamesProps={statClassNames}
        valueType={VALUES_TYPES.PERCENT}
        valueStyles={{ color: ltv ? getColorByPercent(ltv, HealthColorIncreasing) : '' }}
        tooltipText="loan-to-value ratio across loans"
        flexType="row"
      />
      <StatInfo
        label="Upfront fee"
        value={upfrontFee}
        classNamesProps={statClassNames}
        tooltipText={`${
          PROTOCOL_FEE_TOKEN / 100
        }% upfront fee charged on the loan principal amount, paid when loan is funded`}
        valueType={VALUES_TYPES.PERCENT}
        flexType="row"
      />
      <StatInfo
        label="Weekly fee"
        value={<DisplayValue value={weeklyFee} />}
        classNamesProps={statClassNames}
        tooltipText="Weekly interest on your loan. Interest is added to your debt balance"
        flexType="row"
      />
    </div>
  )
}

const LenderAprMessage: FC<{ apr: number | null }> = ({ apr }) => {
  return (
    <p className={styles.lenderAprMessage}>
      {!!apr && <>Lender sees: {createPercentValueJSX(apr)}</>}
    </p>
  )
}
