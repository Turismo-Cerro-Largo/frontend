// See https://svelte.dev/docs/kit/types#app.d.ts

import type { Cuenta } from "$lib/types/cuenta";

// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}

        // lado del servidor
        interface Locals {
            cuenta: Cuenta | null;
        }

        // lado del cliente -> hacia src/routes/+layout.server.ts
        interface PageData {
            cuenta: Cuenta | null;
        }
        // interface PageState {}
        // interface Platform {}
    }
}

export { };
