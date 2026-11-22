import { defineEnvVars } from '@sveltejs/kit/env';

const opcional = (value: string | undefined) => value?.trim() || '';

export const variables = defineEnvVars({
    API_URL: { schema: opcional },
    GEOCODING_REVERSE_URL: { schema: opcional },
    PUBLIC_MAPBOX_TOKEN: { public: true, schema: opcional },
    PUBLIC_TURNSTILE_SITE_KEY: { public: true, schema: opcional },
    PUBLIC_POSTHOG_KEY: { public: true, schema: opcional },
    PUBLIC_POSTHOG_ENABLED: { public: true, schema: opcional },
});
