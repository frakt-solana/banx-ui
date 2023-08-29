import { FC } from 'react'

import { SolanaFM } from '@banx/icons'

import { Button, ButtonProps } from '../Buttons'

import styles from './SolanaLinks.module.less'

interface SolanaNftButtonLinkProps extends ButtonProps {
  nftMint: string
}

export const SolanaNftButtonLink: FC<SolanaNftButtonLinkProps> = ({ nftMint, ...props }) => {
  return (
    <a target="_blank" rel="noopener noreferrer" href={`https://solana.fm/address/${nftMint}`}>
      <Button type="circle" variant="secondary" {...props}>
        <img className={styles.solanaFMIcon} src={SolanaFM} />
      </Button>
    </a>
  )
}
