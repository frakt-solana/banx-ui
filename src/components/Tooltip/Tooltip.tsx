import { FC } from 'react'

import { InfoCircleOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import RcTooltip from 'rc-tooltip'
import { TooltipProps as RcTooltipProps } from 'rc-tooltip/lib/Tooltip'

import styles from './Tooltip.module.less'
import 'rc-tooltip/assets/bootstrap_white.css'

interface TooltipProps extends RcTooltipProps {
  innerClassName?: string
}

const Tooltip: FC<TooltipProps> = ({ children, overlayClassName, innerClassName, ...props }) => (
  <RcTooltip
    {...props}
    arrowContent={null}
    overlayClassName={classNames(overlayClassName, styles['rcTooltipInner'])}
    getTooltipContainer={(triggerNode) => (triggerNode as HTMLElement).parentNode as HTMLElement}
  >
    {children || <InfoCircleOutlined className={classNames(styles.icon, innerClassName)} />}
  </RcTooltip>
)

export default Tooltip
