/** Abstracción del reloj: permite fijar el tiempo en los tests sin trucos de temporizadores. */
export interface Clock {
	now(): Date;
}

export const systemClock: Clock = {
	now: () => new Date()
};
