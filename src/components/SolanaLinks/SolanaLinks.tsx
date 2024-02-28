import { FC } from 'react'

import { SOLANAFM_URL, TENSOR_MARKET_URL } from '@banx/constants'
import { SolanaFM, TensorFilled } from '@banx/icons'

import { Button, ButtonProps } from '../Buttons'

import styles from './SolanaLinks.module.less'

interface SolanaFMLink extends ButtonProps {
  path: string
}

export const SolanaFMLink: FC<SolanaFMLink> = ({ path, ...props }) => {
  return (
    <a target="_blank" rel="noopener noreferrer" href={`${SOLANAFM_URL}${path}`}>
      <Button type="circle" variant="secondary" {...props}>
        <img className={styles.solanaFMIcon} src={SolanaFM} />
      </Button>
    </a>
  )
}

interface TensorLinkProps {
  slug: string
}

export const TensorLink: FC<TensorLinkProps> = ({ slug }) => {
  return (
    <a
      onClick={(event) => event.stopPropagation()}
      className={styles.tensorLink}
      href={`${TENSOR_MARKET_URL}${slug}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <TensorFilled />
    </a>
  )
}
