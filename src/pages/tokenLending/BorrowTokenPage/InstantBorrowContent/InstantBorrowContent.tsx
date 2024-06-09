import { FC, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { useDebounceValue } from '@banx/hooks'
import { stringToHex } from '@banx/utils'

import { LoanValueSlider, Separator } from '../components'
import InputTokenSelect from '../components/InputTokenSelect'
import {
  BORROW_MOCK_TOKENS_LIST,
  BorrowCollateralType,
  COLLATERAL_TOKENS_LIST,
  DEFAULT_COLLATERAL_TOKEN,
} from '../constants'
import { useBorrowSplTokenOffers, useBorrowSplTokenTransaction } from './hooks'

import styles from './InstantBorrowContent.module.less'

const InstantBorrowContent = () => {
  const wallet = useWallet()

  const [sliderValue, setSliderValue] = useState(100)

  const [collateralInputValue, setCollateralInputValue] = useState('')
  const [collateralToken, setCollateralToken] =
    useState<BorrowCollateralType>(DEFAULT_COLLATERAL_TOKEN)

  const [borrowInputValue, setBorrowlInputValue] = useState('')
  const [borrowToken, setBorrowToken] = useState<BorrowCollateralType>(BORROW_MOCK_TOKENS_LIST[0])

  const debouncedInputValue = useDebounceValue(collateralInputValue, 1000)

  const { data: splTokenOffers } = useBorrowSplTokenOffers({
    market: collateralToken.marketPubkey || '',
    outputToken: borrowToken.ticker,
    type: 'input',
    amount: stringToHex(debouncedInputValue),
  })

  const { executeBorrow } = useBorrowSplTokenTransaction(collateralToken, splTokenOffers)

  return (
    <div className={styles.content}>
      <InputTokenSelect
        label="Collateralize"
        value={collateralInputValue}
        onChange={setCollateralInputValue}
        selectedToken={collateralToken}
        onChangeToken={setCollateralToken}
        tokenList={COLLATERAL_TOKENS_LIST}
        className={styles.collateralInput}
        maxValue="0"
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

      <LoanValueSlider label="Loan value" value={sliderValue} onChange={setSliderValue} />

      <Summary apr={0.05} upfrontFee={0.001} weeklyInterest={0.01} />
      <Button onClick={executeBorrow} disabled={!wallet.connected} className={styles.borrowButton}>
        {!wallet.connected ? 'Connect wallet to borrow' : 'Borrow'}
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
