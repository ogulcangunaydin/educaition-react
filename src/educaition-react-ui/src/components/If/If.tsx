import React, { memo } from 'react';

interface IfProps {
  value: boolean;
}

function IfComponent({ children, value }: React.PropsWithChildren<IfProps>) {
  if (!value) {
    return null;
  }
  return <>{children}</>;
}

export const If = memo(IfComponent);
