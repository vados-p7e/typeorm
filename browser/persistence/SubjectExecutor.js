var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { PromiseUtils } from "../util/PromiseUtils";
import { SubjectTopoligicalSorter } from "./SubjectTopoligicalSorter";
import { SubjectChangedColumnsComputer } from "./SubjectChangedColumnsComputer";
import { SubjectWithoutIdentifierError } from "../error/SubjectWithoutIdentifierError";
import { SubjectRemovedAndUpdatedError } from "../error/SubjectRemovedAndUpdatedError";
import { MongoQueryRunner } from "../driver/mongodb/MongoQueryRunner";
import { MongoDriver } from "../driver/mongodb/MongoDriver";
import { BroadcasterResult } from "../subscriber/BroadcasterResult";
/**
 * Executes all database operations (inserts, updated, deletes) that must be executed
 * with given persistence subjects.
 */
var SubjectExecutor = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function SubjectExecutor(queryRunner, subjects, options) {
        // -------------------------------------------------------------------------
        // Public Properties
        // -------------------------------------------------------------------------
        /**
         * Indicates if executor has any operations to execute (e.g. has insert / update / delete operations to be executed).
         */
        this.hasExecutableOperations = false;
        /**
         * Subjects that must be inserted.
         */
        this.insertSubjects = [];
        /**
         * Subjects that must be updated.
         */
        this.updateSubjects = [];
        /**
         * Subjects that must be removed.
         */
        this.removeSubjects = [];
        this.queryRunner = queryRunner;
        this.allSubjects = subjects;
        this.options = options;
        this.validate();
        this.recompute();
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Executes all operations over given array of subjects.
     * Executes queries using given query runner.
     */
    SubjectExecutor.prototype.execute = function () {
        return __awaiter(this, void 0, void 0, function () {
            var broadcasterResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        broadcasterResult = undefined;
                        if (!(!this.options || this.options.listeners !== false)) return [3 /*break*/, 2];
                        // console.time(".broadcastBeforeEventsForAll");
                        broadcasterResult = this.broadcastBeforeEventsForAll();
                        if (!(broadcasterResult.promises.length > 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.all(broadcasterResult.promises)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        // since event listeners and subscribers can call save methods and/or trigger entity changes we need to recompute operational subjects
                        // recompute only in the case if any listener or subscriber was really executed
                        if (broadcasterResult && broadcasterResult.count > 0) {
                            // console.time(".recompute");
                            this.recompute();
                            // console.timeEnd(".recompute");
                        }
                        // make sure our insert subjects are sorted (using topological sorting) to make cascade inserts work properly
                        // console.timeEnd("prepare");
                        // execute all insert operations
                        // console.time(".insertion");
                        this.insertSubjects = new SubjectTopoligicalSorter(this.insertSubjects).sort("insert");
                        return [4 /*yield*/, this.executeInsertOperations()];
                    case 3:
                        _a.sent();
                        // console.timeEnd(".insertion");
                        // recompute update operations since insertion can create updation operations for the
                        // properties it wasn't able to handle on its own (referenced columns)
                        this.updateSubjects = this.allSubjects.filter(function (subject) { return subject.mustBeUpdated; });
                        // execute update operations
                        // console.time(".updation");
                        return [4 /*yield*/, this.executeUpdateOperations()];
                    case 4:
                        // execute update operations
                        // console.time(".updation");
                        _a.sent();
                        // console.timeEnd(".updation");
                        // make sure our remove subjects are sorted (using topological sorting) when multiple entities are passed for the removal
                        // console.time(".removal");
                        this.removeSubjects = new SubjectTopoligicalSorter(this.removeSubjects).sort("delete");
                        return [4 /*yield*/, this.executeRemoveOperations()];
                    case 5:
                        _a.sent();
                        // console.timeEnd(".removal");
                        // update all special columns in persisted entities, like inserted id or remove ids from the removed entities
                        // console.time(".updateSpecialColumnsInPersistedEntities");
                        return [4 /*yield*/, this.updateSpecialColumnsInPersistedEntities()];
                    case 6:
                        // console.timeEnd(".removal");
                        // update all special columns in persisted entities, like inserted id or remove ids from the removed entities
                        // console.time(".updateSpecialColumnsInPersistedEntities");
                        _a.sent();
                        if (!(!this.options || this.options.listeners !== false)) return [3 /*break*/, 8];
                        // console.time(".broadcastAfterEventsForAll");
                        broadcasterResult = this.broadcastAfterEventsForAll();
                        if (!(broadcasterResult.promises.length > 0)) return [3 /*break*/, 8];
                        return [4 /*yield*/, Promise.all(broadcasterResult.promises)];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Validates all given subjects.
     */
    SubjectExecutor.prototype.validate = function () {
        this.allSubjects.forEach(function (subject) {
            if (subject.mustBeUpdated && subject.mustBeRemoved)
                throw new SubjectRemovedAndUpdatedError(subject);
        });
    };
    /**
     * Performs entity re-computations - finds changed columns, re-builds insert/update/remove subjects.
     */
    SubjectExecutor.prototype.recompute = function () {
        new SubjectChangedColumnsComputer().compute(this.allSubjects);
        this.insertSubjects = this.allSubjects.filter(function (subject) { return subject.mustBeInserted; });
        this.updateSubjects = this.allSubjects.filter(function (subject) { return subject.mustBeUpdated; });
        this.removeSubjects = this.allSubjects.filter(function (subject) { return subject.mustBeRemoved; });
        this.hasExecutableOperations = this.insertSubjects.length > 0 || this.updateSubjects.length > 0 || this.removeSubjects.length > 0;
    };
    /**
     * Broadcasts "BEFORE_INSERT", "BEFORE_UPDATE", "BEFORE_REMOVE" events for all given subjects.
     */
    SubjectExecutor.prototype.broadcastBeforeEventsForAll = function () {
        var _this = this;
        var result = new BroadcasterResult();
        if (this.insertSubjects.length)
            this.insertSubjects.forEach(function (subject) { return _this.queryRunner.broadcaster.broadcastBeforeInsertEvent(result, subject.metadata, subject.entity); });
        if (this.updateSubjects.length)
            this.updateSubjects.forEach(function (subject) { return _this.queryRunner.broadcaster.broadcastBeforeUpdateEvent(result, subject.metadata, subject.entity, subject.databaseEntity); });
        if (this.removeSubjects.length)
            this.removeSubjects.forEach(function (subject) { return _this.queryRunner.broadcaster.broadcastBeforeRemoveEvent(result, subject.metadata, subject.entity, subject.databaseEntity); });
        return result;
    };
    /**
     * Broadcasts "AFTER_INSERT", "AFTER_UPDATE", "AFTER_REMOVE" events for all given subjects.
     * Returns void if there wasn't any listener or subscriber executed.
     * Note: this method has a performance-optimized code organization.
     */
    SubjectExecutor.prototype.broadcastAfterEventsForAll = function () {
        var _this = this;
        var result = new BroadcasterResult();
        if (this.insertSubjects.length)
            this.insertSubjects.forEach(function (subject) { return _this.queryRunner.broadcaster.broadcastAfterInsertEvent(result, subject.metadata, subject.entity); });
        if (this.updateSubjects.length)
            this.updateSubjects.forEach(function (subject) { return _this.queryRunner.broadcaster.broadcastAfterUpdateEvent(result, subject.metadata, subject.entity, subject.databaseEntity); });
        if (this.removeSubjects.length)
            this.removeSubjects.forEach(function (subject) { return _this.queryRunner.broadcaster.broadcastAfterRemoveEvent(result, subject.metadata, subject.entity, subject.databaseEntity); });
        return result;
    };
    /**
     * Executes insert operations.
     */
    SubjectExecutor.prototype.executeInsertOperations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var _a, groupedInsertSubjects, groupedInsertSubjectKeys;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.groupBulkSubjects(this.insertSubjects, "insert"), groupedInsertSubjects = _a[0], groupedInsertSubjectKeys = _a[1];
                        // then we run insertion in the sequential order which is important since we have an ordered subjects
                        return [4 /*yield*/, PromiseUtils.runInSequence(groupedInsertSubjectKeys, function (groupName) { return __awaiter(_this, void 0, void 0, function () {
                                var _this = this;
                                var subjects, insertMaps, insertResult, manager;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            subjects = groupedInsertSubjects[groupName];
                                            insertMaps = subjects.map(function (subject) {
                                                if (_this.queryRunner.connection.driver instanceof MongoDriver) {
                                                    return subject.entity;
                                                }
                                                else {
                                                    return subject.createValueSetAndPopChangeMap();
                                                }
                                            });
                                            if (!(this.queryRunner instanceof MongoQueryRunner)) return [3 /*break*/, 2];
                                            manager = this.queryRunner.manager;
                                            return [4 /*yield*/, manager.insert(subjects[0].metadata.target, insertMaps)];
                                        case 1:
                                            insertResult = _a.sent();
                                            return [3 /*break*/, 4];
                                        case 2: return [4 /*yield*/, this.queryRunner
                                                .manager
                                                .createQueryBuilder()
                                                .insert()
                                                .into(subjects[0].metadata.target)
                                                .values(insertMaps)
                                                .updateEntity(this.options && this.options.reload === false ? false : true)
                                                .callListeners(false)
                                                .execute()];
                                        case 3:
                                            // here we execute our insertion query
                                            // we need to enable entity updation because we DO need to have updated insertedMap
                                            // which is not same object as our entity that's why we don't need to worry about our entity to get dirty
                                            // also, we disable listeners because we call them on our own in persistence layer
                                            insertResult = _a.sent();
                                            _a.label = 4;
                                        case 4:
                                            subjects.forEach(function (subject, index) {
                                                subject.identifier = insertResult.identifiers[index];
                                                subject.generatedMap = insertResult.generatedMaps[index];
                                                subject.insertedValueSet = insertMaps[index];
                                            });
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        // then we run insertion in the sequential order which is important since we have an ordered subjects
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Updates all given subjects in the database.
     */
    SubjectExecutor.prototype.executeUpdateOperations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(this.updateSubjects.map(function (subject) { return __awaiter(_this, void 0, void 0, function () {
                            var updateMap, manager, updateQueryBuilder, updateResult;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!subject.identifier)
                                            throw new SubjectWithoutIdentifierError(subject);
                                        updateMap = this.queryRunner.connection.driver instanceof MongoDriver ? subject.entity : subject.createValueSetAndPopChangeMap();
                                        if (!(this.queryRunner instanceof MongoQueryRunner)) return [3 /*break*/, 2];
                                        manager = this.queryRunner.manager;
                                        return [4 /*yield*/, manager.update(subject.metadata.target, subject.identifier, updateMap)];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 4];
                                    case 2:
                                        updateQueryBuilder = this.queryRunner
                                            .manager
                                            .createQueryBuilder()
                                            .update(subject.metadata.target)
                                            .set(updateMap)
                                            .updateEntity(this.options && this.options.reload === false ? false : true)
                                            .callListeners(false);
                                        if (subject.entity) {
                                            updateQueryBuilder.whereEntity(subject.identifier);
                                        }
                                        else {
                                            updateQueryBuilder.where(subject.identifier);
                                        }
                                        return [4 /*yield*/, updateQueryBuilder.execute()];
                                    case 3:
                                        updateResult = _a.sent();
                                        subject.generatedMap = updateResult.generatedMaps[0];
                                        _a.label = 4;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Removes all given subjects from the database.
     *
     * todo: we need to apply topological sort here as well
     */
    SubjectExecutor.prototype.executeRemoveOperations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var _a, groupedRemoveSubjects, groupedRemoveSubjectKeys;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.groupBulkSubjects(this.removeSubjects, "delete"), groupedRemoveSubjects = _a[0], groupedRemoveSubjectKeys = _a[1];
                        return [4 /*yield*/, PromiseUtils.runInSequence(groupedRemoveSubjectKeys, function (groupName) { return __awaiter(_this, void 0, void 0, function () {
                                var subjects, deleteMaps, manager;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            subjects = groupedRemoveSubjects[groupName];
                                            deleteMaps = subjects.map(function (subject) {
                                                if (!subject.identifier)
                                                    throw new SubjectWithoutIdentifierError(subject);
                                                return subject.identifier;
                                            });
                                            if (!(this.queryRunner instanceof MongoQueryRunner)) return [3 /*break*/, 2];
                                            manager = this.queryRunner.manager;
                                            return [4 /*yield*/, manager.delete(subjects[0].metadata.target, deleteMaps)];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 4];
                                        case 2: 
                                        // here we execute our deletion query
                                        // we don't need to specify entities and set update entity to true since the only thing query builder
                                        // will do for use is a primary keys deletion which is handled by us later once persistence is finished
                                        // also, we disable listeners because we call them on our own in persistence layer
                                        return [4 /*yield*/, this.queryRunner
                                                .manager
                                                .createQueryBuilder()
                                                .delete()
                                                .from(subjects[0].metadata.target)
                                                .where(deleteMaps)
                                                .callListeners(false)
                                                .execute()];
                                        case 3:
                                            // here we execute our deletion query
                                            // we don't need to specify entities and set update entity to true since the only thing query builder
                                            // will do for use is a primary keys deletion which is handled by us later once persistence is finished
                                            // also, we disable listeners because we call them on our own in persistence layer
                                            _a.sent();
                                            _a.label = 4;
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Updates all special columns of the saving entities (create date, update date, version, etc.).
     * Also updates nullable columns and columns with default values.
     */
    SubjectExecutor.prototype.updateSpecialColumnsInPersistedEntities = function () {
        // update inserted entity properties
        if (this.insertSubjects.length)
            this.updateSpecialColumnsInInsertedAndUpdatedEntities(this.insertSubjects);
        // update updated entity properties
        if (this.updateSubjects.length)
            this.updateSpecialColumnsInInsertedAndUpdatedEntities(this.updateSubjects);
        // remove ids from the entities that were removed
        if (this.removeSubjects.length) {
            this.removeSubjects.forEach(function (subject) {
                if (!subject.entity)
                    return;
                subject.metadata.primaryColumns.forEach(function (primaryColumn) {
                    primaryColumn.setEntityValue(subject.entity, undefined);
                });
            });
        }
        // other post-persist updations
        this.allSubjects.forEach(function (subject) {
            if (!subject.entity)
                return;
            subject.metadata.relationIds.forEach(function (relationId) {
                relationId.setValue(subject.entity);
            });
        });
    };
    /**
     * Updates all special columns of the saving entities (create date, update date, version, etc.).
     * Also updates nullable columns and columns with default values.
     */
    SubjectExecutor.prototype.updateSpecialColumnsInInsertedAndUpdatedEntities = function (subjects) {
        var _this = this;
        subjects.forEach(function (subject) {
            if (!subject.entity)
                return;
            // set values to "null" for nullable columns that did not have values
            subject.metadata.columns.forEach(function (column) {
                if (!column.isNullable || column.isVirtual)
                    return;
                var columnValue = column.getEntityValue(subject.entity);
                if (columnValue === undefined)
                    column.setEntityValue(subject.entity, null);
            });
            // merge into entity all generated values returned by a database
            if (subject.generatedMap)
                _this.queryRunner.manager.merge(subject.metadata.target, subject.entity, subject.generatedMap);
        });
    };
    /**
     * Groups subjects by metadata names (by tables) to make bulk insertions and deletions possible.
     * However there are some limitations with bulk insertions of data into tables with generated (increment) columns
     * in some drivers. Some drivers like mysql and sqlite does not support returning multiple generated columns
     * after insertion and can only return a single generated column value, that's why its not possible to do bulk insertion,
     * because it breaks insertion result's generatedMap and leads to problems when this subject is used in other subjects saves.
     * That's why we only support bulking in junction tables for those drivers.
     *
     * Other drivers like postgres and sql server support RETURNING / OUTPUT statement which allows to return generated
     * id for each inserted row, that's why bulk insertion is not limited to junction tables in there.
     */
    SubjectExecutor.prototype.groupBulkSubjects = function (subjects, type) {
        var group = {};
        var keys = [];
        var groupingAllowed = type === "delete" || this.queryRunner.connection.driver.isReturningSqlSupported();
        subjects.forEach(function (subject, index) {
            var key = groupingAllowed || subject.metadata.isJunction ? subject.metadata.name : subject.metadata.name + "_" + index;
            if (!group[key]) {
                group[key] = [subject];
                keys.push(key);
            }
            else {
                group[key].push(subject);
            }
        });
        return [group, keys];
    };
    return SubjectExecutor;
}());
export { SubjectExecutor };

//# sourceMappingURL=SubjectExecutor.js.map
