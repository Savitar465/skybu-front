import { describe, expect, it } from 'vitest';
import { UnauthenticatedError } from '#lib/shared/errors/app-error.ts';
import type { Clock } from '#lib/shared/time/clock.ts';
import { NOW, StubAuthGateway, tokenSet } from '../testing/fakes';
import { SingleFlightAuthGateway } from './single-flight-auth-gateway';

function mutableClock(start: Date = NOW): Clock & { advance(ms: number): void } {
	let current = start.getTime();
	return { now: () => new Date(current), advance: (ms) => (current += ms) };
}

describe('SingleFlightAuthGateway', () => {
	it('comparte una única rotación entre peticiones concurrentes con el mismo token', async () => {
		const inner = new StubAuthGateway();
		const gateway = new SingleFlightAuthGateway(inner, mutableClock());

		const [first, second] = await Promise.all([
			gateway.refresh('refresh-a'),
			gateway.refresh('refresh-a')
		]);

		expect(inner.calls.refresh).toEqual(['refresh-a']);
		expect(first).toBe(second);
	});

	it('reutiliza el resultado durante el periodo de gracia y vuelve a llamar después', async () => {
		const inner = new StubAuthGateway();
		const clock = mutableClock();
		const gateway = new SingleFlightAuthGateway(inner, clock, 5_000);

		await gateway.refresh('refresh-a');
		clock.advance(4_000);
		await gateway.refresh('refresh-a');
		expect(inner.calls.refresh).toHaveLength(1);

		clock.advance(2_000);
		await gateway.refresh('refresh-a');
		expect(inner.calls.refresh).toHaveLength(2);
	});

	it('no reutiliza los fallos', async () => {
		const inner = new StubAuthGateway();
		inner.onRefresh = () => Promise.reject(new UnauthenticatedError());
		const gateway = new SingleFlightAuthGateway(inner, mutableClock());

		await expect(gateway.refresh('refresh-a')).rejects.toBeInstanceOf(UnauthenticatedError);
		inner.onRefresh = async () => tokenSet('ok');
		await expect(gateway.refresh('refresh-a')).resolves.toEqual(tokenSet('ok'));
		expect(inner.calls.refresh).toHaveLength(2);
	});

	it('no mezcla tokens distintos', async () => {
		const inner = new StubAuthGateway();
		const gateway = new SingleFlightAuthGateway(inner, mutableClock());

		await Promise.all([gateway.refresh('refresh-a'), gateway.refresh('refresh-b')]);

		expect(inner.calls.refresh).toEqual(['refresh-a', 'refresh-b']);
	});
});
