import { Component, ErrorInfo, FC, ReactNode } from 'react'

import { Button } from '@banx/components/Buttons'

import sadPepeImg from '@banx/assets/SadPepe.png'
import { DISCORD } from '@banx/constants'
import { copyToClipboard } from '@banx/utils'

import styles from './ErrorBoundary.module.less'

interface Props {
  children?: ReactNode
}

interface State {
  error?: SolanaError
}

interface SolanaError extends Error {
  logs?: Array<string>
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    error: undefined,
  }

  public static getDerivedStateFromError(error: SolanaError): State {
    // Update state so the next render will show the fallback UI.
    return { error }
  }

  public componentDidCatch(error: SolanaError, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.error) {
      return <ErrorPlaceholder error={this.state.error} />
    }

    return this.props.children
  }
}

interface ErrorPlaceholderProps {
  error: SolanaError
}
const ErrorPlaceholder: FC<ErrorPlaceholderProps> = ({ error }) => {
  const errorText = [error.name, error.message, error?.logs?.join('\n')].filter(Boolean).join('\n')

  const onBtnClick = () => copyToClipboard(errorText)

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <img className={styles.image} src={sadPepeImg} alt="Sad Pepe" />
        <h1 className={styles.title}>{`Something's crushed. But we'll fix that ASAP`}</h1>
        <h2 className={styles.subtitle}>
          You can create a support ticket on{' '}
          <a
            href={DISCORD.SERVER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.discordLink}
          >
            our discord server
          </a>{' '}
          and send us this error text
        </h2>
        <pre className={styles.errorMessage}>{errorText}</pre>
        <Button onClick={onBtnClick}>Copy all</Button>
      </div>
    </div>
  )
}
