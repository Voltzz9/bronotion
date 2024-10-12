"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useSession } from 'next-auth/react';
import { LayoutComponent } from '@/components/sidepanel';
import AuthButtons from './auth-buttons';
import { handleSignOut } from "@/app/server/serverActions"
import { usePathname, useRouter } from 'next/navigation';

interface HeaderComponentProps {
  onCollaboratorAdded?: () => void;
}

export default function Header({ onCollaboratorAdded }: HeaderComponentProps) {
  const { data: session, status } = useSession();
  const { scrollY } = useScroll();
  const [isMobile, setIsMobile] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(status === 'authenticated');
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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
  const logoX = useSpring(useTransform(scrollY, [0, 50], ['0%', isMobile ? '0%' : '-20%']), {
    stiffness: 80,
    damping: 15,
  });
  const opacity = useSpring(useTransform(scrollY, [0, 50], [1, 0]), {
    stiffness: 80,
    damping: 15,
  });

  const isNotePage = /^\/notes\/\d+$/.test(pathname);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, href: string) => {
    if (event.key === 'Enter') {
      router.push(href);
    }
  }, [router]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${isScrolled
            ? 'bg-accent-90 backdrop-blur shadow-sm'
            : 'bg-accent'
          }`}
      >
        <nav className="container mx-auto py-2 px-10 flex justify-between items-center">
          <div className="flex-1 flex justify-center sm:justify-start">
            <Link 
              href={isAuthenticated ? "/home" : "/"} 
              className="flex items-center"
              onKeyDown={(e) => handleKeyDown(e, isAuthenticated ? "/home" : "/")}
            >
              <motion.div
                style={{ width: logoWidth, x: logoX }}
                className="flex items-center"
              >
                <motion.span className="text-4xl sm:text-4xl font-bold text-secondary  focus:border-black"
                tabIndex={0}
                >B</motion.span>
                <motion.span
                  style={{ opacity }}
                  className="text-4xl sm:text-4xl font-bold text-secondary  focus:border-black"
                >
                  ronotion
                </motion.span>
              </motion.div>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger tabIndex={0} asChild>
                  <Avatar 
                  className="cursor-pointer"
                  >
                    {session && (
                      <>
                        <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
                        <AvatarFallback className="font-bold bg-white">{session.user?.name?.[0] || 'U'}</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent tabIndex={0} align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/signout">
                      Sign out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                className="bg-secondary text-background px-6 py-3 rounded-lg text-lg font-semibold transition-colors"
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, "/auth/signin")}
                onClick={() => router.push("/auth/signin")}
              >
                Login
              </Button>
            )}
            {isNotePage && <LayoutComponent onCollaboratorAdded={onCollaboratorAdded} />}
          </div>
        </nav>
      </header>
    </>
  );
}