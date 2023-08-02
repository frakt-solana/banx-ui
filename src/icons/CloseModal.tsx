import { FC, SVGProps } from 'react'

export const CloseModal: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 23 23" fill="none" {...props}>
    <rect
      y="21.5625"
      width="30.494"
      height="2.03293"
      transform="rotate(-45 0 21.5625)"
      fill="black"
    />
    <rect x="1.4375" width="30.494" height="2.03293" transform="rotate(45 1.4375 0)" fill="black" />
  </svg>
)
