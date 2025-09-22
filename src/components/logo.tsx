import Image from 'next/image';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href='/' className='flex w-fit items-center gap-2'>
      <Image
        src='/logo.png'
        width={100}
        height={120}
        priority
        quality={100}
        alt='UPDATE_THIS_WITH_YOUR_APP_DISPLAY_NAME logo mark'
      />
      <span className='font-alt text-xl text-white'>UPDATE_THIS_WITH_YOUR_APP_DISPLAY_NAME</span>
    </Link>
  );
}
