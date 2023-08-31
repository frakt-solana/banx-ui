import { FC } from 'react'

import { SOLANAFM_URL } from '@banx/constants'
import { SolanaFM } from '@banx/icons'

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
