"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Contains all information about entity's foreign key.
 */
var ForeignKeyMetadata = /** @class */ (function () {
    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------
    function ForeignKeyMetadata(options) {
        /**
         * Array of columns of this foreign key.
         */
        this.columns = [];
        /**
         * Array of referenced columns.
         */
        this.referencedColumns = [];
        /**
         * Gets array of column names.
         */
        this.columnNames = [];
        /**
         * Gets array of referenced column names.
         */
        this.referencedColumnNames = [];
        this.entityMetadata = options.entityMetadata;
        this.referencedEntityMetadata = options.referencedEntityMetadata;
        this.columns = options.columns;
        this.referencedColumns = options.referencedColumns;
        this.onDelete = options.onDelete;
        if (options.namingStrategy)
            this.build(options.namingStrategy);
    }
    // ---------------------------------------------------------------------
    // Public Methods
    // ---------------------------------------------------------------------
    /**
     * Builds some depend foreign key properties.
     * Must be called after all entity metadatas and their columns are built.
     */
    ForeignKeyMetadata.prototype.build = function (namingStrategy) {
        this.columnNames = this.columns.map(function (column) { return column.databaseName; });
        this.referencedColumnNames = this.referencedColumns.map(function (column) { return column.databaseName; });
        this.tableName = this.entityMetadata.tableName;
        this.referencedTableName = this.referencedEntityMetadata.tableName;
        this.name = namingStrategy.foreignKeyName(this.tableName, this.columnNames, this.referencedEntityMetadata.tableName, this.referencedColumnNames);
    };
    return ForeignKeyMetadata;
}());
exports.ForeignKeyMetadata = ForeignKeyMetadata;

//# sourceMappingURL=ForeignKeyMetadata.js.map
