import { ObjectLiteral } from "../common/ObjectLiteral";
import { EntityMetadata } from "./EntityMetadata";
/**
 * Utils used to work with EntityMetadata objects.
 */
export declare class EntityMetadataUtils {
    /**
     * Creates a property paths for a given entity.
     */
    static createPropertyPath(metadata: EntityMetadata, entity: ObjectLiteral, prefix?: string): string[];
    /**
     * Creates a property paths for a given entity.
     */
    static getPropertyPathValue(entity: ObjectLiteral, propertyPath: string): any;
    /**
     * Finds difference between two entity id maps.
     * Returns items that exist in the first array and absent in the second array.
     */
    static difference(firstIdMaps: ObjectLiteral[], secondIdMaps: ObjectLiteral[]): ObjectLiteral[];
    /**
     * Compares ids of the two entities.
     * Returns true if they match, false otherwise.
     */
    static compareIds(firstId: ObjectLiteral | undefined, secondId: ObjectLiteral | undefined): boolean;
}
