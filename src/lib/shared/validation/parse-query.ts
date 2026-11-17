import type { z } from 'zod';

/**
 * Lee los parámetros de una URL (filtros, búsqueda, página) con un esquema Zod.
 *
 * A diferencia de un formulario, un parámetro de URL inválido no es un error del usuario que
 * haya que mostrar: suele venir de un enlace antiguo o editado a mano. Por eso los esquemas de
 * consulta declaran `.catch(...)` en cada campo y aquí nunca se lanza: lo inválido toma su
 * valor por defecto. Solo se leen los parámetros que declara el esquema.
 */
export function parseSearchParams<Schema extends z.ZodObject>(
	searchParams: URLSearchParams,
	schema: Schema
): z.output<Schema> {
	const rawInput = Object.fromEntries(
		Object.keys(schema.shape).map((key) => [key, searchParams.get(key) ?? undefined])
	);
	return schema.parse(rawInput);
}
