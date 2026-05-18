import { useState } from 'react';

import Button from '@/components/Button';

export const ErrorButton = () => {
  const [shouldCrash, setShouldCrash] = useState<boolean>(false);

  if (shouldCrash) {
    throw new Error('Test Error: Application crashed as requested.');
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button className="bg-red-500! shadow-red-500/20! text-xs py-2 px-4" onClick={() => setShouldCrash(true)}>
        Throw error
      </Button>
    </div>
  );
};

export default ErrorButton;
