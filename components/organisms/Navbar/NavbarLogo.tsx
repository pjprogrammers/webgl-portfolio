"use client";

import { Link } from "@/components/atoms";

const NavbarLogo = () => {
  return (
    <Link
      href="/"
      noDataEvent
      isTextLink
      className="group pointer-events-auto flex text-lg font-medium text-brand-05"
    >
      Jashan Singla
    </Link>
  );
};

export default NavbarLogo;
