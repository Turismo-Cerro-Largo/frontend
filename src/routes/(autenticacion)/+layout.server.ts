import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";


// Si el usuario esta autenticado se lo dirije a su dashboard
export const load: LayoutServerLoad = ({ locals }) => {
    if (locals.cuenta) {
        redirect(303, { ADMINISTRADOR: "/administrador", ORGANIZADOR: "/organizador", TURISTA: "/turista" }[locals.cuenta.rol] ?? "/");
    }
};