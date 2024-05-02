import NavBar from '@/components/nav-bar';
import NavCrumbs from '@/components/nav-crumbs';
import { PropsWithChildren } from 'react';

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className='flex flex-col gap-2 w-full h-full'>
      <NavBar />
      <div className='flex-grow flex flex-col gap-2 h-full w-full p-4'>
        <NavCrumbs />
        {children}
      </div>
    </div>
  );
}
