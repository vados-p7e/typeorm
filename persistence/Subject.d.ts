import { ObjectLiteral } from "../common/ObjectLiteral";
import { EntityMetadata } from "../metadata/EntityMetadata";
import { SubjectChangeMap } from "./SubjectChangeMap";
/**
 * Subject is a subject of persistence.
 * It holds information about each entity that needs to be persisted:
 * - what entity should be persisted
 * - what is database representation of the persisted entity
 * - what entity metadata of the persisted entity
 * - what is allowed to with persisted entity (insert/update/remove)
 *
 * Having this collection of subjects we can perform database queries.
 */
export declare class Subject {
    /**
     * Entity metadata of the subject entity.
     */
    metadata: EntityMetadata;
    /**
     * Subject identifier.
     * This identifier is not limited to table entity primary columns.
     * This can be entity id or ids as well as some unique entity properties, like name or title.
     * Insert / Update / Remove operation will be executed by a given identifier.
     */
    identifier: ObjectLiteral | undefined;
    /**
     * Gets entity sent to the persistence (e.g. changed entity).
     * If entity is not set then this subject is created only for the entity loaded from the database,
     * or this subject is used for the junction operation (junction operations are relying only on identifier).
     */
    entity?: ObjectLiteral;
    /**
     * Database entity.
     * THIS IS NOT RAW ENTITY DATA, its a real entity.
     */
    databaseEntity?: ObjectLiteral;
    /**
     * Changes needs to be applied in the database for the given subject.
     */
    changeMaps: SubjectChangeMap[];
    /**
     * Generated values returned by a database (for example generated id or default values).
     * Used in insert and update operations.
     * Has entity-like structure (not just column database name and values).
     */
    generatedMap?: ObjectLiteral;
    /**
     * Inserted values with updated values of special and default columns.
     * Has entity-like structure (not just column database name and values).
     */
    insertedValueSet?: ObjectLiteral;
    /**
     * Indicates if this subject can be inserted into the database.
     * This means that this subject either is newly persisted, either can be inserted by cascades.
     */
    canBeInserted: boolean;
    /**
     * Indicates if this subject can be updated in the database.
     * This means that this subject either was persisted, either can be updated by cascades.
     */
    canBeUpdated: boolean;
    /**
     * Indicates if this subject MUST be removed from the database.
     * This means that this subject either was removed, either was removed by cascades.
     */
    mustBeRemoved: boolean;
    constructor(options: {
        metadata: EntityMetadata;
        entity?: ObjectLiteral;
        databaseEntity?: ObjectLiteral;
        canBeInserted?: boolean;
        canBeUpdated?: boolean;
        mustBeRemoved?: boolean;
        identifier?: ObjectLiteral;
        changeMaps?: SubjectChangeMap[];
    });
    /**
     * Checks if this subject must be inserted into the database.
     * Subject can be inserted into the database if it is allowed to be inserted (explicitly persisted or by cascades)
     * and if it does not have database entity set.
     */
    readonly mustBeInserted: boolean;
    /**
     * Checks if this subject must be updated into the database.
     * Subject can be updated in the database if it is allowed to be updated (explicitly persisted or by cascades)
     * and if it does have differentiated columns or relations.
     */
    readonly mustBeUpdated: boolean | undefined;
    /**
     * Creates a value set needs to be inserted / updated in the database.
     * Value set is based on the entity and change maps of the subject.
     * Important note: this method pops data from this subject's change maps.
     */
    createValueSetAndPopChangeMap(): ObjectLiteral;
}
