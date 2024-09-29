"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { handleSignOut } from '@/app/actions/authActions';

const Header = () => {
  const  session  = useSession();
  console.log(session);
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

  // Define spring properties for smooth, slow animation
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
          {session.status === 'authenticated' ? (
            <form onSubmit={handleSignOut}>
            <Button>
              Logout
            </Button>
            </form>
          ) : (
            <Link href="/api/auth/signin">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
