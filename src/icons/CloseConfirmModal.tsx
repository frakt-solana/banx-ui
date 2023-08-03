import { FC, SVGProps } from 'react'

export const CloseConfirmModal: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" {...props}>
    <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" />
    <path
      d="M20.5 11.5L11.5 20.5"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.5 11.5L20.5 20.5"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#AEAEB2" />
  </svg>
)
