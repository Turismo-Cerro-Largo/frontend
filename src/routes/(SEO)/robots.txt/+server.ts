import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) =>
    new Response(
        [
            'User-agent: *',
            'Disallow: /administrador',
            'Disallow: /organizador',
            'Disallow: /turista',
            `Sitemap: ${new URL('/sitemap.xml', url.origin)}`,
            ''
        ].join('\n'),
        { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
