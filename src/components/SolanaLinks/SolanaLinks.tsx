import { FC } from 'react'

import classNames from 'classnames'

import { BASE_TENSOR_URL, SOLANAFM_URL, TENSOR_MARKET_URL } from '@banx/constants'
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

type TensorLinkProps = {
  slug?: string
  mint?: string
  className?: string
}

export const TensorLink: FC<TensorLinkProps> = ({ slug, mint, className }) => {
  const urlPath = mint ? `${BASE_TENSOR_URL}item/${mint}` : `${TENSOR_MARKET_URL}${slug}`

  return (
    <a
      onClick={(event) => event.stopPropagation()}
      className={classNames(styles.tensorLink, className)}
      href={urlPath}
      target="_blank"
      rel="noopener noreferrer"
    >
      <TensorFilled />
    </a>
  )
}
