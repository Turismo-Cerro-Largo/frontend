
import type {
  CategoriaEvento,
  EstadoEvento,
  Evento
} from '$lib/types/evento';

const API = '/api/organizador/eventos';

// FUNCIÓN GENERAL PARA CONSULTAR EL BACKEND
async function solicitar<T>(
  ruta: string,
  opciones?: RequestInit
): Promise<T> {
  let respuesta: Response;

  try {
    respuesta = await fetch(`${API}${ruta}`, {
      credentials: 'same-origin',
      ...opciones
    });
  } catch {
    throw new Error(
      'No se pudo conectar con el servidor. Verificá que el backend esté funcionando.'
    );
  }

  const datos: unknown = await respuesta
    .json()
    .catch(() => null);

  if (!respuesta.ok) {
    const mensaje =
      datos &&
      typeof datos === 'object' &&
      'message' in datos &&
      typeof datos.message === 'string'
        ? datos.message
        : `Error del servidor (${respuesta.status}).`;

    throw new Error(mensaje);
  }

  return datos as T;
}

// OBTENER TODOS LOS EVENTOS DEL ORGANIZADOR
export async function obtenerEventos(): Promise<Evento[]> {
  const datos = await solicitar<{
    eventos: Evento[];
  }>('');

  return datos.eventos;
}

// OBTENER UN EVENTO POR ID
export async function obtenerEvento(
  id: number
): Promise<Evento> {
  const datos = await solicitar<{
    evento: Evento;
  }>(`/${id}`);

  return datos.evento;
}

// OBTENER CATEGORÍAS DESDE MYSQL
export async function obtenerCategorias(): Promise<CategoriaEvento[]> {
  const datos = await solicitar<{
    categorias: CategoriaEvento[];
  }>('/categorias');

  if (!Array.isArray(datos.categorias)) {
    throw new Error(
      'La respuesta del servidor no contiene una lista válida de categorías.'
    );
  }

  return datos.categorias;
}

// CREAR O ACTUALIZAR UN EVENTO
export async function guardarEvento(
  evento: Evento | null,
  datos: FormData
): Promise<Evento> {
  const respuesta = await solicitar<{
    evento: Evento;
  }>(
    evento ? `/${evento.id}` : '',
    {
      method: evento ? 'PUT' : 'POST',
      body: datos
    }
  );

  return respuesta.evento;
}

// TEXTOS PARA LOS ESTADOS
export const estadoTexto: Record<EstadoEvento, string> = {
  BORRADOR: 'Borrador',
  PENDIENTE_REVISION: 'Pendiente de revisión',
  PUBLICADO: 'Publicado',
  RECHAZADO: 'Rechazado',
  CANCELADO: 'Cancelado',
  FINALIZADO: 'Finalizado'
};

// COLORES PARA LOS ESTADOS
export function estadoColor(estado: EstadoEvento): string {
  switch (estado) {
    case 'PUBLICADO':
      return 'bg-[#d7e5db] text-[#385443]';

    case 'PENDIENTE_REVISION':
      return 'bg-[#fff1c9] text-[#765e19]';

    case 'RECHAZADO':
      return 'bg-[#f6d8d6] text-[#883b36]';

    case 'CANCELADO':
      return 'bg-[#eadede] text-[#704848]';

    default:
      return 'bg-[#ecebea] text-[#585858]';
  }
}

// FORMATO DE FECHA PARA URUGUAY
export function fechaEvento(fecha: string): string {
  return new Intl.DateTimeFormat('es-UY', {
    timeZone: 'America/Montevideo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(fecha));
}

// EXTRAER INFORMACIÓN DE CONTACTO
export function contactoEvento(valor: string | null) {
  try {
    const objeto = JSON.parse(valor ?? '{}');

    return {
      telefono:
        typeof objeto.telefono === 'string'
          ? objeto.telefono
          : '',

      correo:
        typeof objeto.correo === 'string'
          ? objeto.correo
          : '',

      redes:
        typeof objeto.redes === 'string'
          ? objeto.redes
          : ''
    };
  } catch {
    return {
      telefono: '',
      correo: '',
      redes: ''
    };
  }
}

// CONVERTIR FECHA A INPUTS HTML
export function fechaInput(valor: string | null) {
  if (!valor) {
    return {
      fecha: '',
      hora: ''
    };
  }

  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Montevideo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date(valor));

  const campo = (tipo: string) =>
    partes.find((parte) => parte.type === tipo)?.value ?? '';

  return {
    fecha: `${campo('year')}-${campo('month')}-${campo('day')}`,
    hora: `${campo('hour')}:${campo('minute')}`
  };
}
