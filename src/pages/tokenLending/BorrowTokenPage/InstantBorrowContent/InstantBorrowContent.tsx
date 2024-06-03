import { useState } from 'react'

import { Button } from '@banx/components/Buttons'

import { LtvSlider, Separator, Summary } from './components'

import styles from './InstantBorrowContent.module.less'

const InstantBorrowContent = () => {
  const [sliderValue, setSliderValue] = useState(0)

  return (
    <div className={styles.content}>
      <LtvSlider value={sliderValue} onChange={setSliderValue} />

      <Separator />

      <Summary apr={0.05} upfrontFee={0.001} weeklyInterest={0.01} />
      <Button className={styles.borrowButton}>Borrow</Button>
    </div>
  )
}

export default InstantBorrowContent
