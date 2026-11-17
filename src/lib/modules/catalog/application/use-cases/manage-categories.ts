import type { Category } from '../../domain/product';
import type { CreateCategoryInput, RenameCategoryInput } from '../dto/category-input';
import type { CategoryGateway } from '../ports';

/** Crea una categoría. Un nombre repetido llega como `ConflictError` (`category_name_already_in_use`). */
export class CreateCategoryUseCase {
	constructor(private readonly categoryGateway: CategoryGateway) {}

	execute(accessToken: string, input: CreateCategoryInput): Promise<Category> {
		return this.categoryGateway.create(accessToken, input.name);
	}
}

export class RenameCategoryUseCase {
	constructor(private readonly categoryGateway: CategoryGateway) {}

	execute(accessToken: string, input: RenameCategoryInput): Promise<Category> {
		return this.categoryGateway.rename(accessToken, input.categoryId, input.name);
	}
}

/** Elimina una categoría. Si tiene productos, la API lo impide (`category_in_use`). */
export class DeleteCategoryUseCase {
	constructor(private readonly categoryGateway: CategoryGateway) {}

	execute(accessToken: string, categoryId: string): Promise<void> {
		return this.categoryGateway.delete(accessToken, categoryId);
	}
}
