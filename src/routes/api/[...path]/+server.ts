import { backendUrl } from '$lib/server/backend';
import type { RequestHandler } from './$types';
const proxy: RequestHandler = async ({ request, url, fetch }) => {
    const headers = new Headers();
    for (const key of ['content-type', 'cookie', 'origin', 'range', 'accept']) {
        const value = request.headers.get(key);
        if (value) headers.set(key, value);
    }
    try {
        const response = await fetch(`${backendUrl()}${url.pathname}${url.search}`, {
            method: request.method,
            headers,
            redirect: 'manual',
            body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
            duplex: 'half',
            signal: AbortSignal.timeout(30000),
        } as RequestInit);
        const outgoing = new Headers(response.headers);
        for (const key of ['content-encoding', 'content-length', 'transfer-encoding', 'connection']) outgoing.delete(key);
        return new Response(response.body, { status: response.status, headers: outgoing });
    } catch {
        return Response.json({ message: 'El servidor no está disponible.' }, { status: 502 });
    }
};
export const GET = proxy,
    POST = proxy,
    PUT = proxy,
    PATCH = proxy,
    DELETE = proxy,
    HEAD = proxy,
    OPTIONS = proxy;
