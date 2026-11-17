/**
 * Puerto de logging. Las capas de aplicación dependen de esta interfaz y no de `console`, para
 * poder sustituirla en tests o por un logger estructurado en producción.
 *
 * Regla: nunca se registran tokens, contraseñas ni cuerpos de petición completos.
 */
export interface Logger {
	info(message: string, context?: Readonly<Record<string, unknown>>): void;
	warn(message: string, context?: Readonly<Record<string, unknown>>): void;
	error(message: string, context?: Readonly<Record<string, unknown>>): void;
}

export const consoleLogger: Logger = {
	info: (message, context) => console.info(message, context ?? ''),
	warn: (message, context) => console.warn(message, context ?? ''),
	error: (message, context) => console.error(message, context ?? '')
};
