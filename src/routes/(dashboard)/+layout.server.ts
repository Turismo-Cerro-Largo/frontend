import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

// Verificar si el usuario esta autenticado
export const load: LayoutServerLoad = ({ locals }) => {
    if (!locals.cuenta) redirect(303, "/login");
};