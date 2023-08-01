import { FC, SVGProps } from 'react'

export const Ledger: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M9.13798 0H20.1063C22.2302 0 23.9395 1.7093 23.9395 3.83311V14.8015H9.13798V0Z"
      fill="#1D2028"
    />
    <path d="M3.83311 0H5.71939V5.71939H0V3.83311C0 1.7093 1.7093 0 3.83311 0Z" fill="#1D2028" />
    <path d="M5.71939 9.13798H0V14.8574H5.71939V9.13798Z" fill="#1D2028" />
    <path
      d="M20.1669 23.9395H18.2806V18.2806H24V20.1063C24 22.2302 22.2907 23.9395 20.1669 23.9395Z"
      fill="#1D2028"
    />
    <path d="M14.8574 18.2806H9.13798V24H14.8574V18.2806Z" fill="#1D2028" />
    <path d="M0 20.1669V18.2806H5.71939V24H3.83311C1.7093 24 0 22.2907 0 20.1669Z" fill="#1D2028" />
  </svg>
)
