'use client';

import { useEffect } from 'react';
import { handleSignOut } from '@/app/server/serverActions';

const SignOutPage = () => {


  useEffect(() => {
    handleSignOut();
  }, []);

  return null;
};

export default SignOutPage;