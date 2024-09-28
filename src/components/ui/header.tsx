import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './button';

const Header: React.FC = () => {
    const pathname = usePathname();
    const isOnPage = pathname === '/' || pathname === '/notes';

    return (
        <header className="bg-accent shadow-sm">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-blue-600 to-purple-700 bg-clip-text text-transparent">
                    Bronotion
                </Link>
                <div className="space-x-4">
                    {isOnPage && (
                        <Link href="/login">
                            <Button>Login</Button>
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;