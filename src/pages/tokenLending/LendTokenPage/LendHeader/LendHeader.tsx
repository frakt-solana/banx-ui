import { OnboardButton } from '@banx/components/Buttons'
import { PageHeaderBackdrop } from '@banx/components/PageHeader'
import { TokenSwitcher } from '@banx/components/TokenSwitcher'

const LendHeader = () => {
  return (
    <PageHeaderBackdrop
      title="Lend"
      titleBtn={<OnboardButton contentType="lend" />}
      tokenSwitcher={<TokenSwitcher title="Lend" />}
    ></PageHeaderBackdrop>
  )
}

export default LendHeader