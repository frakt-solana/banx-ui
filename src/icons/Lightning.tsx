import { FC, SVGProps } from 'react'

export const Lightning: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g>
      <path
        d="M21.6667 5L7.73569 22.0267C7.39413 22.4442 7.22335 22.6529 7.2218 22.8289C7.22046 22.982 7.28928 23.1272 7.40857 23.2231C7.54577 23.3333 7.81547 23.3333 8.35486 23.3333H20L18.3333 35L32.2643 17.9733C32.6059 17.5558 32.7766 17.3471 32.7782 17.1711C32.7795 17.018 32.7107 16.8728 32.5914 16.7769C32.4542 16.6667 32.1845 16.6667 31.6451 16.6667H20L21.6667 5Z"
        fill="#1B1B1B"
      />
    </g>
  </svg>
)
