import { createPageMetadata } from '../../lib/seo';

export const metadata = createPageMetadata({
  title: 'Admin',
  path: '/admin/',
  robots: { index: false, follow: false },
});

export default function AdminLayout({ children }) {
  return children;
}
