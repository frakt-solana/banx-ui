import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import { NumericStepInput } from '@banx/components/inputs'

import { MarketPreview } from '@banx/api/core'
import { useTokenType } from '@banx/store'
import { getTokenUnit, isSolTokenType } from '@banx/utils'

import { useRequestLoansForm } from './hooks'

import styles from './ExpandedCardContent.module.less'

const ExpandedCardContent: FC<{ market: MarketPreview }> = ({ market }) => {
  const { connected } = useWallet()
  const { tokenType } = useTokenType()

  const {
    inputLoanValue,
    inputAprValue,
    inputFreezeValue,
    setInputLoanValue,
    setInputAprValue,
    setInputFreezeValue,
    loanToValuePercent,
  } = useRequestLoansForm(market)

  const inputStepByTokenType = isSolTokenType(tokenType) ? 0.1 : 1

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <div className={styles.fields}>
          <NumericStepInput label="Currency" value="" onChange={() => null} />
          <NumericStepInput
            label="Borrow"
            value={inputLoanValue}
            onChange={setInputLoanValue}
            disabled={!connected}
            placeholder="0"
            postfix={getTokenUnit(tokenType)}
            step={inputStepByTokenType}
          />
          <NumericStepInput
            label="Apr"
            value={inputAprValue}
            onChange={setInputAprValue}
            disabled={!connected}
            placeholder="104"
            postfix="%"
            step={1}
          />
          <NumericStepInput
            label="Freeze"
            value={inputFreezeValue}
            onChange={setInputFreezeValue}
            disabled={!connected}
            placeholder="14"
            postfix="D" //? D => Days
            step={1}
          />
          <CounterSlider
            label="# NFTs"
            value={10} //? nftsInCart.length
            onChange={() => null} //? selectAmount
            rootClassName={styles.slider}
            className={styles.sliderContainer}
            // max={maxBorrowAmount}
          />
        </div>
        <div className={styles.summary}>
          <StatInfo
            label="LTV"
            value={loanToValuePercent}
            valueType={VALUES_TYPES.PERCENT}
            flexType="row"
          />
          <StatInfo label="Upfront fee" value={<DisplayValue value={10} />} flexType="row" />
          <StatInfo label="Weekly interest" value={<DisplayValue value={10} />} flexType="row" />
        </div>
        <Button className={styles.submitButton}>List 3 requests</Button>
      </div>
    </div>
  )
}

export default ExpandedCardContent
