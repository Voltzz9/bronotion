"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import AnimatedArrowButton from './animated-arrow-button'; // Assuming this is the arrow button

const Header = () => {
  const pathname = usePathname();
  const isOnPage = pathname === '/' || pathname === '/notes';
  const isOnNotesPage = pathname.startsWith('/notes');
  const { scrollY } = useScroll();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true); // State for side panel

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
            {isOnPage && (
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>
          {isOnNotesPage && (
            <AnimatedArrowButton onClick={toggleSidePanel} />
          )}
        </nav>
      </header>

    </>
  );
};

export default Header;
