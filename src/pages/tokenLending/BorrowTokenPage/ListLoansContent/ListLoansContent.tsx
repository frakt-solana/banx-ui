import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import { MAX_BORROWER_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'
import { NumericStepInput } from '@banx/components/inputs'

import { DAYS_IN_YEAR } from '@banx/constants'

import { LtvSlider, Separator } from '../components'
import InputTokenSelect from '../components/InputTokenSelect'
import { BORROW_MOCK_TOKENS_LIST, COLLATERAL_MOCK_TOKENS_LIST } from '../constants'
import { useListLoansContent } from './hooks'

import styles from './ListLoansContent.module.less'

const ListLoansContent = () => {
  const { connected } = useWallet()

  const {
    borrowToken,
    setBorrowToken,
    borrowInputValue,
    setBorrowlInputValue,

    collateralToken,
    setCollateralToken,
    collateralInputValue,
    setCollateralInputValue,

    sliderValue,
    inputAprValue,
    inputFreezeValue,

    setSliderValue,
    handleChangeFreezeValue,
    handleChangeAprValue,

    lenderSeesAprValue,
  } = useListLoansContent()

  return (
    <div className={styles.content}>
      <InputTokenSelect
        label="Collateralize"
        value={collateralInputValue}
        onChange={setCollateralInputValue}
        selectedToken={collateralToken}
        onChangeToken={setCollateralToken}
        tokenList={COLLATERAL_MOCK_TOKENS_LIST}
        className={styles.collateralInput}
      />

      <LtvSlider value={sliderValue} onChange={setSliderValue} />

      <Separator />

      <InputTokenSelect
        label="To borrow"
        value={borrowInputValue}
        onChange={setBorrowlInputValue}
        selectedToken={borrowToken}
        onChangeToken={setBorrowToken}
        tokenList={BORROW_MOCK_TOKENS_LIST}
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
            max={MAX_BORROWER_APR_VALUE}
            step={1}
          />
          <p className={styles.lenderSeesMessage}>
            {!!lenderSeesAprValue && <>Lender sees: {createPercentValueJSX(lenderSeesAprValue)}</>}
          </p>
        </div>

        <NumericStepInput
          label="Freeze"
          value={inputFreezeValue}
          onChange={handleChangeFreezeValue}
          disabled={!connected}
          placeholder="0"
          postfix="d" //? d => days
          max={DAYS_IN_YEAR}
          tooltipText="Period during which loan can't be terminated"
          step={1}
        />
      </div>

      <Summary apr={0.05} upfrontFee={0.001} />
      <Button className={styles.borrowButton}>List request</Button>
    </div>
  )
}

export default ListLoansContent
interface SummaryProps {
  apr: number
  upfrontFee: number
}

export const Summary: FC<SummaryProps> = ({ apr, upfrontFee }) => {
  const statClassNames = {
    value: styles.fixedStatValue,
  }

  return (
    <div className={styles.summary}>
      <StatInfo
        label="Upfront fee"
        value={<DisplayValue value={upfrontFee} />}
        tooltipText="1% upfront fee charged on the loan principal amount, paid when loan is funded"
        classNamesProps={statClassNames}
        flexType="row"
      />
      <StatInfo
        label="APR"
        value={apr}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={statClassNames}
        flexType="row"
      />
    </div>
  )
}
