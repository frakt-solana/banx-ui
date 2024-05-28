import { OnboardButton } from '@banx/components/Buttons'
import { PageHeaderBackdrop } from '@banx/components/PageHeader'
import { TokenSwitcher } from '@banx/components/TokenSwitcher'

const LendHeader = () => {
  return (
    <PageHeaderBackdrop
      title="Lend"
      titleBtn={<OnboardButton contentType="lend" title="Lend" />}
      tokenSwitcher={<TokenSwitcher />}
    ></PageHeaderBackdrop>
  )
}

export default LendHeader
