import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ locals, url }) => {
    if (!locals.cuenta) redirect(303, "/login");

    if (url.pathname.split("/")[1] !== { ADMINISTRADOR: "administrador", ORGANIZADOR: "organizador", TURISTA: "turista" }[locals.cuenta.rol]) {
        redirect(303, { ADMINISTRADOR: "/administrador", ORGANIZADOR: "/organizador", TURISTA: "/turista" }[locals.cuenta.rol] ?? "/login");
    }
};