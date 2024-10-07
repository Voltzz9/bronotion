"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSession } from 'next-auth/react';
import { LayoutComponent } from '@/components/layout-component';
import AuthButtons from './auth-buttons';

export default function Header() {
  const { data: session, status } = useSession();
  const { scrollY } = useScroll();
  const [isMobile, setIsMobile] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(status === 'authenticated');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    const checkScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    checkMobile();
    checkScroll();
    
    window.addEventListener('resize', checkMobile);
    window.addEventListener('scroll', checkScroll);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', checkScroll);
    };
  }, []);

  useEffect(() => {
    setIsAuthenticated(status === 'authenticated');
  }, [status]);

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
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${isScrolled 
            ? 'bg-accent-90 backdrop-blur shadow-sm' 
            : 'bg-accent'
          }`}
      >
        <nav className="container mx-auto py-2 flex justify-between items-center">
            <Link href={isAuthenticated ? "/home" : "/"} className="flex items-center">
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
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    {session && (
                        <>
                        <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
                        <AvatarFallback className="font-bold bg-white">{session.user?.name?.[0] || 'U'}</AvatarFallback>
                        </>
                    )}
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <AuthButtons />
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/signin">
                <Button>Login</Button>
              </Link>
            )}
          <LayoutComponent />
          </div>
        </nav>
      </header>
    </>
  );
}