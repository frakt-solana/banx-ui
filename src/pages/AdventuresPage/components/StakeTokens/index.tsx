import {Modal} from "@banx/components/modals/BaseModal";
import {FC, useState} from "react";
import {useModal} from "@banx/store";
import {Tab, Tabs, useTabs} from '@banx/components/Tabs'

import {Button} from "@banx/components/Buttons";
import NumericInput from "@banx/components/inputs/NumericInput";
import styles from './styled.module.less'
import {BanxLogo} from "@banx/icons";
import {useBanxTokenSettings} from "@banx/pages/AdventuresPage/hooks/useBanxTokenSettings";
import {formatNumbersWithCommas} from "@banx/utils";

interface Props {
}

export const StakeTokens: FC<Props> = () => {
  const {close} = useModal()
  const format = formatNumbersWithCommas
  const [value, setValue] = useState('')
  const { banxTokenSettings} = useBanxTokenSettings()

  const {value: currentTabValue, ...tabProps} = useTabs({
    tabs: MODAL_TABS,
    defaultValue: MODAL_TABS[0].value,
  })

  const willReceive = banxTokenSettings?.tokensPerPartnerPoints && Number(value) * 1e8 / banxTokenSettings?.tokensPerPartnerPoints

  // value * 1e8 / tokensPerPartnerPoints  - stake

  return (
    <Modal className={styles.modal} open onCancel={close} footer={false} width={572} centered>
      <Tabs value={currentTabValue} {...tabProps} />
      <div className={styles.container}>

        {currentTabValue === ModalTabs.STAKE && (
          <div className={styles.row}>
            <span className={styles.uppercaseText}>wallet balance</span>
            <span className={styles.valueText}>12.5M</span>
            <BanxLogo/>
          </div>
        )}

        {currentTabValue === ModalTabs.UNSTAKE && (
          <div className={styles.row}>
            <span className={styles.uppercaseText}>total staked</span>
            <span className={styles.valueText}>12.5M</span>
            <BanxLogo/>
            <span className={styles.valueText}>12,000 pts</span>
          </div>
        )}

        <div className={styles.input}>
          <NumericInput positiveOnly onChange={setValue} value={value}/>
          <Button
            size="small"
            variant={'secondary'}
          >
            Use max
          </Button>
        </div>

        {currentTabValue === ModalTabs.STAKE && (
          <>
            <div className={styles.row__btw}>
              <span className={styles.uppercaseText}>idle on wallet</span>
              <div>
                <span className={styles.valueText}>11,500,000</span>
                <BanxLogo/>
              </div>
            </div>

            <div className={styles.row__btw}>
              <span className={styles.uppercaseText}>you will get</span>
              <div>
                <span className={styles.valueText}>{format(willReceive || 0)} pts</span>
              </div>
            </div>
          </>
        )}

        {currentTabValue === ModalTabs.UNSTAKE && (
          <>
            <div className={styles.row__btw}>
              <span className={styles.uppercaseText}>staked</span>
              <div>
                <span className={styles.valueText}>11,500,000</span>
                <BanxLogo/>
              </div>
            </div>

            <div className={styles.row__btw}>
              <span className={styles.uppercaseText}>you will unstake</span>
              <div>
                <span className={styles.valueText}>1,000 pts</span>
              </div>
            </div>
          </>
        )}

        <Button size="default" variant={'primary'} className={styles.btn}>
          Stake
        </Button>
      </div>
    </Modal>
  )
}

enum ModalTabs {
  STAKE = 'stake',
  UNSTAKE = 'unstake',
}

const MODAL_TABS: Tab[] = [
  {
    label: 'Stake',
    value: 'stake',
  },
  {
    label: 'Unstake',
    value: 'unstake',
  },
]
