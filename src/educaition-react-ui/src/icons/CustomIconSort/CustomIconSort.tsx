interface CustomIconSortProps extends React.SVGProps<SVGSVGElement> {}

export function CustomIconSort({
  width,
  height,
  ...props
}: CustomIconSortProps) {
  return (
    <svg
      width={width || 11}
      height={height || 15}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="m5.612 3.595-.668.669L3.24 5.967a.66.66 0 0 1-.934.015.66.66 0 0 1 .015-.934l2.846-2.846a.66.66 0 0 1 .934-.015L8.86 4.944a.66.66 0 0 1-.015.934.66.66 0 0 1-.934.015L6.26 4.245l-.649-.65Zm-.058 7.81.668-.669 1.703-1.703a.66.66 0 0 1 .935-.015.66.66 0 0 1-.016.934l-2.846 2.846a.66.66 0 0 1-.934.015l-2.757-2.757a.66.66 0 0 1 .015-.934.66.66 0 0 1 .934-.015l1.649 1.649.649.649Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
