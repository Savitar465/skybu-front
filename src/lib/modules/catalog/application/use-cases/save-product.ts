import type { Product } from '../../domain/product';
import type { SaveProductInput } from '../dto/save-product-input';
import type { ProductGateway } from '../ports';

/**
 * Alta de producto. Los conflictos (SKU repetido → `sku_already_in_use`) y las reglas de
 * negocio (categoría inexistente...) los decide la API y llegan como errores tipados.
 */
export class CreateProductUseCase {
	constructor(private readonly productGateway: ProductGateway) {}

	execute(accessToken: string, input: SaveProductInput): Promise<Product> {
		return this.productGateway.create(accessToken, input);
	}
}

/** Edición de los datos de un producto existente (no cambia su estado activo/inactivo). */
export class UpdateProductUseCase {
	constructor(private readonly productGateway: ProductGateway) {}

	execute(accessToken: string, productId: string, input: SaveProductInput): Promise<Product> {
		return this.productGateway.update(accessToken, productId, input);
	}
}

/**
 * Activa o desactiva un producto. Un producto inactivo no puede añadirse a cotizaciones nuevas,
 * pero sigue apareciendo en los documentos que ya lo incluyen.
 */
export class SetProductActiveUseCase {
	constructor(private readonly productGateway: ProductGateway) {}

	execute(accessToken: string, productId: string, active: boolean): Promise<void> {
		return active
			? this.productGateway.activate(accessToken, productId)
			: this.productGateway.deactivate(accessToken, productId);
	}
}
