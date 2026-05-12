
'use client';

import { Spinner } from './spinner';

export function Loader() {
  return (
    <div className="flex items-center justify-center p-8 w-full h-full">
      <Spinner size="lg" />
    </div>
  );
}

export default Loader;
