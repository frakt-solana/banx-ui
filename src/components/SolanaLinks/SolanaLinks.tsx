import { FC } from 'react'

import classNames from 'classnames'

import {
  BASE_DEXSCREENER_URL,
  BASE_TENSOR_URL,
  SOLANAFM_URL,
  TENSOR_MARKET_URL,
} from '@banx/constants'
import { Dexscreener, SolanaFM, TensorFilled } from '@banx/icons'

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

type DexscreenerLinkProps = {
  mint: string
  className?: string
}

export const DexscreenerLink: FC<DexscreenerLinkProps> = ({ mint, className }) => {
  const urlPath = `${BASE_DEXSCREENER_URL}/solana/${mint}`

  return (
    <a
      className={classNames(styles.dexscreenerLink, className)}
      onClick={(event) => event.stopPropagation()}
      target="_blank"
      rel="noopener noreferrer"
      href={urlPath}
    >
      <Dexscreener />
    </a>
  )
}
