'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SignOutPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/');
  }, [router]);

  return null;
};

export default SignOutPage;