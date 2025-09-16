import * as React from "react"

export function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="m12 3-1.9 4.2L6 9l4.2 1.9L12 15l1.9-4.2L18 9l-4.2-1.9L12 3z" />
      <path d="M5 13l-1 2 2-1 1-2-2 1z" />
      <path d="M19 13l-1 2 2-1 1-2-2 1z" />
    </svg>
  )
}
