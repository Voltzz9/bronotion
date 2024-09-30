"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import SignOutButton from './sign-out';


const Header = () => {
  const { data: session, status } = useSession();
  const { scrollY } = useScroll();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    console.log("Session status changed:", status);
    console.log("Session data:", session);
  }, [status, session]);

  const logoWidth = useSpring(useTransform(scrollY, [0, 50], ['100%', isMobile ? '100%' : '10%']), {
    stiffness: 80,
    damping: 15,
  });
  const logoX = useSpring(useTransform(scrollY, [0, 50], ['0%', isMobile ? '0%' : '-45%']), {
    stiffness: 80,
    damping: 15,
  });
  const opacity = useSpring(useTransform(scrollY, [0, 50], [1, 0]), {
    stiffness: 80,
    damping: 15,
  });

  return (
    <header className="fixed top-0 left-0 right-0 bg-accent shadow-sm z-10">
      <nav className="container mx-auto py-2 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <motion.div
            style={{ width: logoWidth, x: logoX }}
            className="flex items-center"
          >
            <span className="text-4xl font-bold text-secondary">B</span>
            <motion.span
              style={{ opacity }}
              className="text-4xl font-bold text-secondary"
            >
              ronotion
            </motion.span>
          </motion.div>
        </Link>
        <div className="flex items-center justify-center space-x-4">
          {status === 'authenticated' ? (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
                <AvatarFallback>{session.user?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <SignOutButton />
            </DropdownMenuContent>
          </DropdownMenu>
          ) : (
            <Link href="/auth/signin">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;