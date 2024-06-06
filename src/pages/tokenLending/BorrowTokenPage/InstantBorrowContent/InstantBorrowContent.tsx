import { FC, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { LoanValueSlider, Separator } from '../components'
import InputTokenSelect from '../components/InputTokenSelect'
import {
  BORROW_MOCK_TOKENS_LIST,
  COLLATERAL_MOCK_TOKENS_LIST,
  MockTokenMetaType,
} from '../constants'

import styles from './InstantBorrowContent.module.less'

const MOCK_MAX_VALUE = '423000000'

const InstantBorrowContent = () => {
  const { connected } = useWallet()

  const [sliderValue, setSliderValue] = useState(100)

  const [collateralInputValue, setCollateralInputValue] = useState('')
  const [collateralToken, setCollateralToken] = useState<MockTokenMetaType>(
    COLLATERAL_MOCK_TOKENS_LIST[0],
  )

  const [borrowInputValue, setBorrowlInputValue] = useState('')
  const [borrowToken, setBorrowToken] = useState<MockTokenMetaType>(BORROW_MOCK_TOKENS_LIST[0])

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
        maxValue={MOCK_MAX_VALUE}
      />

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

      <LoanValueSlider value={sliderValue} onChange={setSliderValue} />

      <Summary apr={0.05} upfrontFee={0.001} weeklyInterest={0.01} />
      <Button disabled={!connected} className={styles.borrowButton}>
        {!connected ? 'Connect wallet to borrow' : 'Borrow'}
      </Button>
    </div>
  )
}

export default InstantBorrowContent

interface SummaryProps {
  apr: number
  upfrontFee: number
  weeklyInterest: number
}

export const Summary: FC<SummaryProps> = ({ apr, upfrontFee, weeklyInterest }) => {
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
        label="Est weekly fee"
        value={<DisplayValue value={weeklyInterest} />}
        tooltipText="Expected weekly interest on your loans. Interest is added to your debt balance"
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
