module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/mongodb [external] (mongodb, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("mongodb", () => require("mongodb"));

module.exports = mod;
}),
"[project]/Pathology/patho-client/lib/db/mongodb.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongodb [external] (mongodb, cjs)");
;
if (!process.env.MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}
const uri = process.env.MONGODB_URI;
// Configure MongoDB connection options
const options = {
    // MongoDB Atlas requires TLS/SSL
    // The driver automatically handles TLS for mongodb+srv:// connections
    // Connection pool settings
    maxPoolSize: 10,
    minPoolSize: 1,
    // Timeout settings
    connectTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    // Retry settings
    retryWrites: true,
    retryReads: true
};
let client;
let clientPromise;
if ("TURBOPACK compile-time truthy", 1) {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = /*TURBOPACK member replacement*/ __turbopack_context__.g;
    if (!globalWithMongo._mongoClientPromise) {
        client = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$29$__["MongoClient"](uri, options);
        globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
} else //TURBOPACK unreachable
;
const __TURBOPACK__default__export__ = clientPromise;
}),
"[project]/Pathology/patho-client/lib/db/models/user.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createUser",
    ()=>createUser,
    "findOrCreateUser",
    ()=>findOrCreateUser,
    "findUserByEmail",
    ()=>findUserByEmail,
    "findUserByGoogleId",
    ()=>findUserByGoogleId,
    "initializeUserIndexes",
    ()=>initializeUserIndexes,
    "updateUser",
    ()=>updateUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Pathology$2f$patho$2d$client$2f$lib$2f$db$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Pathology/patho-client/lib/db/mongodb.ts [app-route] (ecmascript)");
