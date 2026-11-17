/**
 * Opciones de los selectores del editor de cotizaciones. Son proyecciones mínimas de otros
 * módulos (clientes, catálogo): ventas no depende de sus modelos, solo de lo que necesita.
 * Se envían al navegador, así que no contienen nada que el vendedor no deba ver.
 */

export interface CustomerOption {
	readonly id: string;
	readonly name: string;
	readonly taxId: string | null;
}

export interface ProductOption {
	readonly id: string;
	readonly sku: string;
	readonly name: string;
	/** Precio de lista vigente, sin impuestos. Solo para la vista previa de importes. */
	readonly listPrice: number;
	readonly taxRatePercent: number;
}
