import { createPageMetadata } from '../../lib/seo';

export const metadata = createPageMetadata({
  title: 'Book Training',
  description:
    'Reserve after-school passes or individual baseball and softball training sessions with Velo Performance Lab in Apollo Beach, Florida.',
  path: '/book/',
});

export default function BookLayout({ children }) {
  return children;
}
