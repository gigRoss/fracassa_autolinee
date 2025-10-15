'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface BottomNavProps {
  items?: NavItem[];
  className?: string;
}

/**
 * Bottom navigation bar with 4 icons
 * Fixed at bottom of screen (795px from top)
 * Active state indicated by orange color
 */
export default function BottomNav({ items, className = '' }: BottomNavProps) {
  const pathname = usePathname();

  // Default navigation items
  const defaultItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      href: '/home',
      icon: (
        <svg
          className="w-[18.67px] h-[20.42px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: 'routes',
      label: 'Percorsi',
      href: '/routes',
      icon: (
        <svg
          className="w-[27.39px] h-[23.61px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 3h2v4M22 7H2M6 11h.01M10 11h.01" />
        </svg>
      ),
    },
    {
      id: 'tickets',
      label: 'Biglietti',
      href: '/tickets',
      icon: (
        <svg
          className="w-[21.67px] h-[21.67px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
          <path d="M3 10h18M7 15h.01M11 15h.01" />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'Profilo',
      href: '/profile',
      icon: (
        <svg
          className="w-[18.2px] h-[20.83px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  const navItems = items || defaultItems;

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0
        w-full max-w-[393px] mx-auto
        h-[57px]
        bg-white
        border-t border-[rgba(0,0,0,0.14)]
        z-50
        ${className}
      `}
      role="navigation"
      aria-label="Navigazione principale"
    >
      <div className="flex items-center justify-center h-full gap-[21px] px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                flex flex-col items-center justify-center
                transition-all duration-200
                active:scale-95
                focus:outline-none
                focus:ring-2
                focus:ring-[#162686]
                focus:ring-offset-2
                rounded-lg
                p-2
                ${isActive ? 'text-[#F49401]' : 'text-black'}
              `}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="transition-transform duration-200 hover:scale-110">
                {item.icon}
              </div>
              {/* Optional: Add label text */}
              {/* <span className="text-xs mt-1">{item.label}</span> */}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

