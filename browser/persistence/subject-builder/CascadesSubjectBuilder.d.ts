import { Subject } from "../Subject";
import { ObjectLiteral } from "../../common/ObjectLiteral";
/**
 * Finds all cascade operations of the given subject and cascade operations of the found cascaded subjects,
 * e.g. builds a cascade tree and creates a subjects for them.
 */
export declare class CascadesSubjectBuilder {
    protected subject: Subject;
    protected allSubjects: Subject[];
    constructor(subject: Subject, allSubjects: Subject[]);
    /**
     * Builds a cascade subjects tree and pushes them in into the given array of subjects.
     */
    build(): void;
    /**
     * Builds a cascade subjects recursively.
     */
    protected buildRecursively(subject: Subject): void;
    /**
     * Finds subject where entity like given subject's entity.
     * Comparision made by entity id.
     */
    protected findByPersistEntityLike(entityTarget: Function | string, entity: ObjectLiteral): Subject | undefined;
}
