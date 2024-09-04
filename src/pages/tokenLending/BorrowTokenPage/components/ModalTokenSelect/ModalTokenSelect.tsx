import { Modal } from '@banx/components/modals/BaseModal'

import { core } from '@banx/api/tokens'
import { useModal } from '@banx/store/common'

import { TokenListItem } from './components'

import styles from './ModalTokenSelect.module.less'

export interface BaseToken {
  collateral: core.TokenMeta
  amountInWallet: number
}

interface ModalTokenSelectProps<T extends BaseToken> {
  onChangeToken: (option: T) => void
  selectedToken: T
  tokenList: T[]
}

const ModalTokenSelect = <T extends BaseToken>({
  tokenList,
  onChangeToken,
}: ModalTokenSelectProps<T>) => {
  const { close: closeModal } = useModal()

  return (
    <Modal className={styles.modal} open width={468} onCancel={closeModal}>
      <div className={styles.flexCol}>
        <div className={styles.tokensListLabels}>
          <span>Token</span>
          <span>Available</span>
        </div>
        <div className={styles.tokensList}>
          {tokenList.map((token) => (
            <TokenListItem
              key={token.collateral.mint}
              token={token}
              onClick={() => {
                onChangeToken(token)
                closeModal()
              }}
            />
          ))}
        </div>
      </div>
    </Modal>
  )
}

export default ModalTokenSelect
