import { siteName } from '../lib/seo';

export const dynamic = 'force-static';

export default function manifest() {
  return {
    name: siteName,
    short_name: 'Velo',
    description: 'After-school baseball and softball player development in Apollo Beach, Florida.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0c0c0d',
    theme_color: '#d7ff14',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
