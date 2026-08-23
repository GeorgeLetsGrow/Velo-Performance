import { createPageMetadata } from '../../lib/seo';

export const metadata = createPageMetadata({
  title: 'Book Training',
  description:
    'Reserve after-school training, Diamond Skills, or individual baseball and softball sessions with Velo Performance Lab in Apollo Beach, Florida.',
  path: '/book/',
});

export default function BookLayout({ children }) {
  return children;
}
