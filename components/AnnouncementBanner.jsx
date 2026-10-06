'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const LAST_DAY = '2026-10-08';

export default function AnnouncementBanner() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
    setActive(today <= LAST_DAY);
  }, []);

  if (!active || pathname.startsWith('/admin')) return null;

  return (
    <aside className="announcement-banner" role="alert" aria-label="Skills camp schedule update">
      <strong>Schedule Update</strong>
      <span>Skills Camps are canceled Wednesday, October 7, and may also be canceled Thursday, October 8.</span>
    </aside>
  );
}
