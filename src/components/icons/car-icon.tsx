import * as React from "react"

export function CarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14 16H9m10 0h1.46a2 2 0 0 0 1.92-2.61L18.6 5.61A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.92 1.61L3.54 14a2 2 0 0 0 1.92 2.61H7" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  )
}