;
async function findUserByEmail(email) {
    const client = await __TURBOPACK__imported__module__$5b$project$5d2f$Pathology$2f$patho$2d$client$2f$lib$2f$db$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"];
    const db = client.db();
    const user = await db.collection("users").findOne({
        email
    });
    return user;
}
async function findUserByGoogleId(googleId) {
    const client = await __TURBOPACK__imported__module__$5b$project$5d2f$Pathology$2f$patho$2d$client$2f$lib$2f$db$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"];
    const db = client.db();
    const user = await db.collection("users").findOne({
        googleId
    });
    return user;
}
// Track if indexes have been initialized
let indexesInitialized = false;
/**
 * Ensure indexes are created (called automatically on first use)
 */ async function ensureIndexes() {
    if (indexesInitialized) return;
    try {
        const client = await __TURBOPACK__imported__module__$5b$project$5d2f$Pathology$2f$patho$2d$client$2f$lib$2f$db$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"];
        const db = client.db();
        const collection = db.collection("users");
        // Create indexes if they don't exist (idempotent)
        await collection.createIndex({
            email: 1
        }, {
            unique: true
        });
        await collection.createIndex({
            googleId: 1
        }, {
            unique: true,
            sparse: true
        });
        await collection.createIndex({
            createdAt: 1
        });
        indexesInitialized = true;
    } catch (error) {
        // If indexes already exist, that's fine
        const mongoError = error;
        if (mongoError.code !== 85) {
            // Error code 85 = IndexOptionsConflict (index already exists)
            console.warn("Index creation warning:", error);
        }
        indexesInitialized = true; // Mark as initialized to avoid retrying
    }
}
async function createUser(input) {
    // Ensure indexes exist before creating user
    await ensureIndexes();
    const client = await __TURBOPACK__imported__module__$5b$project$5d2f$Pathology$2f$patho$2d$client$2f$lib$2f$db$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"];
    const db = client.db();
    const now = new Date();
    const newUser = {
        name: input.name,
        email: input.email,
        image: input.image,
        emailVerified: input.emailVerified ?? false,
        googleId: input.googleId,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now
    };
    const result = await db.collection("users").insertOne(newUser);
    const user = await db.collection("users").findOne({
        _id: result.insertedId
    });
    if (!user) {
        throw new Error("Failed to create user");
    }
    return user;
}
async function updateUser(userId, updates) {
    const client = await __TURBOPACK__imported__module__$5b$project$5d2f$Pathology$2f$patho$2d$client$2f$lib$2f$db$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"];
    const db = client.db();
    const updateResult = await db.collection("users").findOneAndUpdate({
        _id: userId
    }, {
        $set: {
            ...updates,
            updatedAt: new Date(),
            lastLoginAt: new Date()
        }
    }, {
        returnDocument: "after"
    });
    if (!updateResult) {
        throw new Error("Failed to update user");
    }
    return updateResult;
}
async function findOrCreateUser(input) {
    // Try to find by Google ID first
    if (input.googleId) {
        console.log("------------->", {
            input
        });
        const existingUser = await findUserByGoogleId(input.googleId);
        if (existingUser) {
            // Update user info and last login
            return updateUser(existingUser._id, {
                name: input.name,
                email: input.email,
                image: input.image,
                emailVerified: input.emailVerified
            });
        }
    }
    // Try to find by email
    const existingUser = await findUserByEmail(input.email);
    if (existingUser) {
        // Update user info and last login
        return updateUser(existingUser._id, {
            name: input.name,
            email: input.email,
            image: input.image,
            emailVerified: input.emailVerified,
            googleId: input.googleId
        });
    }
    console.log("--------------------->");
    // Create new user
    return createUser(input);
}
async function initializeUserIndexes() {
    await ensureIndexes();
}
}),
"[project]/Pathology/patho-client/app/api/auth/[...nextauth]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>handler,
    "POST",
    ()=>handler,
    "authOptions",
    ()=>authOptions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Pathology$2f$patho$2d$client$2f$node_modules$2f2e$pnpm$2f$next$2d$auth$40$4$2e$24$2e$13_next$40$16$2e$0$2e$6_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_$5f$ze4zxd424arhyamuxg6s6e3pf4$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Pathology/patho-client/node_modules/.pnpm/next-auth@4.24.13_next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0__ze4zxd424arhyamuxg6s6e3pf4/node_modules/next-auth/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Pathology$2f$patho$2d$client$2f$node_modules$2f2e$pnpm$2f$next$2d$auth$40$4$2e$24$2e$13_next$40$16$2e$0$2e$6_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_$5f$ze4zxd424arhyamuxg6s6e3pf4$2f$node_modules$2f$next$2d$auth$2f$providers$2f$google$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Pathology/patho-client/node_modules/.pnpm/next-auth@4.24.13_next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0__ze4zxd424arhyamuxg6s6e3pf4/node_modules/next-auth/providers/google.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Pathology$2f$patho$2d$client$2f$lib$2f$db$2f$models$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Pathology/patho-client/lib/db/models/user.ts [app-route] (ecmascript)");
;
;
;
const authOptions = {
    // Using JWT sessions (no database adapter needed for NextAuth v4)
    session: {
        strategy: "jwt"
    },
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Pathology$2f$patho$2d$client$2f$node_modules$2f2e$pnpm$2f$next$2d$auth$40$4$2e$24$2e$13_next$40$16$2e$0$2e$6_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_$5f$ze4zxd424arhyamuxg6s6e3pf4$2f$node_modules$2f$next$2d$auth$2f$providers$2f$google$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET
        })
    ],
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/"
    },
    callbacks: {
        async signIn ({ user, account, profile }) {
            // Save/update user in our custom users collection
            if (account?.provider === "google" && user.email && user.name) {
                try {
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Pathology$2f$patho$2d$client$2f$lib$2f$db$2f$models$2f$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findOrCreateUser"])({
                        name: user.name,
                        email: user.email,
                        image: user.image || undefined,
                        emailVerified: profile?.email_verified || false,
                        googleId: account.providerAccountId
                    });
                } catch (error) {
                    console.error("Error saving user to database:", error);
                // Don't block sign in if user save fails
                }
            }
            return true;
        },
        async redirect ({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            // Allows callback URLs on the same origin
            if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        }
    }
};
const handler = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Pathology$2f$patho$2d$client$2f$node_modules$2f2e$pnpm$2f$next$2d$auth$40$4$2e$24$2e$13_next$40$16$2e$0$2e$6_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_$5f$ze4zxd424arhyamuxg6s6e3pf4$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(authOptions);
;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e1a95f78._.js.map