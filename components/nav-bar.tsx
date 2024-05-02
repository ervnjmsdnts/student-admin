import { LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className='bg-primary p-4 text-primary-foreground'>
      <div className='flex justify-between items-center'>
        <div className='flex gap-3 items-center'>
          <h2 className='text-xl uppercase font-bold mr-4'>School</h2>
          <Link href='/students'>Students</Link>
          <Link href='/lessons'>Lessons</Link>
          <Link href='/activities'>Activities</Link>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarFallback>
                <User className='text-primary w-6 h-6' />
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <LogOut className='mr-2 h-4 w-4' />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
