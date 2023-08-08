import { FC, PropsWithChildren } from 'react'

import { InfoCircleOutlined } from '@ant-design/icons'
import { Tooltip as AntdTooltip, TooltipProps as AntdTooltipProps } from 'antd'

import styles from './Tooltip.module.less'

const Tooltip: FC<PropsWithChildren<AntdTooltipProps>> = ({ children, ...props }) => (
  <AntdTooltip
    {...props}
    arrowContent={null}
    getTooltipContainer={(triggerNode) => (triggerNode as HTMLElement).parentNode as HTMLElement}
  >
    {children || <InfoCircleOutlined className={styles.icon} />}
  </AntdTooltip>
)

export default Tooltip
