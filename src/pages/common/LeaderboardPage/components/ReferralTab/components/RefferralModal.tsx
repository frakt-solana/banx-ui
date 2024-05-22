import { ChangeEvent, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import { useWalletModal } from '@banx/components/WalletModal'
import { Modal } from '@banx/components/modals/BaseModal'

import { useReferralLink } from '@banx/hooks'
import { Cashback, Paste } from '@banx/icons'
import { useModal } from '@banx/store/common'
import { pasteFromClipboard } from '@banx/utils'

import Background from '../assets/Background.png'
import BanxImage from '../assets/Banx.png'
import { useSearchUserWallet } from '../hooks'
import { ReferralInput } from './ReferralInput'

import styles from '../ReferralTab.module.less'

export const RefferralModal = () => {
  const { connected } = useWallet()
  const { close } = useModal()
  const { toggleVisibility } = useWalletModal()

  const { onRefLink } = useReferralLink()

  const [inputValue, setInputValue] = useState('')

  //TODO: Add debounce
  const { data: referrerWallet } = useSearchUserWallet(inputValue)

  const onClickInputButton = async () => {
    const text = await pasteFromClipboard()
    setInputValue(text)
  }

  const onClickHandler = () => {
    if (!connected) {
      return toggleVisibility()
    }

    return onRefLink(inputValue)
  }

  const onChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
  }

  return (
    <Modal open onCancel={close} className={styles.modal} width={408}>
      <div
        className={styles.referralModalContent}
        style={{ backgroundImage: `url(${Background})` }}
      >
        <h4 className={styles.title}>Welcome to Banx</h4>
        <span className={styles.subtitle}>
          Banx is pioneering the NFT lending space on Solana as the only perpetual P2P NFT lending
          protocol, offering a true DeFi lending experience with benefits
        </span>

        <div className={styles.referralModalInfo}>
          <img className={styles.banxImage} src={BanxImage} />
          <div className={styles.referralModalInfoRows}>
            <div className={styles.referralModalInfoRow}>
              <Cashback />
              <span>For the first loan you will receive a 100% cashback in $BANX</span>
            </div>
            <div className={styles.referralModalInfoRow}>
              <Cashback />
              <span>You will receive 10% every time your referral pays upfront fee </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.referrerModalInfo}>
        <ReferralInput
          label="Add referrer code"
          value={inputValue}
          onChange={onChangeInput}
          actionButton={{ text: 'Paste', icon: Paste, onClick: onClickInputButton }}
        />

        <span className={styles.referrerWallet}>Referrer wallet: {referrerWallet}</span>

        <Button onClick={onClickHandler} className={styles.confirmButton}>
          {!connected ? 'Connect wallet' : 'LFG!'}
        </Button>

        <span className={styles.warningMessage}>
          Please be careful, this action cannot be canceled
        </span>
      </div>
    </Modal>
  )
}
