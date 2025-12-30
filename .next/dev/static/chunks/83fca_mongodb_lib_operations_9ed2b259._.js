(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AbstractOperation = exports.Aspect = void 0;
exports.defineAspects = defineAspects;
const bson_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/bson.js [app-client] (ecmascript)");
const read_preference_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/read_preference.js [app-client] (ecmascript)");
exports.Aspect = {
    READ_OPERATION: Symbol('READ_OPERATION'),
    WRITE_OPERATION: Symbol('WRITE_OPERATION'),
    RETRYABLE: Symbol('RETRYABLE'),
    EXPLAINABLE: Symbol('EXPLAINABLE'),
    SKIP_COLLATION: Symbol('SKIP_COLLATION'),
    CURSOR_CREATING: Symbol('CURSOR_CREATING'),
    MUST_SELECT_SAME_SERVER: Symbol('MUST_SELECT_SAME_SERVER'),
    COMMAND_BATCHING: Symbol('COMMAND_BATCHING'),
    SUPPORTS_RAW_DATA: Symbol('SUPPORTS_RAW_DATA')
};
/**
 * This class acts as a parent class for any operation and is responsible for setting this.options,
 * as well as setting and getting a session.
 * Additionally, this class implements `hasAspect`, which determines whether an operation has
 * a specific aspect.
 * @internal
 */ class AbstractOperation {
    constructor(options = {}){
        this.readPreference = this.hasAspect(exports.Aspect.WRITE_OPERATION) ? read_preference_1.ReadPreference.primary : read_preference_1.ReadPreference.fromOptions(options) ?? read_preference_1.ReadPreference.primary;
        // Pull the BSON serialize options from the already-resolved options
        this.bsonOptions = (0, bson_1.resolveBSONOptions)(options);
        this._session = options.session != null ? options.session : undefined;
        this.options = options;
        this.bypassPinningCheck = !!options.bypassPinningCheck;
    }
    hasAspect(aspect) {
        const ctor = this.constructor;
        if (ctor.aspects == null) {
            return false;
        }
        return ctor.aspects.has(aspect);
    }
    // Make sure the session is not writable from outside this class.
    get session() {
        return this._session;
    }
    set session(session) {
        this._session = session;
    }
    clearSession() {
        this._session = undefined;
    }
    resetBatch() {
        return true;
    }
    get canRetryRead() {
        return this.hasAspect(exports.Aspect.RETRYABLE) && this.hasAspect(exports.Aspect.READ_OPERATION);
    }
    get canRetryWrite() {
        return this.hasAspect(exports.Aspect.RETRYABLE) && this.hasAspect(exports.Aspect.WRITE_OPERATION);
    }
    /**
     * Given an instance of a MongoDBResponse, map the response to the correct result type.  For
     * example, a `CountOperation` might map the response as follows:
     *
     * ```typescript
     *  override handleOk(response: InstanceType<typeof this.SERVER_COMMAND_RESPONSE_TYPE>): TResult {
     *    return response.toObject(this.bsonOptions).n ?? 0;
     *  }
     *
     *  // or, with type safety:
     *  override handleOk(response: InstanceType<typeof this.SERVER_COMMAND_RESPONSE_TYPE>): TResult {
     *    return response.getNumber('n') ?? 0;
     *  }
     * ```
     */ handleOk(response) {
        return response.toObject(this.bsonOptions);
    }
    /**
     * Optional.
     *
     * If the operation performs error handling, such as wrapping, renaming the error, or squashing errors
     * this method can be overridden.
     */ handleError(error) {
        throw error;
    }
}
exports.AbstractOperation = AbstractOperation;
function defineAspects(operation, aspects) {
    if (!Array.isArray(aspects) && !(aspects instanceof Set)) {
        aspects = [
            aspects
        ];
    }
    aspects = new Set(aspects);
    Object.defineProperty(operation, 'aspects', {
        value: aspects,
        writable: false
    });
    return aspects;
} //# sourceMappingURL=operation.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CommandOperation = void 0;
const constants_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/constants.js [app-client] (ecmascript)");
const error_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/error.js [app-client] (ecmascript)");
const explain_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/explain.js [app-client] (ecmascript)");
const read_concern_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/read_concern.js [app-client] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/utils.js [app-client] (ecmascript)");
const write_concern_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/write_concern.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
/** @internal */ class CommandOperation extends operation_1.AbstractOperation {
    constructor(parent, options){
        super(options);
        this.options = options ?? {};
        // NOTE: this was explicitly added for the add/remove user operations, it's likely
        //       something we'd want to reconsider. Perhaps those commands can use `Admin`
        //       as a parent?
        const dbNameOverride = options?.dbName || options?.authdb;
        if (dbNameOverride) {
            this.ns = new utils_1.MongoDBNamespace(dbNameOverride, '$cmd');
        } else {
            this.ns = parent ? parent.s.namespace.withCollection('$cmd') : new utils_1.MongoDBNamespace('admin', '$cmd');
        }
        this.readConcern = read_concern_1.ReadConcern.fromOptions(options);
        this.writeConcern = write_concern_1.WriteConcern.fromOptions(options);
        if (this.hasAspect(operation_1.Aspect.EXPLAINABLE)) {
            this.explain = explain_1.Explain.fromOptions(options);
            if (this.explain) (0, explain_1.validateExplainTimeoutOptions)(this.options, this.explain);
        } else if (options?.explain != null) {
            throw new error_1.MongoInvalidArgumentError(`Option "explain" is not supported on this command`);
        }
    }
    get canRetryWrite() {
        if (this.hasAspect(operation_1.Aspect.EXPLAINABLE)) {
            return this.explain == null;
        }
        return super.canRetryWrite;
    }
    buildOptions(timeoutContext) {
        return {
            ...this.options,
            ...this.bsonOptions,
            timeoutContext,
            readPreference: this.readPreference,
            session: this.session
        };
    }
    buildCommand(connection, session) {
        const command = this.buildCommandDocument(connection, session);
        const inTransaction = this.session && this.session.inTransaction();
        if (this.readConcern && (0, utils_1.commandSupportsReadConcern)(command) && !inTransaction) {
            Object.assign(command, {
                readConcern: this.readConcern
            });
        }
        if (this.writeConcern && this.hasAspect(operation_1.Aspect.WRITE_OPERATION) && !inTransaction) {
            write_concern_1.WriteConcern.apply(command, this.writeConcern);
        }
        if (this.options.collation && typeof this.options.collation === 'object' && !this.hasAspect(operation_1.Aspect.SKIP_COLLATION)) {
            Object.assign(command, {
                collation: this.options.collation
            });
        }
        if (typeof this.options.maxTimeMS === 'number') {
            command.maxTimeMS = this.options.maxTimeMS;
        }
        if (this.options.rawData != null && this.hasAspect(operation_1.Aspect.SUPPORTS_RAW_DATA) && (0, utils_1.maxWireVersion)(connection) >= constants_1.MIN_SUPPORTED_RAW_DATA_WIRE_VERSION) {
            command.rawData = this.options.rawData;
        }
        if (this.hasAspect(operation_1.Aspect.EXPLAINABLE) && this.explain) {
            return (0, explain_1.decorateWithExplain)(command, this.explain);
        }
        return command;
    }
}
exports.CommandOperation = CommandOperation; //# sourceMappingURL=command.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/delete.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DeleteManyOperation = exports.DeleteOneOperation = exports.DeleteOperation = void 0;
exports.makeDeleteStatement = makeDeleteStatement;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const error_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/error.js [app-client] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/utils.js [app-client] (ecmascript)");
const command_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
/** @internal */ class DeleteOperation extends command_1.CommandOperation {
    constructor(ns, statements, options){
        super(undefined, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.options = options;
        this.ns = ns;
        this.statements = statements;
    }
    get commandName() {
        return 'delete';
    }
    get canRetryWrite() {
        if (super.canRetryWrite === false) {
            return false;
        }
        return this.statements.every((op)=>op.limit != null ? op.limit > 0 : true);
    }
    buildCommandDocument(connection, _session) {
        const options = this.options;
        const ordered = typeof options.ordered === 'boolean' ? options.ordered : true;
        const command = {
            delete: this.ns.collection,
            deletes: this.statements,
            ordered
        };
        if (options.let) {
            command.let = options.let;
        }
        // we check for undefined specifically here to allow falsy values
        // eslint-disable-next-line no-restricted-syntax
        if (options.comment !== undefined) {
            command.comment = options.comment;
        }
        const unacknowledgedWrite = this.writeConcern && this.writeConcern.w === 0;
        if (unacknowledgedWrite && (0, utils_1.maxWireVersion)(connection) < 9) {
            if (this.statements.find((o)=>o.hint)) {
                throw new error_1.MongoCompatibilityError(`hint for the delete command is only supported on MongoDB 4.4+`);
            }
        }
        return command;
    }
}
exports.DeleteOperation = DeleteOperation;
class DeleteOneOperation extends DeleteOperation {
    constructor(ns, filter, options){
        super(ns, [
            makeDeleteStatement(filter, {
                ...options,
                limit: 1
            })
        ], options);
    }
    handleOk(response) {
        const res = super.handleOk(response);
        // @ts-expect-error Explain commands have broken TS
        if (this.explain) return res;
        if (res.code) throw new error_1.MongoServerError(res);
        if (res.writeErrors) throw new error_1.MongoServerError(res.writeErrors[0]);
        return {
            acknowledged: this.writeConcern?.w !== 0,
            deletedCount: res.n
        };
    }
}
exports.DeleteOneOperation = DeleteOneOperation;
class DeleteManyOperation extends DeleteOperation {
    constructor(ns, filter, options){
        super(ns, [
            makeDeleteStatement(filter, options)
        ], options);
    }
    handleOk(response) {
        const res = super.handleOk(response);
        // @ts-expect-error Explain commands have broken TS
        if (this.explain) return res;
        if (res.code) throw new error_1.MongoServerError(res);
        if (res.writeErrors) throw new error_1.MongoServerError(res.writeErrors[0]);
        return {
            acknowledged: this.writeConcern?.w !== 0,
            deletedCount: res.n
        };
    }
}
exports.DeleteManyOperation = DeleteManyOperation;
function makeDeleteStatement(filter, options) {
    const op = {
        q: filter,
        limit: typeof options.limit === 'number' ? options.limit : 0
    };
    if (options.collation) {
        op.collation = options.collation;
    }
    if (options.hint) {
        op.hint = options.hint;
    }
    return op;
}
(0, operation_1.defineAspects)(DeleteOperation, [
    operation_1.Aspect.RETRYABLE,
    operation_1.Aspect.WRITE_OPERATION,
    operation_1.Aspect.SUPPORTS_RAW_DATA
]);
(0, operation_1.defineAspects)(DeleteOneOperation, [
    operation_1.Aspect.RETRYABLE,
    operation_1.Aspect.WRITE_OPERATION,
    operation_1.Aspect.EXPLAINABLE,
    operation_1.Aspect.SKIP_COLLATION,
    operation_1.Aspect.SUPPORTS_RAW_DATA
]);
(0, operation_1.defineAspects)(DeleteManyOperation, [
    operation_1.Aspect.WRITE_OPERATION,
    operation_1.Aspect.EXPLAINABLE,
    operation_1.Aspect.SKIP_COLLATION,
    operation_1.Aspect.SUPPORTS_RAW_DATA
]); //# sourceMappingURL=delete.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/aggregate.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AggregateOperation = exports.DB_AGGREGATE_COLLECTION = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const error_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/error.js [app-client] (ecmascript)");
const write_concern_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/write_concern.js [app-client] (ecmascript)");
const command_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
/** @internal */ exports.DB_AGGREGATE_COLLECTION = 1;
/** @internal */ class AggregateOperation extends command_1.CommandOperation {
    constructor(ns, pipeline, options){
        super(undefined, {
            ...options,
            dbName: ns.db
        });
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.CursorResponse;
        this.options = {
            ...options
        };
        // Covers when ns.collection is null, undefined or the empty string, use DB_AGGREGATE_COLLECTION
        this.target = ns.collection || exports.DB_AGGREGATE_COLLECTION;
        this.pipeline = pipeline;
        // determine if we have a write stage, override read preference if so
        this.hasWriteStage = false;
        if (typeof options?.out === 'string') {
            this.pipeline = this.pipeline.concat({
                $out: options.out
            });
            this.hasWriteStage = true;
        } else if (pipeline.length > 0) {
            const finalStage = pipeline[pipeline.length - 1];
            if (finalStage.$out || finalStage.$merge) {
                this.hasWriteStage = true;
            }
        }
        if (!this.hasWriteStage) {
            delete this.options.writeConcern;
        }
        if (options?.cursor != null && typeof options.cursor !== 'object') {
            throw new error_1.MongoInvalidArgumentError('Cursor options must be an object');
        }
        this.SERVER_COMMAND_RESPONSE_TYPE = this.explain ? responses_1.ExplainedCursorResponse : responses_1.CursorResponse;
    }
    get commandName() {
        return 'aggregate';
    }
    get canRetryRead() {
        return !this.hasWriteStage;
    }
    addToPipeline(stage) {
        this.pipeline.push(stage);
    }
    buildCommandDocument() {
        const options = this.options;
        const command = {
            aggregate: this.target,
            pipeline: this.pipeline
        };
        if (this.hasWriteStage && this.writeConcern) {
            write_concern_1.WriteConcern.apply(command, this.writeConcern);
        }
        if (options.bypassDocumentValidation === true) {
            command.bypassDocumentValidation = options.bypassDocumentValidation;
        }
        if (typeof options.allowDiskUse === 'boolean') {
            command.allowDiskUse = options.allowDiskUse;
        }
        if (options.hint) {
            command.hint = options.hint;
        }
        if (options.let) {
            command.let = options.let;
        }
        // we check for undefined specifically here to allow falsy values
        // eslint-disable-next-line no-restricted-syntax
        if (options.comment !== undefined) {
            command.comment = options.comment;
        }
        command.cursor = options.cursor || {};
        if (options.batchSize && !this.hasWriteStage) {
            command.cursor.batchSize = options.batchSize;
        }
        return command;
    }
    handleOk(response) {
        return response;
    }
}
exports.AggregateOperation = AggregateOperation;
(0, operation_1.defineAspects)(AggregateOperation, [
    operation_1.Aspect.READ_OPERATION,
    operation_1.Aspect.RETRYABLE,
    operation_1.Aspect.EXPLAINABLE,
    operation_1.Aspect.CURSOR_CREATING,
    operation_1.Aspect.SUPPORTS_RAW_DATA
]); //# sourceMappingURL=aggregate.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/execute_operation.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.executeOperation = executeOperation;
exports.autoConnect = autoConnect;
const constants_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/constants.js [app-client] (ecmascript)");
const error_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/error.js [app-client] (ecmascript)");
const read_preference_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/read_preference.js [app-client] (ecmascript)");
const server_selection_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/sdam/server_selection.js [app-client] (ecmascript)");
const timeout_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/timeout.js [app-client] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/utils.js [app-client] (ecmascript)");
const aggregate_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/aggregate.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
const MMAPv1_RETRY_WRITES_ERROR_CODE = error_1.MONGODB_ERROR_CODES.IllegalOperation;
const MMAPv1_RETRY_WRITES_ERROR_MESSAGE = 'This MongoDB deployment does not support retryable writes. Please add retryWrites=false to your connection string.';
/**
 * Executes the given operation with provided arguments.
 * @internal
 *
 * @remarks
 * Allows for a single point of entry to provide features such as implicit sessions, which
 * are required by the Driver Sessions specification in the event that a ClientSession is
 * not provided.
 *
 * The expectation is that this function:
 * - Connects the MongoClient if it has not already been connected, see {@link autoConnect}
 * - Creates a session if none is provided and cleans up the session it creates
 * - Tries an operation and retries under certain conditions, see {@link tryOperation}
 *
 * @typeParam T - The operation's type
 * @typeParam TResult - The type of the operation's result, calculated from T
 *
 * @param client - The MongoClient to execute this operation with
 * @param operation - The operation to execute
 */ async function executeOperation(client, operation, timeoutContext) {
    if (!(operation instanceof operation_1.AbstractOperation)) {
        // TODO(NODE-3483): Extend MongoRuntimeError
        throw new error_1.MongoRuntimeError('This method requires a valid operation instance');
    }
    const topology = client.topology == null ? await (0, utils_1.abortable)(autoConnect(client), operation.options) : client.topology;
    // The driver sessions spec mandates that we implicitly create sessions for operations
    // that are not explicitly provided with a session.
    let session = operation.session;
    let owner;
    if (session == null) {
        owner = Symbol();
        session = client.startSession({
            owner,
            explicit: false
        });
    } else if (session.hasEnded) {
        throw new error_1.MongoExpiredSessionError('Use of expired sessions is not permitted');
    } else if (session.snapshotEnabled && (0, utils_1.maxWireVersion)(topology) < constants_1.MIN_SUPPORTED_SNAPSHOT_READS_WIRE_VERSION) {
        throw new error_1.MongoCompatibilityError('Snapshot reads require MongoDB 5.0 or later');
    } else if (session.client !== client) {
        throw new error_1.MongoInvalidArgumentError('ClientSession must be from the same MongoClient');
    }
    operation.session ??= session;
    const readPreference = operation.readPreference ?? read_preference_1.ReadPreference.primary;
    const inTransaction = !!session?.inTransaction();
    const hasReadAspect = operation.hasAspect(operation_1.Aspect.READ_OPERATION);
    if (inTransaction && !readPreference.equals(read_preference_1.ReadPreference.primary) && (hasReadAspect || operation.commandName === 'runCommand')) {
        throw new error_1.MongoTransactionError(`Read preference in a transaction must be primary, not: ${readPreference.mode}`);
    }
    if (session?.isPinned && session.transaction.isCommitted && !operation.bypassPinningCheck) {
        session.unpin();
    }
    timeoutContext ??= timeout_1.TimeoutContext.create({
        session,
        serverSelectionTimeoutMS: client.s.options.serverSelectionTimeoutMS,
        waitQueueTimeoutMS: client.s.options.waitQueueTimeoutMS,
        timeoutMS: operation.options.timeoutMS
    });
    try {
        return await tryOperation(operation, {
            topology,
            timeoutContext,
            session,
            readPreference
        });
    } finally{
        if (session?.owner != null && session.owner === owner) {
            await session.endSession();
        }
    }
}
/**
 * Connects a client if it has not yet been connected
 * @internal
 */ async function autoConnect(client) {
    if (client.topology == null) {
        if (client.s.hasBeenClosed) {
            throw new error_1.MongoNotConnectedError('Client must be connected before running operations');
        }
        client.s.options.__skipPingOnConnect = true;
        try {
            await client.connect();
            if (client.topology == null) {
                throw new error_1.MongoRuntimeError('client.connect did not create a topology but also did not throw');
            }
            return client.topology;
        } finally{
            delete client.s.options.__skipPingOnConnect;
        }
    }
    return client.topology;
}
/**
 * Executes an operation and retries as appropriate
 * @internal
 *
 * @remarks
 * Implements behaviour described in [Retryable Reads](https://github.com/mongodb/specifications/blob/master/source/retryable-reads/retryable-reads.md) and [Retryable
 * Writes](https://github.com/mongodb/specifications/blob/master/source/retryable-writes/retryable-writes.md) specification
 *
 * This function:
 * - performs initial server selection
 * - attempts to execute an operation
 * - retries the operation if it meets the criteria for a retryable read or a retryable write
 *
 * @typeParam T - The operation's type
 * @typeParam TResult - The type of the operation's result, calculated from T
 *
 * @param operation - The operation to execute
 * */ async function tryOperation(operation, { topology, timeoutContext, session, readPreference }) {
    let selector;
    if (operation.hasAspect(operation_1.Aspect.MUST_SELECT_SAME_SERVER)) {
        // GetMore and KillCursor operations must always select the same server, but run through
        // server selection to potentially force monitor checks if the server is
        // in an unknown state.
        selector = (0, server_selection_1.sameServerSelector)(operation.server?.description);
    } else if (operation instanceof aggregate_1.AggregateOperation && operation.hasWriteStage) {
        // If operation should try to write to secondary use the custom server selector
        // otherwise provide the read preference.
        selector = (0, server_selection_1.secondaryWritableServerSelector)(topology.commonWireVersion, readPreference);
    } else {
        selector = readPreference;
    }
    let server = await topology.selectServer(selector, {
        session,
        operationName: operation.commandName,
        timeoutContext,
        signal: operation.options.signal
    });
    const hasReadAspect = operation.hasAspect(operation_1.Aspect.READ_OPERATION);
    const hasWriteAspect = operation.hasAspect(operation_1.Aspect.WRITE_OPERATION);
    const inTransaction = session?.inTransaction() ?? false;
    const willRetryRead = topology.s.options.retryReads && !inTransaction && operation.canRetryRead;
    const willRetryWrite = topology.s.options.retryWrites && !inTransaction && (0, utils_1.supportsRetryableWrites)(server) && operation.canRetryWrite;
    const willRetry = operation.hasAspect(operation_1.Aspect.RETRYABLE) && session != null && (hasReadAspect && willRetryRead || hasWriteAspect && willRetryWrite);
    if (hasWriteAspect && willRetryWrite && session != null) {
        operation.options.willRetryWrite = true;
        session.incrementTransactionNumber();
    }
    const maxTries = willRetry ? timeoutContext.csotEnabled() ? Infinity : 2 : 1;
    let previousOperationError;
    let previousServer;
    for(let tries = 0; tries < maxTries; tries++){
        if (previousOperationError) {
            if (hasWriteAspect && previousOperationError.code === MMAPv1_RETRY_WRITES_ERROR_CODE) {
                throw new error_1.MongoServerError({
                    message: MMAPv1_RETRY_WRITES_ERROR_MESSAGE,
                    errmsg: MMAPv1_RETRY_WRITES_ERROR_MESSAGE,
                    originalError: previousOperationError
                });
            }
            if (operation.hasAspect(operation_1.Aspect.COMMAND_BATCHING) && !operation.canRetryWrite) {
                throw previousOperationError;
            }
            if (hasWriteAspect && !(0, error_1.isRetryableWriteError)(previousOperationError)) throw previousOperationError;
            if (hasReadAspect && !(0, error_1.isRetryableReadError)(previousOperationError)) {
                throw previousOperationError;
            }
            if (previousOperationError instanceof error_1.MongoNetworkError && operation.hasAspect(operation_1.Aspect.CURSOR_CREATING) && session != null && session.isPinned && !session.inTransaction()) {
                session.unpin({
                    force: true,
                    forceClear: true
                });
            }
            server = await topology.selectServer(selector, {
                session,
                operationName: operation.commandName,
                previousServer,
                signal: operation.options.signal
            });
            if (hasWriteAspect && !(0, utils_1.supportsRetryableWrites)(server)) {
                throw new error_1.MongoUnexpectedServerResponseError('Selected server does not support retryable writes');
            }
        }
        operation.server = server;
        try {
            // If tries > 0 and we are command batching we need to reset the batch.
            if (tries > 0 && operation.hasAspect(operation_1.Aspect.COMMAND_BATCHING)) {
                operation.resetBatch();
            }
            try {
                const result = await server.command(operation, timeoutContext);
                return operation.handleOk(result);
            } catch (error) {
                return operation.handleError(error);
            }
        } catch (operationError) {
            if (!(operationError instanceof error_1.MongoError)) throw operationError;
            if (previousOperationError != null && operationError.hasErrorLabel(error_1.MongoErrorLabel.NoWritesPerformed)) {
                throw previousOperationError;
            }
            previousServer = server.description;
            previousOperationError = operationError;
            // Reset timeouts
            timeoutContext.clear();
        }
    }
    throw previousOperationError ?? new error_1.MongoRuntimeError('Tried to propagate retryability error, but no error was found.');
} //# sourceMappingURL=execute_operation.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/insert.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.InsertOneOperation = exports.InsertOperation = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const error_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/error.js [app-client] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/utils.js [app-client] (ecmascript)");
const command_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
/** @internal */ class InsertOperation extends command_1.CommandOperation {
    constructor(ns, documents, options){
        super(undefined, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.options = {
            ...options,
            checkKeys: options.checkKeys ?? false
        };
        this.ns = ns;
        this.documents = documents;
    }
    get commandName() {
        return 'insert';
    }
    buildCommandDocument(_connection, _session) {
        const options = this.options ?? {};
        const ordered = typeof options.ordered === 'boolean' ? options.ordered : true;
        const command = {
            insert: this.ns.collection,
            documents: this.documents,
            ordered
        };
        if (typeof options.bypassDocumentValidation === 'boolean') {
            command.bypassDocumentValidation = options.bypassDocumentValidation;
        }
        // we check for undefined specifically here to allow falsy values
        // eslint-disable-next-line no-restricted-syntax
        if (options.comment !== undefined) {
            command.comment = options.comment;
        }
        return command;
    }
}
exports.InsertOperation = InsertOperation;
class InsertOneOperation extends InsertOperation {
    constructor(collection, doc, options){
        super(collection.s.namespace, [
            (0, utils_1.maybeAddIdToDocuments)(collection, doc, options)
        ], options);
    }
    handleOk(response) {
        const res = super.handleOk(response);
        if (res.code) throw new error_1.MongoServerError(res);
        if (res.writeErrors) {
            // This should be a WriteError but we can't change it now because of error hierarchy
            throw new error_1.MongoServerError(res.writeErrors[0]);
        }
        return {
            acknowledged: this.writeConcern?.w !== 0,
            insertedId: this.documents[0]._id
        };
    }
}
exports.InsertOneOperation = InsertOneOperation;
(0, operation_1.defineAspects)(InsertOperation, [
    operation_1.Aspect.RETRYABLE,
    operation_1.Aspect.WRITE_OPERATION,
    operation_1.Aspect.SUPPORTS_RAW_DATA
]);
(0, operation_1.defineAspects)(InsertOneOperation, [
    operation_1.Aspect.RETRYABLE,
    operation_1.Aspect.WRITE_OPERATION,
    operation_1.Aspect.SUPPORTS_RAW_DATA
]); //# sourceMappingURL=insert.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/update.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ReplaceOneOperation = exports.UpdateManyOperation = exports.UpdateOneOperation = exports.UpdateOperation = void 0;
exports.makeUpdateStatement = makeUpdateStatement;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const error_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/error.js [app-client] (ecmascript)");
const sort_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/sort.js [app-client] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/utils.js [app-client] (ecmascript)");
const command_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
/**
 * @internal
 * UpdateOperation is used in bulk write, while UpdateOneOperation and UpdateManyOperation are only used in the collections API
 */ class UpdateOperation extends command_1.CommandOperation {
    constructor(ns, statements, options){
        super(undefined, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.options = options;
        this.ns = ns;
        this.statements = statements;
    }
    get commandName() {
        return 'update';
    }
    get canRetryWrite() {
        if (super.canRetryWrite === false) {
            return false;
        }
        return this.statements.every((op)=>op.multi == null || op.multi === false);
    }
    buildCommandDocument(_connection, _session) {
        const options = this.options;
        const command = {
            update: this.ns.collection,
            updates: this.statements,
            ordered: options.ordered ?? true
        };
        if (typeof options.bypassDocumentValidation === 'boolean') {
            command.bypassDocumentValidation = options.bypassDocumentValidation;
        }
        if (options.let) {
            command.let = options.let;
        }
        // we check for undefined specifically here to allow falsy values
        // eslint-disable-next-line no-restricted-syntax
        if (options.comment !== undefined) {
            command.comment = options.comment;
        }
        return command;
    }
}
exports.UpdateOperation = UpdateOperation;
/** @internal */ class UpdateOneOperation extends UpdateOperation {
    constructor(ns, filter, update, options){
        super(ns, [
            makeUpdateStatement(filter, update, {
                ...options,
                multi: false
            })
        ], options);
        if (!(0, utils_1.hasAtomicOperators)(update, options)) {
            throw new error_1.MongoInvalidArgumentError('Update document requires atomic operators');
        }
    }
    handleOk(response) {
        const res = super.handleOk(response);
        // @ts-expect-error Explain typing is broken
        if (this.explain != null) return res;
        if (res.code) throw new error_1.MongoServerError(res);
        if (res.writeErrors) throw new error_1.MongoServerError(res.writeErrors[0]);
        return {
            acknowledged: this.writeConcern?.w !== 0,
            modifiedCount: res.nModified ?? res.n,
            upsertedId: Array.isArray(res.upserted) && res.upserted.length > 0 ? res.upserted[0]._id : null,
            upsertedCount: Array.isArray(res.upserted) && res.upserted.length ? res.upserted.length : 0,
            matchedCount: Array.isArray(res.upserted) && res.upserted.length > 0 ? 0 : res.n
        };
    }
}
exports.UpdateOneOperation = UpdateOneOperation;
/** @internal */ class UpdateManyOperation extends UpdateOperation {
    constructor(ns, filter, update, options){
        super(ns, [
            makeUpdateStatement(filter, update, {
                ...options,
                multi: true
            })
        ], options);
        if (!(0, utils_1.hasAtomicOperators)(update, options)) {
            throw new error_1.MongoInvalidArgumentError('Update document requires atomic operators');
        }
    }
    handleOk(response) {
        const res = super.handleOk(response);
        // @ts-expect-error Explain typing is broken
        if (this.explain != null) return res;
        if (res.code) throw new error_1.MongoServerError(res);
        if (res.writeErrors) throw new error_1.MongoServerError(res.writeErrors[0]);
        return {
            acknowledged: this.writeConcern?.w !== 0,
            modifiedCount: res.nModified ?? res.n,
            upsertedId: Array.isArray(res.upserted) && res.upserted.length > 0 ? res.upserted[0]._id : null,
            upsertedCount: Array.isArray(res.upserted) && res.upserted.length ? res.upserted.length : 0,
            matchedCount: Array.isArray(res.upserted) && res.upserted.length > 0 ? 0 : res.n
        };
    }
}
exports.UpdateManyOperation = UpdateManyOperation;
/** @internal */ class ReplaceOneOperation extends UpdateOperation {
    constructor(ns, filter, replacement, options){
        super(ns, [
            makeUpdateStatement(filter, replacement, {
                ...options,
                multi: false
            })
        ], options);
        if ((0, utils_1.hasAtomicOperators)(replacement)) {
            throw new error_1.MongoInvalidArgumentError('Replacement document must not contain atomic operators');
        }
    }
    handleOk(response) {
        const res = super.handleOk(response);
        // @ts-expect-error Explain typing is broken
        if (this.explain != null) return res;
        if (res.code) throw new error_1.MongoServerError(res);
        if (res.writeErrors) throw new error_1.MongoServerError(res.writeErrors[0]);
        return {
            acknowledged: this.writeConcern?.w !== 0,
            modifiedCount: res.nModified ?? res.n,
            upsertedId: Array.isArray(res.upserted) && res.upserted.length > 0 ? res.upserted[0]._id : null,
            upsertedCount: Array.isArray(res.upserted) && res.upserted.length ? res.upserted.length : 0,
            matchedCount: Array.isArray(res.upserted) && res.upserted.length > 0 ? 0 : res.n
        };
    }
}
exports.ReplaceOneOperation = ReplaceOneOperation;
function makeUpdateStatement(filter, update, options) {
    if (filter == null || typeof filter !== 'object') {
        throw new error_1.MongoInvalidArgumentError('Selector must be a valid JavaScript object');
    }
    if (update == null || typeof update !== 'object') {
        throw new error_1.MongoInvalidArgumentError('Document must be a valid JavaScript object');
    }
    const op = {
        q: filter,
        u: update
    };
    if (typeof options.upsert === 'boolean') {
        op.upsert = options.upsert;
    }
    if (options.multi) {
        op.multi = options.multi;
    }
    if (options.hint) {
        op.hint = options.hint;
    }
    if (options.arrayFilters) {
        op.arrayFilters = options.arrayFilters;
    }
    if (options.collation) {
        op.collation = options.collation;
    }
    if (!options.multi && options.sort != null) {
        op.sort = (0, sort_1.formatSort)(options.sort);
    }
    return op;
}
(0, operation_1.defineAspects)(UpdateOperation, [
    operation_1.Aspect.RETRYABLE,
    operation_1.Aspect.WRITE_OPERATION,
    operation_1.Aspect.SKIP_COLLATION,
    operation_1.Aspect.SUPPORTS_RAW_DATA
]);
(0, operation_1.defineAspects)(UpdateOneOperation, [
    operation_1.Aspect.RETRYABLE,
    operation_1.Aspect.WRITE_OPERATION,
    operation_1.Aspect.EXPLAINABLE,
    operation_1.Aspect.SKIP_COLLATION,
    operation_1.Aspect.SUPPORTS_RAW_DATA
]);
(0, operation_1.defineAspects)(UpdateManyOperation, [
    operation_1.Aspect.WRITE_OPERATION,
    operation_1.Aspect.EXPLAINABLE,
    operation_1.Aspect.SKIP_COLLATION,
    operation_1.Aspect.SUPPORTS_RAW_DATA
]);
(0, operation_1.defineAspects)(ReplaceOneOperation, [
    operation_1.Aspect.RETRYABLE,
    operation_1.Aspect.WRITE_OPERATION,
    operation_1.Aspect.SKIP_COLLATION,
    operation_1.Aspect.SUPPORTS_RAW_DATA
]); //# sourceMappingURL=update.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/list_databases.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ListDatabasesOperation = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/utils.js [app-client] (ecmascript)");
const command_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
/** @internal */ class ListDatabasesOperation extends command_1.CommandOperation {
    constructor(db, options){
        super(db, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.options = options ?? {};
        this.ns = new utils_1.MongoDBNamespace('admin', '$cmd');
    }
    get commandName() {
        return 'listDatabases';
    }
    buildCommandDocument(connection, _session) {
        const cmd = {
            listDatabases: 1
        };
        if (typeof this.options.nameOnly === 'boolean') {
            cmd.nameOnly = this.options.nameOnly;
        }
        if (this.options.filter) {
            cmd.filter = this.options.filter;
        }
        if (typeof this.options.authorizedDatabases === 'boolean') {
            cmd.authorizedDatabases = this.options.authorizedDatabases;
        }
        // we check for undefined specifically here to allow falsy values
        // eslint-disable-next-line no-restricted-syntax
        if ((0, utils_1.maxWireVersion)(connection) >= 9 && this.options.comment !== undefined) {
            cmd.comment = this.options.comment;
        }
        return cmd;
    }
}
exports.ListDatabasesOperation = ListDatabasesOperation;
(0, operation_1.defineAspects)(ListDatabasesOperation, [
    operation_1.Aspect.READ_OPERATION,
    operation_1.Aspect.RETRYABLE
]); //# sourceMappingURL=list_databases.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/remove_user.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RemoveUserOperation = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const command_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
/** @internal */ class RemoveUserOperation extends command_1.CommandOperation {
    constructor(db, username, options){
        super(db, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.options = options;
        this.username = username;
    }
    get commandName() {
        return 'dropUser';
    }
    buildCommandDocument(_connection) {
        return {
            dropUser: this.username
        };
    }
    handleOk(_response) {
        return true;
    }
}
exports.RemoveUserOperation = RemoveUserOperation;
(0, operation_1.defineAspects)(RemoveUserOperation, [
    operation_1.Aspect.WRITE_OPERATION
]); //# sourceMappingURL=remove_user.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/run_command.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RunCursorCommandOperation = exports.RunCommandOperation = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
/** @internal */ class RunCommandOperation extends operation_1.AbstractOperation {
    constructor(namespace, command, options){
        super(options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.command = command;
        this.options = options;
        this.ns = namespace.withCollection('$cmd');
    }
    get commandName() {
        return 'runCommand';
    }
    buildCommand(_connection, _session) {
        return this.command;
    }
    buildOptions(timeoutContext) {
        return {
            ...this.options,
            session: this.session,
            timeoutContext,
            signal: this.options.signal,
            readPreference: this.options.readPreference
        };
    }
}
exports.RunCommandOperation = RunCommandOperation;
/**
 * @internal
 *
 * A specialized subclass of RunCommandOperation for cursor-creating commands.
 */ class RunCursorCommandOperation extends RunCommandOperation {
    constructor(){
        super(...arguments);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.CursorResponse;
    }
    handleOk(response) {
        return response;
    }
}
exports.RunCursorCommandOperation = RunCursorCommandOperation; //# sourceMappingURL=run_command.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/validate_collection.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ValidateCollectionOperation = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const error_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/error.js [app-client] (ecmascript)");
const command_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)");
/** @internal */ class ValidateCollectionOperation extends command_1.CommandOperation {
    constructor(admin, collectionName, options){
        super(admin.s.db, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.options = options;
        this.collectionName = collectionName;
    }
    get commandName() {
        return 'validate';
    }
    buildCommandDocument(_connection, _session) {
        // Decorate command with extra options
        return {
            validate: this.collectionName,
            ...Object.fromEntries(Object.entries(this.options).filter((entry)=>entry[0] !== 'session'))
        };
    }
    handleOk(response) {
        const result = super.handleOk(response);
        if (result.result != null && typeof result.result !== 'string') throw new error_1.MongoUnexpectedServerResponseError('Error with validation data');
        if (result.result != null && result.result.match(/exception|corrupt/) != null) throw new error_1.MongoUnexpectedServerResponseError(`Invalid collection ${this.collectionName}`);
        if (result.valid != null && !result.valid) throw new error_1.MongoUnexpectedServerResponseError(`Invalid collection ${this.collectionName}`);
        return response;
    }
}
exports.ValidateCollectionOperation = ValidateCollectionOperation; //# sourceMappingURL=validate_collection.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/get_more.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GetMoreOperation = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const error_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/error.js [app-client] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/utils.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
/** @internal */ class GetMoreOperation extends operation_1.AbstractOperation {
    constructor(ns, cursorId, server, options){
        super(options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.CursorResponse;
        this.options = options;
        this.ns = ns;
        this.cursorId = cursorId;
        this.server = server;
    }
    get commandName() {
        return 'getMore';
    }
    buildCommand(connection) {
        if (this.cursorId == null || this.cursorId.isZero()) {
            throw new error_1.MongoRuntimeError('Unable to iterate cursor with no id');
        }
        const collection = this.ns.collection;
        if (collection == null) {
            // Cursors should have adopted the namespace returned by MongoDB
            // which should always defined a collection name (even a pseudo one, ex. db.aggregate())
            throw new error_1.MongoRuntimeError('A collection name must be determined before getMore');
        }
        const getMoreCmd = {
            getMore: this.cursorId,
            collection
        };
        if (typeof this.options.batchSize === 'number') {
            getMoreCmd.batchSize = Math.abs(this.options.batchSize);
        }
        if (typeof this.options.maxAwaitTimeMS === 'number') {
            getMoreCmd.maxTimeMS = this.options.maxAwaitTimeMS;
        }
        // we check for undefined specifically here to allow falsy values
        // eslint-disable-next-line no-restricted-syntax
        if (this.options.comment !== undefined && (0, utils_1.maxWireVersion)(connection) >= 9) {
            getMoreCmd.comment = this.options.comment;
        }
        return getMoreCmd;
    }
    buildOptions(timeoutContext) {
        return {
            returnFieldSelector: null,
            documentsReturnedIn: 'nextBatch',
            timeoutContext,
            ...this.options
        };
    }
    handleOk(response) {
        return response;
    }
}
exports.GetMoreOperation = GetMoreOperation;
(0, operation_1.defineAspects)(GetMoreOperation, [
    operation_1.Aspect.READ_OPERATION,
    operation_1.Aspect.MUST_SELECT_SAME_SERVER
]); //# sourceMappingURL=get_more.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/kill_cursors.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.KillCursorsOperation = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const error_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/error.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
class KillCursorsOperation extends operation_1.AbstractOperation {
    constructor(cursorId, ns, server, options){
        super(options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.ns = ns;
        this.cursorId = cursorId;
        this.server = server;
    }
    get commandName() {
        return 'killCursors';
    }
    buildCommand(_connection, _session) {
        const killCursors = this.ns.collection;
        if (killCursors == null) {
            // Cursors should have adopted the namespace returned by MongoDB
            // which should always defined a collection name (even a pseudo one, ex. db.aggregate())
            throw new error_1.MongoRuntimeError('A collection name must be determined before killCursors');
        }
        const killCursorsCommand = {
            killCursors,
            cursors: [
                this.cursorId
            ]
        };
        return killCursorsCommand;
    }
    buildOptions(timeoutContext) {
        return {
            session: this.session,
            timeoutContext
        };
    }
    handleError(_error) {
    // The driver should never emit errors from killCursors, this is spec-ed behavior
    }
}
exports.KillCursorsOperation = KillCursorsOperation;
(0, operation_1.defineAspects)(KillCursorsOperation, [
    operation_1.Aspect.MUST_SELECT_SAME_SERVER
]); //# sourceMappingURL=kill_cursors.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/count.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CountOperation = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const command_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
/** @internal */ class CountOperation extends command_1.CommandOperation {
    constructor(namespace, filter, options){
        super({
            s: {
                namespace: namespace
            }
        }, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.options = options;
        this.collectionName = namespace.collection;
        this.query = filter;
    }
    get commandName() {
        return 'count';
    }
    buildCommandDocument(_connection, _session) {
        const options = this.options;
        const cmd = {
            count: this.collectionName,
            query: this.query
        };
        if (typeof options.limit === 'number') {
            cmd.limit = options.limit;
        }
        if (typeof options.skip === 'number') {
            cmd.skip = options.skip;
        }
        if (options.hint != null) {
            cmd.hint = options.hint;
        }
        if (typeof options.maxTimeMS === 'number') {
            cmd.maxTimeMS = options.maxTimeMS;
        }
        return cmd;
    }
    handleOk(response) {
        return response.getNumber('n') ?? 0;
    }
}
exports.CountOperation = CountOperation;
(0, operation_1.defineAspects)(CountOperation, [
    operation_1.Aspect.READ_OPERATION,
    operation_1.Aspect.RETRYABLE,
    operation_1.Aspect.SUPPORTS_RAW_DATA
]); //# sourceMappingURL=count.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/find.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FindOperation = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const error_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/error.js [app-client] (ecmascript)");
const sort_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/sort.js [app-client] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/utils.js [app-client] (ecmascript)");
const command_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
/** @internal */ class FindOperation extends command_1.CommandOperation {
    constructor(ns, filter = {}, options = {}){
        super(undefined, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.CursorResponse;
        this.options = {
            ...options
        };
        delete this.options.writeConcern;
        this.ns = ns;
        if (typeof filter !== 'object' || Array.isArray(filter)) {
            throw new error_1.MongoInvalidArgumentError('Query filter must be a plain object or ObjectId');
        }
        // special case passing in an ObjectId as a filter
        this.filter = filter != null && filter._bsontype === 'ObjectId' ? {
            _id: filter
        } : filter;
        this.SERVER_COMMAND_RESPONSE_TYPE = this.explain ? responses_1.ExplainedCursorResponse : responses_1.CursorResponse;
    }
    get commandName() {
        return 'find';
    }
    buildOptions(timeoutContext) {
        return {
            ...this.options,
            ...this.bsonOptions,
            documentsReturnedIn: 'firstBatch',
            session: this.session,
            timeoutContext
        };
    }
    handleOk(response) {
        return response;
    }
    buildCommandDocument() {
        return makeFindCommand(this.ns, this.filter, this.options);
    }
}
exports.FindOperation = FindOperation;
function makeFindCommand(ns, filter, options) {
    const findCommand = {
        find: ns.collection,
        filter
    };
    if (options.sort) {
        findCommand.sort = (0, sort_1.formatSort)(options.sort);
    }
    if (options.projection) {
        let projection = options.projection;
        if (projection && Array.isArray(projection)) {
            projection = projection.length ? projection.reduce((result, field)=>{
                result[field] = 1;
                return result;
            }, {}) : {
                _id: 1
            };
        }
        findCommand.projection = projection;
    }
    if (options.hint) {
        findCommand.hint = (0, utils_1.normalizeHintField)(options.hint);
    }
    if (typeof options.skip === 'number') {
        findCommand.skip = options.skip;
    }
    if (typeof options.limit === 'number') {
        if (options.limit < 0) {
            findCommand.limit = -options.limit;
            findCommand.singleBatch = true;
        } else {
            findCommand.limit = options.limit;
        }
    }
    if (typeof options.batchSize === 'number') {
        if (options.batchSize < 0) {
            findCommand.limit = -options.batchSize;
        } else {
            if (options.batchSize === options.limit) {
                // Spec dictates that if these are equal the batchSize should be one more than the
                // limit to avoid leaving the cursor open.
                findCommand.batchSize = options.batchSize + 1;
            } else {
                findCommand.batchSize = options.batchSize;
            }
        }
    }
    if (typeof options.singleBatch === 'boolean') {
        findCommand.singleBatch = options.singleBatch;
    }
    // we check for undefined specifically here to allow falsy values
    // eslint-disable-next-line no-restricted-syntax
    if (options.comment !== undefined) {
        findCommand.comment = options.comment;
    }
    if (options.max) {
        findCommand.max = options.max;
    }
    if (options.min) {
        findCommand.min = options.min;
    }
    if (typeof options.returnKey === 'boolean') {
        findCommand.returnKey = options.returnKey;
    }
    if (typeof options.showRecordId === 'boolean') {
        findCommand.showRecordId = options.showRecordId;
    }
    if (typeof options.tailable === 'boolean') {
        findCommand.tailable = options.tailable;
    }
    if (typeof options.oplogReplay === 'boolean') {
        findCommand.oplogReplay = options.oplogReplay;
    }
    if (typeof options.timeout === 'boolean') {
        findCommand.noCursorTimeout = !options.timeout;
    } else if (typeof options.noCursorTimeout === 'boolean') {
        findCommand.noCursorTimeout = options.noCursorTimeout;
    }
    if (typeof options.awaitData === 'boolean') {
        findCommand.awaitData = options.awaitData;
    }
    if (typeof options.allowPartialResults === 'boolean') {
        findCommand.allowPartialResults = options.allowPartialResults;
    }
    if (typeof options.allowDiskUse === 'boolean') {
        findCommand.allowDiskUse = options.allowDiskUse;
    }
    if (options.let) {
        findCommand.let = options.let;
    }
    return findCommand;
}
(0, operation_1.defineAspects)(FindOperation, [
    operation_1.Aspect.READ_OPERATION,
    operation_1.Aspect.RETRYABLE,
    operation_1.Aspect.EXPLAINABLE,
    operation_1.Aspect.CURSOR_CREATING,
    operation_1.Aspect.SUPPORTS_RAW_DATA
]); //# sourceMappingURL=find.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/indexes.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ListIndexesOperation = exports.DropIndexOperation = exports.CreateIndexesOperation = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const error_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/error.js [app-client] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/utils.js [app-client] (ecmascript)");
const command_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
const VALID_INDEX_OPTIONS = new Set([
    'background',
    'unique',
    'name',
    'partialFilterExpression',
    'sparse',
    'hidden',
    'expireAfterSeconds',
    'storageEngine',
    'collation',
    'version',
    // text indexes
    'weights',
    'default_language',
    'language_override',
    'textIndexVersion',
    // 2d-sphere indexes
    '2dsphereIndexVersion',
    // 2d indexes
    'bits',
    'min',
    'max',
    // geoHaystack Indexes
    'bucketSize',
    // wildcard indexes
    'wildcardProjection'
]);
function isIndexDirection(x) {
    return typeof x === 'number' || x === '2d' || x === '2dsphere' || x === 'text' || x === 'geoHaystack';
}
function isSingleIndexTuple(t) {
    return Array.isArray(t) && t.length === 2 && isIndexDirection(t[1]);
}
/**
 * Converts an `IndexSpecification`, which can be specified in multiple formats, into a
 * valid `key` for the createIndexes command.
 */ function constructIndexDescriptionMap(indexSpec) {
    const key = new Map();
    const indexSpecs = !Array.isArray(indexSpec) || isSingleIndexTuple(indexSpec) ? [
        indexSpec
    ] : indexSpec;
    // Iterate through array and handle different types
    for (const spec of indexSpecs){
        if (typeof spec === 'string') {
            key.set(spec, 1);
        } else if (Array.isArray(spec)) {
            key.set(spec[0], spec[1] ?? 1);
        } else if (spec instanceof Map) {
            for (const [property, value] of spec){
                key.set(property, value);
            }
        } else if ((0, utils_1.isObject)(spec)) {
            for (const [property, value] of Object.entries(spec)){
                key.set(property, value);
            }
        }
    }
    return key;
}
/**
 * Receives an index description and returns a modified index description which has had invalid options removed
 * from the description and has mapped the `version` option to the `v` option.
 */ function resolveIndexDescription(description) {
    const validProvidedOptions = Object.entries(description).filter(([optionName])=>VALID_INDEX_OPTIONS.has(optionName));
    return Object.fromEntries(// we support the `version` option, but the `createIndexes` command expects it to be the `v`
    validProvidedOptions.map(([name, value])=>name === 'version' ? [
            'v',
            value
        ] : [
            name,
            value
        ]));
}
/** @internal */ class CreateIndexesOperation extends command_1.CommandOperation {
    constructor(parent, collectionName, indexes, options){
        super(parent, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.options = options ?? {};
        // collation is set on each index, it should not be defined at the root
        this.options.collation = undefined;
        this.collectionName = collectionName;
        this.indexes = indexes.map((userIndex)=>{
            // Ensure the key is a Map to preserve index key ordering
            const key = userIndex.key instanceof Map ? userIndex.key : new Map(Object.entries(userIndex.key));
            const name = userIndex.name ?? Array.from(key).flat().join('_');
            const validIndexOptions = resolveIndexDescription(userIndex);
            return {
                ...validIndexOptions,
                name,
                key
            };
        });
        this.ns = parent.s.namespace;
    }
    static fromIndexDescriptionArray(parent, collectionName, indexes, options) {
        return new CreateIndexesOperation(parent, collectionName, indexes, options);
    }
    static fromIndexSpecification(parent, collectionName, indexSpec, options = {}) {
        const key = constructIndexDescriptionMap(indexSpec);
        const description = {
            ...options,
            key
        };
        return new CreateIndexesOperation(parent, collectionName, [
            description
        ], options);
    }
    get commandName() {
        return 'createIndexes';
    }
    buildCommandDocument(connection) {
        const options = this.options;
        const indexes = this.indexes;
        const serverWireVersion = (0, utils_1.maxWireVersion)(connection);
        const cmd = {
            createIndexes: this.collectionName,
            indexes
        };
        if (options.commitQuorum != null) {
            if (serverWireVersion < 9) {
                throw new error_1.MongoCompatibilityError('Option `commitQuorum` for `createIndexes` not supported on servers < 4.4');
            }
            cmd.commitQuorum = options.commitQuorum;
        }
        return cmd;
    }
    handleOk(_response) {
        const indexNames = this.indexes.map((index)=>index.name || '');
        return indexNames;
    }
}
exports.CreateIndexesOperation = CreateIndexesOperation;
/** @internal */ class DropIndexOperation extends command_1.CommandOperation {
    constructor(collection, indexName, options){
        super(collection, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.options = options ?? {};
        this.collection = collection;
        this.indexName = indexName;
        this.ns = collection.fullNamespace;
    }
    get commandName() {
        return 'dropIndexes';
    }
    buildCommandDocument(_connection) {
        return {
            dropIndexes: this.collection.collectionName,
            index: this.indexName
        };
    }
}
exports.DropIndexOperation = DropIndexOperation;
/** @internal */ class ListIndexesOperation extends command_1.CommandOperation {
    constructor(collection, options){
        super(collection, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.CursorResponse;
        this.options = {
            ...options
        };
        delete this.options.writeConcern;
        this.collectionNamespace = collection.s.namespace;
    }
    get commandName() {
        return 'listIndexes';
    }
    buildCommandDocument(connection) {
        const serverWireVersion = (0, utils_1.maxWireVersion)(connection);
        const cursor = this.options.batchSize ? {
            batchSize: this.options.batchSize
        } : {};
        const command = {
            listIndexes: this.collectionNamespace.collection,
            cursor
        };
        // we check for undefined specifically here to allow falsy values
        // eslint-disable-next-line no-restricted-syntax
        if (serverWireVersion >= 9 && this.options.comment !== undefined) {
            command.comment = this.options.comment;
        }
        return command;
    }
    handleOk(response) {
        return response;
    }
}
exports.ListIndexesOperation = ListIndexesOperation;
(0, operation_1.defineAspects)(ListIndexesOperation, [
    operation_1.Aspect.READ_OPERATION,
    operation_1.Aspect.RETRYABLE,
    operation_1.Aspect.CURSOR_CREATING,
    operation_1.Aspect.SUPPORTS_RAW_DATA
]);
(0, operation_1.defineAspects)(CreateIndexesOperation, [
    operation_1.Aspect.WRITE_OPERATION,
    operation_1.Aspect.SUPPORTS_RAW_DATA
]);
(0, operation_1.defineAspects)(DropIndexOperation, [
    operation_1.Aspect.WRITE_OPERATION,
    operation_1.Aspect.SUPPORTS_RAW_DATA
]); //# sourceMappingURL=indexes.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/distinct.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DistinctOperation = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const command_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
/**
 * Return a list of distinct values for the given key across a collection.
 * @internal
 */ class DistinctOperation extends command_1.CommandOperation {
    /**
     * Construct a Distinct operation.
     *
     * @param collection - Collection instance.
     * @param key - Field of the document to find distinct values for.
     * @param query - The query for filtering the set of documents to which we apply the distinct filter.
     * @param options - Optional settings. See Collection.prototype.distinct for a list of options.
     */ constructor(collection, key, query, options){
        super(collection, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.options = options ?? {};
        this.collection = collection;
        this.key = key;
        this.query = query;
    }
    get commandName() {
        return 'distinct';
    }
    buildCommandDocument(_connection) {
        const command = {
            distinct: this.collection.collectionName,
            key: this.key,
            query: this.query
        };
        // we check for undefined specifically here to allow falsy values
        // eslint-disable-next-line no-restricted-syntax
        if (this.options.comment !== undefined) {
            command.comment = this.options.comment;
        }
        if (this.options.hint != null) {
            command.hint = this.options.hint;
        }
        return command;
    }
    handleOk(response) {
        if (this.explain) {
            return response.toObject(this.bsonOptions);
        }
        return response.toObject(this.bsonOptions).values;
    }
}
exports.DistinctOperation = DistinctOperation;
(0, operation_1.defineAspects)(DistinctOperation, [
    operation_1.Aspect.READ_OPERATION,
    operation_1.Aspect.RETRYABLE,
    operation_1.Aspect.EXPLAINABLE,
    operation_1.Aspect.SUPPORTS_RAW_DATA
]); //# sourceMappingURL=distinct.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/estimated_document_count.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EstimatedDocumentCountOperation = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const command_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
/** @internal */ class EstimatedDocumentCountOperation extends command_1.CommandOperation {
    constructor(collection, options = {}){
        super(collection, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.options = options;
        this.collectionName = collection.collectionName;
    }
    get commandName() {
        return 'count';
    }
    buildCommandDocument(_connection, _session) {
        const cmd = {
            count: this.collectionName
        };
        if (typeof this.options.maxTimeMS === 'number') {
            cmd.maxTimeMS = this.options.maxTimeMS;
        }
        // we check for undefined specifically here to allow falsy values
        // eslint-disable-next-line no-restricted-syntax
        if (this.options.comment !== undefined) {
            cmd.comment = this.options.comment;
        }
        return cmd;
    }
    handleOk(response) {
        return response.getNumber('n') ?? 0;
    }
}
exports.EstimatedDocumentCountOperation = EstimatedDocumentCountOperation;
(0, operation_1.defineAspects)(EstimatedDocumentCountOperation, [
    operation_1.Aspect.READ_OPERATION,
    operation_1.Aspect.RETRYABLE,
    operation_1.Aspect.CURSOR_CREATING,
    operation_1.Aspect.SUPPORTS_RAW_DATA
]); //# sourceMappingURL=estimated_document_count.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/find_and_modify.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FindOneAndUpdateOperation = exports.FindOneAndReplaceOperation = exports.FindOneAndDeleteOperation = exports.FindAndModifyOperation = exports.ReturnDocument = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const error_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/error.js [app-client] (ecmascript)");
const read_preference_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/read_preference.js [app-client] (ecmascript)");
const sort_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/sort.js [app-client] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/utils.js [app-client] (ecmascript)");
const command_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
/** @public */ exports.ReturnDocument = Object.freeze({
    BEFORE: 'before',
    AFTER: 'after'
});
function configureFindAndModifyCmdBaseUpdateOpts(cmdBase, options) {
    cmdBase.new = options.returnDocument === exports.ReturnDocument.AFTER;
    cmdBase.upsert = options.upsert === true;
    if (options.bypassDocumentValidation === true) {
        cmdBase.bypassDocumentValidation = options.bypassDocumentValidation;
    }
    return cmdBase;
}
/** @internal */ class FindAndModifyOperation extends command_1.CommandOperation {
    constructor(collection, query, options){
        super(collection, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.options = options;
        // force primary read preference
        this.readPreference = read_preference_1.ReadPreference.primary;
        this.collection = collection;
        this.query = query;
    }
    get commandName() {
        return 'findAndModify';
    }
    buildCommandDocument(connection, _session) {
        const options = this.options;
        const command = {
            findAndModify: this.collection.collectionName,
            query: this.query,
            remove: false,
            new: false,
            upsert: false
        };
        options.includeResultMetadata ??= false;
        const sort = (0, sort_1.formatSort)(options.sort);
        if (sort) {
            command.sort = sort;
        }
        if (options.projection) {
            command.fields = options.projection;
        }
        if (options.maxTimeMS) {
            command.maxTimeMS = options.maxTimeMS;
        }
        // Decorate the findAndModify command with the write Concern
        if (options.writeConcern) {
            command.writeConcern = options.writeConcern;
        }
        if (options.let) {
            command.let = options.let;
        }
        // we check for undefined specifically here to allow falsy values
        // eslint-disable-next-line no-restricted-syntax
        if (options.comment !== undefined) {
            command.comment = options.comment;
        }
        (0, utils_1.decorateWithCollation)(command, options);
        if (options.hint) {
            const unacknowledgedWrite = this.writeConcern?.w === 0;
            if (unacknowledgedWrite && (0, utils_1.maxWireVersion)(connection) < 9) {
                throw new error_1.MongoCompatibilityError('hint for the findAndModify command is only supported on MongoDB 4.4+');
            }
            command.hint = options.hint;
        }
        return command;
    }
    handleOk(response) {
        const result = super.handleOk(response);
        return this.options.includeResultMetadata ? result : result.value ?? null;
    }
}
exports.FindAndModifyOperation = FindAndModifyOperation;
/** @internal */ class FindOneAndDeleteOperation extends FindAndModifyOperation {
    constructor(collection, filter, options){
        // Basic validation
        if (filter == null || typeof filter !== 'object') {
            throw new error_1.MongoInvalidArgumentError('Argument "filter" must be an object');
        }
        super(collection, filter, options);
    }
    buildCommandDocument(connection, session) {
        const document = super.buildCommandDocument(connection, session);
        document.remove = true;
        return document;
    }
}
exports.FindOneAndDeleteOperation = FindOneAndDeleteOperation;
/** @internal */ class FindOneAndReplaceOperation extends FindAndModifyOperation {
    constructor(collection, filter, replacement, options){
        if (filter == null || typeof filter !== 'object') {
            throw new error_1.MongoInvalidArgumentError('Argument "filter" must be an object');
        }
        if (replacement == null || typeof replacement !== 'object') {
            throw new error_1.MongoInvalidArgumentError('Argument "replacement" must be an object');
        }
        if ((0, utils_1.hasAtomicOperators)(replacement)) {
            throw new error_1.MongoInvalidArgumentError('Replacement document must not contain atomic operators');
        }
        super(collection, filter, options);
        this.replacement = replacement;
    }
    buildCommandDocument(connection, session) {
        const document = super.buildCommandDocument(connection, session);
        document.update = this.replacement;
        configureFindAndModifyCmdBaseUpdateOpts(document, this.options);
        return document;
    }
}
exports.FindOneAndReplaceOperation = FindOneAndReplaceOperation;
/** @internal */ class FindOneAndUpdateOperation extends FindAndModifyOperation {
    constructor(collection, filter, update, options){
        if (filter == null || typeof filter !== 'object') {
            throw new error_1.MongoInvalidArgumentError('Argument "filter" must be an object');
        }
        if (update == null || typeof update !== 'object') {
            throw new error_1.MongoInvalidArgumentError('Argument "update" must be an object');
        }
        if (!(0, utils_1.hasAtomicOperators)(update, options)) {
            throw new error_1.MongoInvalidArgumentError('Update document requires atomic operators');
        }
        super(collection, filter, options);
        this.update = update;
        this.options = options;
    }
    buildCommandDocument(connection, session) {
        const document = super.buildCommandDocument(connection, session);
        document.update = this.update;
        configureFindAndModifyCmdBaseUpdateOpts(document, this.options);
        if (this.options.arrayFilters) {
            document.arrayFilters = this.options.arrayFilters;
        }
        return document;
    }
}
exports.FindOneAndUpdateOperation = FindOneAndUpdateOperation;
(0, operation_1.defineAspects)(FindAndModifyOperation, [
    operation_1.Aspect.WRITE_OPERATION,
    operation_1.Aspect.RETRYABLE,
    operation_1.Aspect.EXPLAINABLE,
    operation_1.Aspect.SUPPORTS_RAW_DATA
]); //# sourceMappingURL=find_and_modify.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/rename.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RenameOperation = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const collection_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/collection.js [app-client] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/utils.js [app-client] (ecmascript)");
const command_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
/** @internal */ class RenameOperation extends command_1.CommandOperation {
    constructor(collection, newName, options){
        super(collection, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.collection = collection;
        this.newName = newName;
        this.options = options;
        this.ns = new utils_1.MongoDBNamespace('admin', '$cmd');
    }
    get commandName() {
        return 'renameCollection';
    }
    buildCommandDocument(_connection, _session) {
        const renameCollection = this.collection.namespace;
        const to = this.collection.s.namespace.withCollection(this.newName).toString();
        const dropTarget = typeof this.options.dropTarget === 'boolean' ? this.options.dropTarget : false;
        return {
            renameCollection,
            to,
            dropTarget
        };
    }
    handleOk(_response) {
        return new collection_1.Collection(this.collection.db, this.newName, this.collection.s.options);
    }
}
exports.RenameOperation = RenameOperation;
(0, operation_1.defineAspects)(RenameOperation, [
    operation_1.Aspect.WRITE_OPERATION
]); //# sourceMappingURL=rename.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/search_indexes/create.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CreateSearchIndexesOperation = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
/** @internal */ class CreateSearchIndexesOperation extends operation_1.AbstractOperation {
    constructor(collection, descriptions){
        super();
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.collection = collection;
        this.descriptions = descriptions;
        this.ns = collection.fullNamespace;
    }
    get commandName() {
        return 'createSearchIndexes';
    }
    buildCommand(_connection, _session) {
        const namespace = this.collection.fullNamespace;
        return {
            createSearchIndexes: namespace.collection,
            indexes: this.descriptions
        };
    }
    handleOk(response) {
        return super.handleOk(response).indexesCreated.map((val)=>val.name);
    }
    buildOptions(timeoutContext) {
        return {
            session: this.session,
            timeoutContext
        };
    }
}
exports.CreateSearchIndexesOperation = CreateSearchIndexesOperation; //# sourceMappingURL=create.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/search_indexes/drop.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DropSearchIndexOperation = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const error_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/error.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
/** @internal */ class DropSearchIndexOperation extends operation_1.AbstractOperation {
    constructor(collection, name){
        super();
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.collection = collection;
        this.name = name;
        this.ns = collection.fullNamespace;
    }
    get commandName() {
        return 'dropSearchIndex';
    }
    buildCommand(_connection, _session) {
        const namespace = this.collection.fullNamespace;
        const command = {
            dropSearchIndex: namespace.collection
        };
        if (typeof this.name === 'string') {
            command.name = this.name;
        }
        return command;
    }
    handleOk(_response) {
    // do nothing
    }
    buildOptions(timeoutContext) {
        return {
            session: this.session,
            timeoutContext
        };
    }
    handleError(error) {
        const isNamespaceNotFoundError = error instanceof error_1.MongoServerError && error.code === error_1.MONGODB_ERROR_CODES.NamespaceNotFound;
        if (!isNamespaceNotFoundError) {
            throw error;
        }
    }
}
exports.DropSearchIndexOperation = DropSearchIndexOperation; //# sourceMappingURL=drop.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/search_indexes/update.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UpdateSearchIndexOperation = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
/** @internal */ class UpdateSearchIndexOperation extends operation_1.AbstractOperation {
    constructor(collection, name, definition){
        super();
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.collection = collection;
        this.name = name;
        this.definition = definition;
        this.ns = collection.fullNamespace;
    }
    get commandName() {
        return 'updateSearchIndex';
    }
    buildCommand(_connection, _session) {
        const namespace = this.collection.fullNamespace;
        return {
            updateSearchIndex: namespace.collection,
            name: this.name,
            definition: this.definition
        };
    }
    handleOk(_response) {
    // no response.
    }
    buildOptions(timeoutContext) {
        return {
            session: this.session,
            timeoutContext
        };
    }
}
exports.UpdateSearchIndexOperation = UpdateSearchIndexOperation; //# sourceMappingURL=update.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/list_collections.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ListCollectionsOperation = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/utils.js [app-client] (ecmascript)");
const command_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
/** @internal */ class ListCollectionsOperation extends command_1.CommandOperation {
    constructor(db, filter, options){
        super(db, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.CursorResponse;
        this.options = {
            ...options
        };
        delete this.options.writeConcern;
        this.db = db;
        this.filter = filter;
        this.nameOnly = !!this.options.nameOnly;
        this.authorizedCollections = !!this.options.authorizedCollections;
        if (typeof this.options.batchSize === 'number') {
            this.batchSize = this.options.batchSize;
        }
        this.SERVER_COMMAND_RESPONSE_TYPE = this.explain ? responses_1.ExplainedCursorResponse : responses_1.CursorResponse;
    }
    get commandName() {
        return 'listCollections';
    }
    buildCommandDocument(connection) {
        const command = {
            listCollections: 1,
            filter: this.filter,
            cursor: this.batchSize ? {
                batchSize: this.batchSize
            } : {},
            nameOnly: this.nameOnly,
            authorizedCollections: this.authorizedCollections
        };
        // we check for undefined specifically here to allow falsy values
        // eslint-disable-next-line no-restricted-syntax
        if ((0, utils_1.maxWireVersion)(connection) >= 9 && this.options.comment !== undefined) {
            command.comment = this.options.comment;
        }
        return command;
    }
    handleOk(response) {
        return response;
    }
}
exports.ListCollectionsOperation = ListCollectionsOperation;
(0, operation_1.defineAspects)(ListCollectionsOperation, [
    operation_1.Aspect.READ_OPERATION,
    operation_1.Aspect.RETRYABLE,
    operation_1.Aspect.CURSOR_CREATING,
    operation_1.Aspect.SUPPORTS_RAW_DATA
]); //# sourceMappingURL=list_collections.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/create_collection.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CreateCollectionOperation = void 0;
exports.createCollections = createCollections;
const constants_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/constants.js [app-client] (ecmascript)");
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const collection_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/collection.js [app-client] (ecmascript)");
const error_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/error.js [app-client] (ecmascript)");
const timeout_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/timeout.js [app-client] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/utils.js [app-client] (ecmascript)");
const command_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)");
const execute_operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/execute_operation.js [app-client] (ecmascript)");
const indexes_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/indexes.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
const ILLEGAL_COMMAND_FIELDS = new Set([
    'w',
    'wtimeout',
    'timeoutMS',
    'j',
    'fsync',
    'pkFactory',
    'raw',
    'readPreference',
    'session',
    'readConcern',
    'writeConcern',
    'raw',
    'fieldsAsRaw',
    'useBigInt64',
    'promoteLongs',
    'promoteValues',
    'promoteBuffers',
    'bsonRegExp',
    'serializeFunctions',
    'ignoreUndefined',
    'enableUtf8Validation'
]);
/* @internal */ const INVALID_QE_VERSION = 'Driver support of Queryable Encryption is incompatible with server. Upgrade server to use Queryable Encryption.';
/** @internal */ class CreateCollectionOperation extends command_1.CommandOperation {
    constructor(db, name, options = {}){
        super(db, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.options = options;
        this.db = db;
        this.name = name;
    }
    get commandName() {
        return 'create';
    }
    buildCommandDocument(_connection, _session) {
        const isOptionValid = ([k, v])=>v != null && typeof v !== 'function' && !ILLEGAL_COMMAND_FIELDS.has(k);
        return {
            create: this.name,
            ...Object.fromEntries(Object.entries(this.options).filter(isOptionValid))
        };
    }
    handleOk(_response) {
        return new collection_1.Collection(this.db, this.name, this.options);
    }
}
exports.CreateCollectionOperation = CreateCollectionOperation;
async function createCollections(db, name, options) {
    const timeoutContext = timeout_1.TimeoutContext.create({
        session: options.session,
        serverSelectionTimeoutMS: db.client.s.options.serverSelectionTimeoutMS,
        waitQueueTimeoutMS: db.client.s.options.waitQueueTimeoutMS,
        timeoutMS: options.timeoutMS
    });
    const encryptedFields = options.encryptedFields ?? db.client.s.options.autoEncryption?.encryptedFieldsMap?.[`${db.databaseName}.${name}`];
    if (encryptedFields) {
        class CreateSupportingFLEv2CollectionOperation extends CreateCollectionOperation {
            buildCommandDocument(connection, session) {
                if (!connection.description.loadBalanced && (0, utils_1.maxWireVersion)(connection) < constants_1.MIN_SUPPORTED_QE_WIRE_VERSION) {
                    throw new error_1.MongoCompatibilityError(`${INVALID_QE_VERSION} The minimum server version required is ${constants_1.MIN_SUPPORTED_QE_SERVER_VERSION}`);
                }
                return super.buildCommandDocument(connection, session);
            }
        }
        // Create auxilliary collections for queryable encryption support.
        const escCollection = encryptedFields.escCollection ?? `enxcol_.${name}.esc`;
        const ecocCollection = encryptedFields.ecocCollection ?? `enxcol_.${name}.ecoc`;
        for (const collectionName of [
            escCollection,
            ecocCollection
        ]){
            const createOp = new CreateSupportingFLEv2CollectionOperation(db, collectionName, {
                clusteredIndex: {
                    key: {
                        _id: 1
                    },
                    unique: true
                },
                session: options.session
            });
            await (0, execute_operation_1.executeOperation)(db.client, createOp, timeoutContext);
        }
        if (!options.encryptedFields) {
            options = {
                ...options,
                encryptedFields
            };
        }
    }
    const coll = await (0, execute_operation_1.executeOperation)(db.client, new CreateCollectionOperation(db, name, options), timeoutContext);
    if (encryptedFields) {
        // Create the required index for queryable encryption support.
        const createIndexOp = indexes_1.CreateIndexesOperation.fromIndexSpecification(db, name, {
            __safeContent__: 1
        }, {
            session: options.session
        });
        await (0, execute_operation_1.executeOperation)(db.client, createIndexOp, timeoutContext);
    }
    return coll;
}
(0, operation_1.defineAspects)(CreateCollectionOperation, [
    operation_1.Aspect.WRITE_OPERATION
]); //# sourceMappingURL=create_collection.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/drop.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DropDatabaseOperation = exports.DropCollectionOperation = void 0;
exports.dropCollections = dropCollections;
const __1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/index.js [app-client] (ecmascript)");
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const abstract_cursor_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cursor/abstract_cursor.js [app-client] (ecmascript)");
const error_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/error.js [app-client] (ecmascript)");
const timeout_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/timeout.js [app-client] (ecmascript)");
const command_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)");
const execute_operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/execute_operation.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
/** @internal */ class DropCollectionOperation extends command_1.CommandOperation {
    constructor(db, name, options = {}){
        super(db, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.options = options;
        this.name = name;
    }
    get commandName() {
        return 'drop';
    }
    buildCommandDocument(_connection, _session) {
        return {
            drop: this.name
        };
    }
    handleOk(_response) {
        return true;
    }
    handleError(error) {
        if (!(error instanceof __1.MongoServerError)) throw error;
        if (Number(error.code) !== error_1.MONGODB_ERROR_CODES.NamespaceNotFound) throw error;
        return false;
    }
}
exports.DropCollectionOperation = DropCollectionOperation;
async function dropCollections(db, name, options) {
    const timeoutContext = timeout_1.TimeoutContext.create({
        session: options.session,
        serverSelectionTimeoutMS: db.client.s.options.serverSelectionTimeoutMS,
        waitQueueTimeoutMS: db.client.s.options.waitQueueTimeoutMS,
        timeoutMS: options.timeoutMS
    });
    const encryptedFieldsMap = db.client.s.options.autoEncryption?.encryptedFieldsMap;
    let encryptedFields = options.encryptedFields ?? encryptedFieldsMap?.[`${db.databaseName}.${name}`];
    if (!encryptedFields && encryptedFieldsMap) {
        // If the MongoClient was configured with an encryptedFieldsMap,
        // and no encryptedFields config was available in it or explicitly
        // passed as an argument, the spec tells us to look one up using
        // listCollections().
        const listCollectionsResult = await db.listCollections({
            name
        }, {
            nameOnly: false,
            session: options.session,
            timeoutContext: new abstract_cursor_1.CursorTimeoutContext(timeoutContext, Symbol())
        }).toArray();
        encryptedFields = listCollectionsResult?.[0]?.options?.encryptedFields;
    }
    if (encryptedFields) {
        const escCollection = encryptedFields.escCollection || `enxcol_.${name}.esc`;
        const ecocCollection = encryptedFields.ecocCollection || `enxcol_.${name}.ecoc`;
        for (const collectionName of [
            escCollection,
            ecocCollection
        ]){
            // Drop auxilliary collections, ignoring potential NamespaceNotFound errors.
            const dropOp = new DropCollectionOperation(db, collectionName, options);
            await (0, execute_operation_1.executeOperation)(db.client, dropOp, timeoutContext);
        }
    }
    return await (0, execute_operation_1.executeOperation)(db.client, new DropCollectionOperation(db, name, options), timeoutContext);
}
/** @internal */ class DropDatabaseOperation extends command_1.CommandOperation {
    constructor(db, options){
        super(db, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.options = options;
    }
    get commandName() {
        return 'dropDatabase';
    }
    buildCommandDocument(_connection, _session) {
        return {
            dropDatabase: 1
        };
    }
    handleOk(_response) {
        return true;
    }
}
exports.DropDatabaseOperation = DropDatabaseOperation;
(0, operation_1.defineAspects)(DropCollectionOperation, [
    operation_1.Aspect.WRITE_OPERATION
]);
(0, operation_1.defineAspects)(DropDatabaseOperation, [
    operation_1.Aspect.WRITE_OPERATION
]); //# sourceMappingURL=drop.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/profiling_level.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ProfilingLevelOperation = void 0;
const bson_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/bson.js [app-client] (ecmascript)");
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const error_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/error.js [app-client] (ecmascript)");
const command_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)");
class ProfilingLevelResponse extends responses_1.MongoDBResponse {
    get was() {
        return this.get('was', bson_1.BSONType.int, true);
    }
}
/** @internal */ class ProfilingLevelOperation extends command_1.CommandOperation {
    constructor(db, options){
        super(db, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = ProfilingLevelResponse;
        this.options = options;
    }
    get commandName() {
        return 'profile';
    }
    buildCommandDocument(_connection) {
        return {
            profile: -1
        };
    }
    handleOk(response) {
        if (response.ok === 1) {
            const was = response.was;
            if (was === 0) return 'off';
            if (was === 1) return 'slow_only';
            if (was === 2) return 'all';
            throw new error_1.MongoUnexpectedServerResponseError(`Illegal profiling level value ${was}`);
        } else {
            throw new error_1.MongoUnexpectedServerResponseError('Error with profile command');
        }
    }
}
exports.ProfilingLevelOperation = ProfilingLevelOperation; //# sourceMappingURL=profiling_level.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/set_profiling_level.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SetProfilingLevelOperation = exports.ProfilingLevel = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const error_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/error.js [app-client] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/utils.js [app-client] (ecmascript)");
const command_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)");
const levelValues = new Set([
    'off',
    'slow_only',
    'all'
]);
/** @public */ exports.ProfilingLevel = Object.freeze({
    off: 'off',
    slowOnly: 'slow_only',
    all: 'all'
});
/** @internal */ class SetProfilingLevelOperation extends command_1.CommandOperation {
    constructor(db, level, options){
        super(db, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.options = options;
        switch(level){
            case exports.ProfilingLevel.off:
                this.profile = 0;
                break;
            case exports.ProfilingLevel.slowOnly:
                this.profile = 1;
                break;
            case exports.ProfilingLevel.all:
                this.profile = 2;
                break;
            default:
                this.profile = 0;
                break;
        }
        this.level = level;
    }
    get commandName() {
        return 'profile';
    }
    buildCommandDocument(_connection) {
        const level = this.level;
        if (!levelValues.has(level)) {
            // TODO(NODE-3483): Determine error to put here
            throw new error_1.MongoInvalidArgumentError(`Profiling level must be one of "${(0, utils_1.enumToString)(exports.ProfilingLevel)}"`);
        }
        return {
            profile: this.profile
        };
    }
    handleOk(_response) {
        return this.level;
    }
}
exports.SetProfilingLevelOperation = SetProfilingLevelOperation; //# sourceMappingURL=set_profiling_level.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/stats.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DbStatsOperation = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const command_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
/** @internal */ class DbStatsOperation extends command_1.CommandOperation {
    constructor(db, options){
        super(db, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.options = options;
    }
    get commandName() {
        return 'dbStats';
    }
    buildCommandDocument(_connection) {
        const command = {
            dbStats: true
        };
        if (this.options.scale != null) {
            command.scale = this.options.scale;
        }
        return command;
    }
}
exports.DbStatsOperation = DbStatsOperation;
(0, operation_1.defineAspects)(DbStatsOperation, [
    operation_1.Aspect.READ_OPERATION
]); //# sourceMappingURL=stats.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/client_bulk_write/client_bulk_write.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ClientBulkWriteOperation = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/utils.js [app-client] (ecmascript)");
const command_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
/**
 * Executes a single client bulk write operation within a potential batch.
 * @internal
 */ class ClientBulkWriteOperation extends command_1.CommandOperation {
    get commandName() {
        return 'bulkWrite';
    }
    constructor(commandBuilder, options){
        super(undefined, options);
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.ClientBulkWriteCursorResponse;
        this.commandBuilder = commandBuilder;
        this.options = options;
        this.ns = new utils_1.MongoDBNamespace('admin', '$cmd');
    }
    resetBatch() {
        return this.commandBuilder.resetBatch();
    }
    get canRetryWrite() {
        return this.commandBuilder.isBatchRetryable;
    }
    handleOk(response) {
        return response;
    }
    buildCommandDocument(connection, _session) {
        const command = this.commandBuilder.buildBatch(connection.description.maxMessageSizeBytes, connection.description.maxWriteBatchSize, connection.description.maxBsonObjectSize);
        // Check _after_ the batch is built if we cannot retry it and override the option.
        if (!this.canRetryWrite) {
            this.options.willRetryWrite = false;
        }
        return command;
    }
}
exports.ClientBulkWriteOperation = ClientBulkWriteOperation;
// Skipping the collation as it goes on the individual ops.
(0, operation_1.defineAspects)(ClientBulkWriteOperation, [
    operation_1.Aspect.WRITE_OPERATION,
    operation_1.Aspect.SKIP_COLLATION,
    operation_1.Aspect.CURSOR_CREATING,
    operation_1.Aspect.RETRYABLE,
    operation_1.Aspect.COMMAND_BATCHING,
    operation_1.Aspect.SUPPORTS_RAW_DATA
]); //# sourceMappingURL=client_bulk_write.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/client_bulk_write/command_builder.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.buildReplaceOneOperation = exports.buildUpdateManyOperation = exports.buildUpdateOneOperation = exports.buildDeleteManyOperation = exports.buildDeleteOneOperation = exports.buildInsertOneOperation = exports.ClientBulkWriteCommandBuilder = void 0;
exports.buildOperation = buildOperation;
const bson_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/bson.js [app-client] (ecmascript)");
const commands_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/commands.js [app-client] (ecmascript)");
const error_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/error.js [app-client] (ecmascript)");
const sort_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/sort.js [app-client] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/utils.js [app-client] (ecmascript)");
/**
 * The bytes overhead for the extra fields added post command generation.
 */ const MESSAGE_OVERHEAD_BYTES = 1000;
/** @internal */ class ClientBulkWriteCommandBuilder {
    /**
     * Create the command builder.
     * @param models - The client write models.
     */ constructor(models, options, pkFactory){
        this.models = models;
        this.options = options;
        this.pkFactory = pkFactory ?? utils_1.DEFAULT_PK_FACTORY;
        this.currentModelIndex = 0;
        this.previousModelIndex = 0;
        this.lastOperations = [];
        this.isBatchRetryable = true;
    }
    /**
     * Gets the errorsOnly value for the command, which is the inverse of the
     * user provided verboseResults option. Defaults to true.
     */ get errorsOnly() {
        if ('verboseResults' in this.options) {
            return !this.options.verboseResults;
        }
        return true;
    }
    /**
     * Determines if there is another batch to process.
     * @returns True if not all batches have been built.
     */ hasNextBatch() {
        return this.currentModelIndex < this.models.length;
    }
    /**
     * When we need to retry a command we need to set the current
     * model index back to its previous value.
     */ resetBatch() {
        this.currentModelIndex = this.previousModelIndex;
        return true;
    }
    /**
     * Build a single batch of a client bulk write command.
     * @param maxMessageSizeBytes - The max message size in bytes.
     * @param maxWriteBatchSize - The max write batch size.
     * @returns The client bulk write command.
     */ buildBatch(maxMessageSizeBytes, maxWriteBatchSize, maxBsonObjectSize) {
        // We start by assuming the batch has no multi-updates, so it is retryable
        // until we find them.
        this.isBatchRetryable = true;
        let commandLength = 0;
        let currentNamespaceIndex = 0;
        const command = this.baseCommand();
        const namespaces = new Map();
        // In the case of retries we need to mark where we started this batch.
        this.previousModelIndex = this.currentModelIndex;
        while(this.currentModelIndex < this.models.length){
            const model = this.models[this.currentModelIndex];
            const ns = model.namespace;
            const nsIndex = namespaces.get(ns);
            // Multi updates are not retryable.
            if (model.name === 'deleteMany' || model.name === 'updateMany') {
                this.isBatchRetryable = false;
            }
            if (nsIndex != null) {
                // Build the operation and serialize it to get the bytes buffer.
                const operation = buildOperation(model, nsIndex, this.pkFactory, this.options);
                let operationBuffer;
                try {
                    operationBuffer = bson_1.BSON.serialize(operation);
                } catch (cause) {
                    throw new error_1.MongoInvalidArgumentError(`Could not serialize operation to BSON`, {
                        cause
                    });
                }
                validateBufferSize('ops', operationBuffer, maxBsonObjectSize);
                // Check if the operation buffer can fit in the command. If it can,
                // then add the operation to the document sequence and increment the
                // current length as long as the ops don't exceed the maxWriteBatchSize.
                if (commandLength + operationBuffer.length < maxMessageSizeBytes && command.ops.documents.length < maxWriteBatchSize) {
                    // Pushing to the ops document sequence returns the total byte length of the document sequence.
                    commandLength = MESSAGE_OVERHEAD_BYTES + command.ops.push(operation, operationBuffer);
                    // Increment the builder's current model index.
                    this.currentModelIndex++;
                } else {
                    break;
                }
            } else {
                // The namespace is not already in the nsInfo so we will set it in the map, and
                // construct our nsInfo and ops documents and buffers.
                namespaces.set(ns, currentNamespaceIndex);
                const nsInfo = {
                    ns: ns
                };
                const operation = buildOperation(model, currentNamespaceIndex, this.pkFactory, this.options);
                let nsInfoBuffer;
                let operationBuffer;
                try {
                    nsInfoBuffer = bson_1.BSON.serialize(nsInfo);
                    operationBuffer = bson_1.BSON.serialize(operation);
                } catch (cause) {
                    throw new error_1.MongoInvalidArgumentError(`Could not serialize ns info to BSON`, {
                        cause
                    });
                }
                validateBufferSize('nsInfo', nsInfoBuffer, maxBsonObjectSize);
                validateBufferSize('ops', operationBuffer, maxBsonObjectSize);
                // Check if the operation and nsInfo buffers can fit in the command. If they
                // can, then add the operation and nsInfo to their respective document
                // sequences and increment the current length as long as the ops don't exceed
                // the maxWriteBatchSize.
                if (commandLength + nsInfoBuffer.length + operationBuffer.length < maxMessageSizeBytes && command.ops.documents.length < maxWriteBatchSize) {
                    // Pushing to the ops document sequence returns the total byte length of the document sequence.
                    commandLength = MESSAGE_OVERHEAD_BYTES + command.nsInfo.push(nsInfo, nsInfoBuffer) + command.ops.push(operation, operationBuffer);
                    // We've added a new namespace, increment the namespace index.
                    currentNamespaceIndex++;
                    // Increment the builder's current model index.
                    this.currentModelIndex++;
                } else {
                    break;
                }
            }
        }
        // Set the last operations and return the command.
        this.lastOperations = command.ops.documents;
        return command;
    }
    baseCommand() {
        const command = {
            bulkWrite: 1,
            errorsOnly: this.errorsOnly,
            ordered: this.options.ordered ?? true,
            ops: new commands_1.DocumentSequence('ops'),
            nsInfo: new commands_1.DocumentSequence('nsInfo')
        };
        // Add bypassDocumentValidation if it was present in the options.
        if (this.options.bypassDocumentValidation != null) {
            command.bypassDocumentValidation = this.options.bypassDocumentValidation;
        }
        // Add let if it was present in the options.
        if (this.options.let) {
            command.let = this.options.let;
        }
        // we check for undefined specifically here to allow falsy values
        // eslint-disable-next-line no-restricted-syntax
        if (this.options.comment !== undefined) {
            command.comment = this.options.comment;
        }
        return command;
    }
}
exports.ClientBulkWriteCommandBuilder = ClientBulkWriteCommandBuilder;
function validateBufferSize(name, buffer, maxBsonObjectSize) {
    if (buffer.length > maxBsonObjectSize) {
        throw new error_1.MongoInvalidArgumentError(`Client bulk write operation ${name} of length ${buffer.length} exceeds the max bson object size of ${maxBsonObjectSize}`);
    }
}
/**
 * Build the insert one operation.
 * @param model - The insert one model.
 * @param index - The namespace index.
 * @returns the operation.
 */ const buildInsertOneOperation = (model, index, pkFactory)=>{
    const document = {
        insert: index,
        document: model.document
    };
    document.document._id = model.document._id ?? pkFactory.createPk();
    return document;
};
exports.buildInsertOneOperation = buildInsertOneOperation;
/**
 * Build the delete one operation.
 * @param model - The insert many model.
 * @param index - The namespace index.
 * @returns the operation.
 */ const buildDeleteOneOperation = (model, index)=>{
    return createDeleteOperation(model, index, false);
};
exports.buildDeleteOneOperation = buildDeleteOneOperation;
/**
 * Build the delete many operation.
 * @param model - The delete many model.
 * @param index - The namespace index.
 * @returns the operation.
 */ const buildDeleteManyOperation = (model, index)=>{
    return createDeleteOperation(model, index, true);
};
exports.buildDeleteManyOperation = buildDeleteManyOperation;
/**
 * Creates a delete operation based on the parameters.
 */ function createDeleteOperation(model, index, multi) {
    const document = {
        delete: index,
        multi: multi,
        filter: model.filter
    };
    if (model.hint) {
        document.hint = model.hint;
    }
    if (model.collation) {
        document.collation = model.collation;
    }
    return document;
}
/**
 * Build the update one operation.
 * @param model - The update one model.
 * @param index - The namespace index.
 * @returns the operation.
 */ const buildUpdateOneOperation = (model, index, options)=>{
    return createUpdateOperation(model, index, false, options);
};
exports.buildUpdateOneOperation = buildUpdateOneOperation;
/**
 * Build the update many operation.
 * @param model - The update many model.
 * @param index - The namespace index.
 * @returns the operation.
 */ const buildUpdateManyOperation = (model, index, options)=>{
    return createUpdateOperation(model, index, true, options);
};
exports.buildUpdateManyOperation = buildUpdateManyOperation;
/**
 * Validate the update document.
 * @param update - The update document.
 */ function validateUpdate(update, options) {
    if (!(0, utils_1.hasAtomicOperators)(update, options)) {
        throw new error_1.MongoAPIError('Client bulk write update models must only contain atomic modifiers (start with $) and must not be empty.');
    }
}
/**
 * Creates a delete operation based on the parameters.
 */ function createUpdateOperation(model, index, multi, options) {
    // Update documents provided in UpdateOne and UpdateMany write models are
    // required only to contain atomic modifiers (i.e. keys that start with "$").
    // Drivers MUST throw an error if an update document is empty or if the
    // document's first key does not start with "$".
    validateUpdate(model.update, options);
    const document = {
        update: index,
        multi: multi,
        filter: model.filter,
        updateMods: model.update
    };
    if (model.hint) {
        document.hint = model.hint;
    }
    if (model.upsert) {
        document.upsert = model.upsert;
    }
    if (model.arrayFilters) {
        document.arrayFilters = model.arrayFilters;
    }
    if (model.collation) {
        document.collation = model.collation;
    }
    if (!multi && 'sort' in model && model.sort != null) {
        document.sort = (0, sort_1.formatSort)(model.sort);
    }
    return document;
}
/**
 * Build the replace one operation.
 * @param model - The replace one model.
 * @param index - The namespace index.
 * @returns the operation.
 */ const buildReplaceOneOperation = (model, index)=>{
    if ((0, utils_1.hasAtomicOperators)(model.replacement)) {
        throw new error_1.MongoAPIError('Client bulk write replace models must not contain atomic modifiers (start with $) and must not be empty.');
    }
    const document = {
        update: index,
        multi: false,
        filter: model.filter,
        updateMods: model.replacement
    };
    if (model.hint) {
        document.hint = model.hint;
    }
    if (model.upsert) {
        document.upsert = model.upsert;
    }
    if (model.collation) {
        document.collation = model.collation;
    }
    if (model.sort != null) {
        document.sort = (0, sort_1.formatSort)(model.sort);
    }
    return document;
};
exports.buildReplaceOneOperation = buildReplaceOneOperation;
/** @internal */ function buildOperation(model, index, pkFactory, options) {
    switch(model.name){
        case 'insertOne':
            return (0, exports.buildInsertOneOperation)(model, index, pkFactory);
        case 'deleteOne':
            return (0, exports.buildDeleteOneOperation)(model, index);
        case 'deleteMany':
            return (0, exports.buildDeleteManyOperation)(model, index);
        case 'updateOne':
            return (0, exports.buildUpdateOneOperation)(model, index, options);
        case 'updateMany':
            return (0, exports.buildUpdateManyOperation)(model, index, options);
        case 'replaceOne':
            return (0, exports.buildReplaceOneOperation)(model, index);
    }
} //# sourceMappingURL=command_builder.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/client_bulk_write/results_merger.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ClientBulkWriteResultsMerger = void 0;
const __1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/index.js [app-client] (ecmascript)");
const error_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/error.js [app-client] (ecmascript)");
/**
 * Unacknowledged bulk writes are always the same.
 */ const UNACKNOWLEDGED = {
    acknowledged: false,
    insertedCount: 0,
    upsertedCount: 0,
    matchedCount: 0,
    modifiedCount: 0,
    deletedCount: 0,
    insertResults: undefined,
    updateResults: undefined,
    deleteResults: undefined
};
/**
 * Merges client bulk write cursor responses together into a single result.
 * @internal
 */ class ClientBulkWriteResultsMerger {
    /**
     * @returns The standard unacknowledged bulk write result.
     */ static unacknowledged() {
        return UNACKNOWLEDGED;
    }
    /**
     * Instantiate the merger.
     * @param options - The options.
     */ constructor(options){
        this.options = options;
        this.currentBatchOffset = 0;
        this.writeConcernErrors = [];
        this.writeErrors = new Map();
        this.result = {
            acknowledged: true,
            insertedCount: 0,
            upsertedCount: 0,
            matchedCount: 0,
            modifiedCount: 0,
            deletedCount: 0,
            insertResults: undefined,
            updateResults: undefined,
            deleteResults: undefined
        };
        if (options.verboseResults) {
            this.result.insertResults = new Map();
            this.result.updateResults = new Map();
            this.result.deleteResults = new Map();
        }
    }
    /**
     * Get the bulk write result object.
     */ get bulkWriteResult() {
        return {
            acknowledged: this.result.acknowledged,
            insertedCount: this.result.insertedCount,
            upsertedCount: this.result.upsertedCount,
            matchedCount: this.result.matchedCount,
            modifiedCount: this.result.modifiedCount,
            deletedCount: this.result.deletedCount,
            insertResults: this.result.insertResults,
            updateResults: this.result.updateResults,
            deleteResults: this.result.deleteResults
        };
    }
    /**
     * Merge the results in the cursor to the existing result.
     * @param currentBatchOffset - The offset index to the original models.
     * @param response - The cursor response.
     * @param documents - The documents in the cursor.
     * @returns The current result.
     */ async merge(cursor) {
        let writeConcernErrorResult;
        try {
            for await (const document of cursor){
                // Only add to maps if ok: 1
                if (document.ok === 1) {
                    if (this.options.verboseResults) {
                        this.processDocument(cursor, document);
                    }
                } else {
                    // If an individual write error is encountered during an ordered bulk write, drivers MUST
                    // record the error in writeErrors and immediately throw the exception. Otherwise, drivers
                    // MUST continue to iterate the results cursor and execute any further bulkWrite batches.
                    if (this.options.ordered) {
                        const error = new error_1.MongoClientBulkWriteError({
                            message: 'Mongo client ordered bulk write encountered a write error.'
                        });
                        error.writeErrors.set(document.idx + this.currentBatchOffset, {
                            code: document.code,
                            message: document.errmsg
                        });
                        error.partialResult = this.result;
                        throw error;
                    } else {
                        this.writeErrors.set(document.idx + this.currentBatchOffset, {
                            code: document.code,
                            message: document.errmsg
                        });
                    }
                }
            }
        } catch (error) {
            if (error instanceof __1.MongoWriteConcernError) {
                const result = error.result;
                writeConcernErrorResult = {
                    insertedCount: result.nInserted,
                    upsertedCount: result.nUpserted,
                    matchedCount: result.nMatched,
                    modifiedCount: result.nModified,
                    deletedCount: result.nDeleted,
                    writeConcernError: result.writeConcernError
                };
                if (this.options.verboseResults && result.cursor.firstBatch) {
                    for (const document of result.cursor.firstBatch){
                        if (document.ok === 1) {
                            this.processDocument(cursor, document);
                        }
                    }
                }
            } else {
                throw error;
            }
        } finally{
            // Update the counts from the cursor response.
            if (cursor.response) {
                const response = cursor.response;
                this.incrementCounts(response);
            }
            // Increment the batch offset.
            this.currentBatchOffset += cursor.operations.length;
        }
        // If we have write concern errors ensure they are added.
        if (writeConcernErrorResult) {
            const writeConcernError = writeConcernErrorResult.writeConcernError;
            this.incrementCounts(writeConcernErrorResult);
            this.writeConcernErrors.push({
                code: writeConcernError.code,
                message: writeConcernError.errmsg
            });
        }
        return this.result;
    }
    /**
     * Process an individual document in the results.
     * @param cursor - The cursor.
     * @param document - The document to process.
     */ processDocument(cursor, document) {
        // Get the corresponding operation from the command.
        const operation = cursor.operations[document.idx];
        // Handle insert results.
        if ('insert' in operation) {
            this.result.insertResults?.set(document.idx + this.currentBatchOffset, {
                insertedId: operation.document._id
            });
        }
        // Handle update results.
        if ('update' in operation) {
            const result = {
                matchedCount: document.n,
                modifiedCount: document.nModified ?? 0,
                // Check if the bulk did actually upsert.
                didUpsert: document.upserted != null
            };
            if (document.upserted) {
                result.upsertedId = document.upserted._id;
            }
            this.result.updateResults?.set(document.idx + this.currentBatchOffset, result);
        }
        // Handle delete results.
        if ('delete' in operation) {
            this.result.deleteResults?.set(document.idx + this.currentBatchOffset, {
                deletedCount: document.n
            });
        }
    }
    /**
     * Increment the result counts.
     * @param document - The document with the results.
     */ incrementCounts(document) {
        this.result.insertedCount += document.insertedCount;
        this.result.upsertedCount += document.upsertedCount;
        this.result.matchedCount += document.matchedCount;
        this.result.modifiedCount += document.modifiedCount;
        this.result.deletedCount += document.deletedCount;
    }
}
exports.ClientBulkWriteResultsMerger = ClientBulkWriteResultsMerger; //# sourceMappingURL=results_merger.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/client_bulk_write/executor.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ClientBulkWriteExecutor = void 0;
const abstract_cursor_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cursor/abstract_cursor.js [app-client] (ecmascript)");
const client_bulk_write_cursor_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cursor/client_bulk_write_cursor.js [app-client] (ecmascript)");
const error_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/error.js [app-client] (ecmascript)");
const timeout_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/timeout.js [app-client] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/utils.js [app-client] (ecmascript)");
const write_concern_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/write_concern.js [app-client] (ecmascript)");
const execute_operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/execute_operation.js [app-client] (ecmascript)");
const client_bulk_write_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/client_bulk_write/client_bulk_write.js [app-client] (ecmascript)");
const command_builder_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/client_bulk_write/command_builder.js [app-client] (ecmascript)");
const results_merger_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/client_bulk_write/results_merger.js [app-client] (ecmascript)");
/**
 * Responsible for executing a client bulk write.
 * @internal
 */ class ClientBulkWriteExecutor {
    /**
     * Instantiate the executor.
     * @param client - The mongo client.
     * @param operations - The user supplied bulk write models.
     * @param options - The bulk write options.
     */ constructor(client, operations, options){
        if (operations.length === 0) {
            throw new error_1.MongoClientBulkWriteExecutionError('No client bulk write models were provided.');
        }
        this.client = client;
        this.operations = operations;
        this.options = {
            ordered: true,
            bypassDocumentValidation: false,
            verboseResults: false,
            ...options
        };
        // If no write concern was provided, we inherit one from the client.
        if (!this.options.writeConcern) {
            this.options.writeConcern = write_concern_1.WriteConcern.fromOptions(this.client.s.options);
        }
        if (this.options.writeConcern?.w === 0) {
            if (this.options.verboseResults) {
                throw new error_1.MongoInvalidArgumentError('Cannot request unacknowledged write concern and verbose results');
            }
            if (this.options.ordered) {
                throw new error_1.MongoInvalidArgumentError('Cannot request unacknowledged write concern and ordered writes');
            }
        }
    }
    /**
     * Execute the client bulk write. Will split commands into batches and exhaust the cursors
     * for each, then merge the results into one.
     * @returns The result.
     */ async execute() {
        // The command builder will take the user provided models and potential split the batch
        // into multiple commands due to size.
        const pkFactory = this.client.s.options.pkFactory;
        const commandBuilder = new command_builder_1.ClientBulkWriteCommandBuilder(this.operations, this.options, pkFactory);
        // Unacknowledged writes need to execute all batches and return { ok: 1}
        const resolvedOptions = (0, utils_1.resolveTimeoutOptions)(this.client, this.options);
        const context = timeout_1.TimeoutContext.create(resolvedOptions);
        if (this.options.writeConcern?.w === 0) {
            while(commandBuilder.hasNextBatch()){
                const operation = new client_bulk_write_1.ClientBulkWriteOperation(commandBuilder, this.options);
                await (0, execute_operation_1.executeOperation)(this.client, operation, context);
            }
            return results_merger_1.ClientBulkWriteResultsMerger.unacknowledged();
        } else {
            const resultsMerger = new results_merger_1.ClientBulkWriteResultsMerger(this.options);
            // For each command will will create and exhaust a cursor for the results.
            while(commandBuilder.hasNextBatch()){
                const cursorContext = new abstract_cursor_1.CursorTimeoutContext(context, Symbol());
                const options = {
                    ...this.options,
                    timeoutContext: cursorContext,
                    ...resolvedOptions.timeoutMS != null && {
                        timeoutMode: abstract_cursor_1.CursorTimeoutMode.LIFETIME
                    }
                };
                const cursor = new client_bulk_write_cursor_1.ClientBulkWriteCursor(this.client, commandBuilder, options);
                try {
                    await resultsMerger.merge(cursor);
                } catch (error) {
                    // Write concern errors are recorded in the writeConcernErrors field on MongoClientBulkWriteError.
                    // When a write concern error is encountered, it should not terminate execution of the bulk write
                    // for either ordered or unordered bulk writes. However, drivers MUST throw an exception at the end
                    // of execution if any write concern errors were observed.
                    if (error instanceof error_1.MongoServerError && !(error instanceof error_1.MongoClientBulkWriteError)) {
                        // Server side errors need to be wrapped inside a MongoClientBulkWriteError, where the root
                        // cause is the error property and a partial result is to be included.
                        const bulkWriteError = new error_1.MongoClientBulkWriteError({
                            message: 'Mongo client bulk write encountered an error during execution'
                        });
                        bulkWriteError.cause = error;
                        bulkWriteError.partialResult = resultsMerger.bulkWriteResult;
                        throw bulkWriteError;
                    } else {
                        // Client side errors are just thrown.
                        throw error;
                    }
                }
            }
            // If we have write concern errors or unordered write errors at the end we throw.
            if (resultsMerger.writeConcernErrors.length > 0 || resultsMerger.writeErrors.size > 0) {
                const error = new error_1.MongoClientBulkWriteError({
                    message: 'Mongo client bulk write encountered errors during execution.'
                });
                error.writeConcernErrors = resultsMerger.writeConcernErrors;
                error.writeErrors = resultsMerger.writeErrors;
                error.partialResult = resultsMerger.bulkWriteResult;
                throw error;
            }
            return resultsMerger.bulkWriteResult;
        }
    }
}
exports.ClientBulkWriteExecutor = ClientBulkWriteExecutor; //# sourceMappingURL=executor.js.map
}),
"[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/end_sessions.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EndSessionsOperation = void 0;
const responses_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/cmap/wire_protocol/responses.js [app-client] (ecmascript)");
const command_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/command.js [app-client] (ecmascript)");
const read_preference_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/read_preference.js [app-client] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/utils.js [app-client] (ecmascript)");
const operation_1 = __turbopack_context__.r("[project]/Pathology/patho-client/node_modules/.pnpm/mongodb@7.0.0/node_modules/mongodb/lib/operations/operation.js [app-client] (ecmascript)");
class EndSessionsOperation extends command_1.CommandOperation {
    constructor(sessions){
        super();
        this.writeConcern = {
            w: 0
        };
        this.ns = utils_1.MongoDBNamespace.fromString('admin.$cmd');
        this.SERVER_COMMAND_RESPONSE_TYPE = responses_1.MongoDBResponse;
        this.sessions = sessions;
    }
    buildCommandDocument(_connection, _session) {
        return {
            endSessions: this.sessions
        };
    }
    buildOptions(timeoutContext) {
        return {
            timeoutContext,
            readPreference: read_preference_1.ReadPreference.primaryPreferred
        };
    }
    get commandName() {
        return 'endSessions';
    }
}
exports.EndSessionsOperation = EndSessionsOperation;
(0, operation_1.defineAspects)(EndSessionsOperation, operation_1.Aspect.WRITE_OPERATION); //# sourceMappingURL=end_sessions.js.map
}),
]);

//# sourceMappingURL=83fca_mongodb_lib_operations_9ed2b259._.js.map