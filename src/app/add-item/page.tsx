'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import AddItem from './add-item';

function AddItemFallback() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="h-16 w-16 animate-spin" />
    </div>
  );
}

export default function AddItemPage() {
  return (
    <Suspense fallback={<AddItemFallback />}>
      <AddItem />
    </Suspense>
  );
}
