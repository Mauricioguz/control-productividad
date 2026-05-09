'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/recolectores', label: 'Recolectores' },
    { href: '/lotes', label: 'Lotes' },
    { href: '/recoleccion', label: 'Recolección Diaria' },
    { href: '/proceso-lavado', label: 'Beneficio Lavado' },
    { href: '/proceso-fermentacion', label: 'Beneficio Fermentación' },
    { href: '/bodega', label: '📦 Inventario Bodega' },
  ];

  return (
    <nav className="sidebar">
      <h1>La Leonora ☕</h1>
      <div className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
