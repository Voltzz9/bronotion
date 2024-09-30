"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import AnimatedArrowButton from './animated-arrow-button'; // Assuming this is the arrow button
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import SignOutButton from './sign-out';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isOnNotesPage = pathname.startsWith('/notes');
  const { scrollY } = useScroll();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true); // State for side panel
  const [isAuthenticated, setIsAuthenticated] = useState(status === 'authenticated');

  // Effect to check if the window size is mobile
  // Effect to check if the window size is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Effect to update local authentication state
  useEffect(() => {
    setIsAuthenticated(status === 'authenticated');
  }, [status]); // Runs when status changes (login/logout)

  // Effect to update local authentication state
  useEffect(() => {
    setIsAuthenticated(status === 'authenticated');
  }, [status]); // Runs when status changes (login/logout)

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

  const toggleSidePanel = () => {
    setIsSidePanelOpen(!isSidePanelOpen); // Toggle the side panel
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-accent shadow-sm z-50">
        <nav className="container mx-auto py-2 flex justify-between items-center">
          <div className="flex">

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

          </div>

          <div className="flex items-center justify-center space-x-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  {session && (
                    <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
                  )}
                  <AvatarFallback>{session?.user?.name?.[0] || 'U'}</AvatarFallback>
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
          {isOnNotesPage && (
            <AnimatedArrowButton />
          )}
        </nav>
      </header>

    </>
  );
};
