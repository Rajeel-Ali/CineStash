'use client';

import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export function UserButton() {
  const router = useRouter();

  return (
    <Button variant="ghost" asChild>
      <Link href="/settings">
          <Settings />
          <span className="sr-only">Settings</span>
      </Link>
    </Button>
  )
}
