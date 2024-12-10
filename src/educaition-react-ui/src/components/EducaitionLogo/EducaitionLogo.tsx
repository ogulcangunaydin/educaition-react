import React from "react";

interface EducaitionLogoProps extends React.SVGProps<SVGSVGElement> {}

export function EducaitionLogo(props: EducaitionLogoProps) {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props} // Spread props to ensure any passed props are applied to the SVG element
    >
      <circle
        cx="50"
        cy="50"
        r="48"
        stroke="#0D7BFF"
        strokeWidth="4"
        fill="white"
      />

      <path
        d="M30 30 L50 20 L70 30 L70 70 L50 80 L30 70 Z"
        fill="#0D7BFF"
        stroke="#0A2B50"
        strokeWidth="2"
      />

      <line x1="50" y1="20" x2="50" y2="10" stroke="#0A2B50" strokeWidth="2" />
      <line x1="50" y1="10" x2="55" y2="5" stroke="#0A2B50" strokeWidth="2" />
      <line x1="50" y1="10" x2="45" y2="5" stroke="#0A2B50" strokeWidth="2" />
      <circle cx="55" cy="5" r="2" fill="#0A2B50" />
      <circle cx="45" cy="5" r="2" fill="#0A2B50" />

      <text
        x="50"
        y="95"
        fontFamily="Arial, sans-serif"
        fontSize="12"
        fill="#0A2B50"
        textAnchor="middle"
      >
        EducAItion
      </text>
    </svg>
  );
}
