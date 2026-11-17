import { z } from 'zod';
import {
	AppError,
	BusinessRuleError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
	UnauthenticatedError,
	UpstreamError,
	ValidationError,
	type FieldErrors
} from '#lib/shared/errors/app-error.ts';

const MAX_MESSAGE_LENGTH = 500;
const MAX_FIELD_VIOLATIONS = 50;

/**
 * Contrato de error del backend: RFC 9457 (`application/problem+json`) con la propiedad `code`
 * y, en los 400, la lista `errors` de `FieldViolation`. Todo es opcional y acotado: una
 * respuesta de error malformada no debe impedir mostrar un error razonable.
 */
const problemDetailsSchema = z.object({
	code: z
		.string()
		.max(100)
		.regex(/^[a-z0-9_]+$/)
		.optional(),
	detail: z.string().max(MAX_MESSAGE_LENGTH).optional(),
	errors: z
		.array(z.object({ field: z.string().max(200), message: z.string().max(MAX_MESSAGE_LENGTH) }))
		.max(MAX_FIELD_VIOLATIONS)
		.optional()
});

type ProblemDetails = z.output<typeof problemDetailsSchema>;

/** Traduce una respuesta HTTP de error del backend a la categoría tipada que le corresponde. */
export function problemToAppError(status: number, rawBody: unknown): AppError {
	const parsed = problemDetailsSchema.safeParse(rawBody);
	const problem: ProblemDetails = parsed.success ? parsed.data : {};
	const code = problem.code;
	const message = problem.detail;

	switch (status) {
		case 400:
			return new ValidationError(
				message ?? 'Los datos enviados no son válidos.',
				toFieldErrors(problem.errors),
				code
			);
		case 401:
			return new UnauthenticatedError(code, message);
		case 403:
			return new ForbiddenError(code, message);
		case 404:
			return new NotFoundError(code, message);
		case 409:
			return new ConflictError(
				code ?? 'conflict',
				message ?? 'La operación entra en conflicto con datos existentes.'
			);
		case 422:
			return new BusinessRuleError(
				code ?? 'business_rule_violation',
				message ?? 'La operación no está permitida.'
			);
		default:
			// 5xx y estados no previstos: no se reenvía el mensaje del backend al usuario.
			return new UpstreamError();
	}
}

function toFieldErrors(violations: ProblemDetails['errors']): FieldErrors {
	const fieldErrors: Record<string, string[]> = {};
	for (const violation of violations ?? []) {
		(fieldErrors[violation.field] ??= []).push(violation.message);
	}
	return fieldErrors;
}
