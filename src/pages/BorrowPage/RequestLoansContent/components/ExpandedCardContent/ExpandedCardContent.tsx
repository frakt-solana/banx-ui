import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import { Tabs, useTabs } from '@banx/components/Tabs'
import { NumericStepInput } from '@banx/components/inputs'

import { MarketPreview } from '@banx/api/core'
import { useTokenType } from '@banx/store'
import { getTokenUnit } from '@banx/utils'

import { DEFAULT_TAB_VALUE, INPUT_TOKEN_STEP, TABS, TabName } from './constants'
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
            onChange={setInputLoanValue}
            disabled={!connected}
            placeholder="0"
            postfix={getTokenUnit(tokenType)}
            step={INPUT_TOKEN_STEP[tokenType]}
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
      <div className={styles.tabsContent}>
        <Tabs value={currentTabValue} {...tabsProps} />
        {currentTabValue === TabName.NFTS && <></>}
        {currentTabValue === TabName.ACTIVITY && <></>}
      </div>
    </div>
  )
}

export default ExpandedCardContent
