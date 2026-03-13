"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="apple-navbar">
      <div className="apple-navbar-inner">
        <span className="apple-navbar-logo">Kids &amp; Teens</span>
        <ul className="apple-navbar-links">
          <li>
            <Link
              href="/"
              className={pathname === "/" ? "active" : ""}
            >
              Patients
            </Link>
          </li>
          <li>
            <Link
              href="/providers"
              className={pathname === "/providers" ? "active" : ""}
            >
              Providers/Staff
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
