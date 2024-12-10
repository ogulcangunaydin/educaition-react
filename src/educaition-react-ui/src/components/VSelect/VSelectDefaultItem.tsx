export interface VSelectDefaultItemProps {
  label: React.ReactNode;
  value?: string;
}

export function VSelectDefaultItem({ label, value }: VSelectDefaultItemProps) {
  return <>{label || value}</>;
}
