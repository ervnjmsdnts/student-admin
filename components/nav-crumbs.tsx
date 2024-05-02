'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { ChevronRight } from 'lucide-react';

import { usePathname } from 'next/navigation';

export default function NavCrumbs() {
  const pathname = usePathname();

  const paths = pathname.split('/').filter((item) => item);

  const capitalizePath = (path: string) => {
    return ['students', 'lessons', 'activities'].includes(path)
      ? path.charAt(0).toUpperCase() + path.slice(1)
      : path;
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {paths.map((path, index) => (
          <BreadcrumbItem key={index}>
            {index < paths.length - 1 ? (
              <>
                <BreadcrumbLink
                  href={`/${paths.slice(0, index + 1).join('/')}`}
                  className='max-w-20 truncate md:max-w-none'>
                  {capitalizePath(path)}
                </BreadcrumbLink>
                <ChevronRight className='w-4 h-4' />
              </>
            ) : (
              <BreadcrumbPage className='max-w-20 truncate md:max-w-none'>
                {capitalizePath(path)}
              </BreadcrumbPage>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
