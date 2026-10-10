// src/routes/(dashboard)/organizador/eventos/+layout.server.ts
import type { LayoutServerLoad } from "../../$types";
import type { Cuenta } from "$lib/types/cuenta";
import { error } from "@sveltejs/kit";

// TODO
export const load: LayoutServerLoad = async ({ parent }) => {
    const cuenta = ((await parent()).cuenta as Cuenta)

    if (cuenta.estado !== "APROBADO") error(403, "Tu cuenta todavía no fue verificada.")

    return {}
};