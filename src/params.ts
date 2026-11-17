import { defineParams } from '@sveltejs/kit/params';
import { z } from 'zod';

/**
 * Validadores de parámetros de ruta. `[id=uuid]` solo coincide con un UUID: cualquier otro
 * valor responde 404 sin llegar al `load` ni a la API, y ningún id manipulado se interpola en
 * una ruta de la API.
 */
export const params = defineParams({
	uuid: z.uuid()
});
