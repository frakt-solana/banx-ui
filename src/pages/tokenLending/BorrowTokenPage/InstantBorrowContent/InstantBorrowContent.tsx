import { useState } from 'react'

import { Button } from '@banx/components/Buttons'

import InputTokenSelect from '../InputTokenSelect'
import { LtvSlider, Separator, Summary } from './components'
import {
  BORROW_MOCK_TOKENS_LIST,
  COLLATERAL_MOCK_TOKENS_LIST,
  MockTokenMetaType,
} from './constants'

import styles from './InstantBorrowContent.module.less'

const InstantBorrowContent = () => {
  const [sliderValue, setSliderValue] = useState(0)

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

      <Summary apr={0.05} upfrontFee={0.001} weeklyInterest={0.01} />
      <Button className={styles.borrowButton}>Borrow</Button>
    </div>
  )
}

export default InstantBorrowContent
