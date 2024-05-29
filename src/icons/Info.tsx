import { FC, SVGProps } from 'react'

export const Info: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_5694_988)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8Z"
        fill="#096DD9"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.99734 4C7.51826 4.0016 7.13045 4.38838 7.12988 4.86746C7.12932 5.34924 7.52329 5.73961 8.00505 5.73694C8.48416 5.73429 8.87114 5.34658 8.87058 4.86746C8.87003 4.38891 8.47802 3.99841 7.99734 4ZM8.8648 7.32526C8.8648 7.00588 8.50372 6.50609 7.99734 6.50609C7.49097 6.50609 7.12988 7.00588 7.12988 7.32526V11.1806C7.12988 11.5 7.49092 12 7.99734 12C8.50377 12 8.8648 11.5 8.8648 11.1806V7.32526Z"
        fill="#F5F5F5"
      />
    </g>
    <defs>
      <clipPath id="clip0_5694_988">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
)
