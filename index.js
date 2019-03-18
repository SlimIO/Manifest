// Require Node Dependencies
const { readFileSync, writeFileSync, existsSync } = require("fs");
const { join } = require("path");

// Require Third-party Dependencies
const TOML = require("@iarna/toml");
const is = require("@slimio/is");

// Require Internal Dependencies
const { assertFilePath, assertVersion } = require("./src/assert");

/**
 * @typedef {Object} Payload
 * @property {String} name Name config
 * @property {String} version Version config
 * @property {String} type Type project config
 * @property {Object} dependencies Addon dependencies config
 */

// Symbols
const symName = Symbol("name");
const symVer = Symbol("version");
const symType = Symbol("type");
const symDep = Symbol("dependencies");

/**
 * @class Manifest
 * @property {String} name Name config
 * @property {String} version Version config
 * @property {String} type Type project config
 * @property {Object} dependencies Addon dependencies config
 */
class Manifest {
    /**
     * @constructor
     * @memberof Manifest#
     * @param {!Payload} payload Payload config
     *
     * @throws {TypeError}
     * @example
     * const manifest = new Manifest({
     *     name: "my-project",
     *     version: "1.0.0",
     *     type: "NAPI"
     * });
     */
    constructor(payload) {
        if (!is.plainObject(payload)) {
            throw new TypeError("payload param must be a typeof <object>");
        }
        const { name, version, type, dependencies = Object.create(null) } = payload;

        if (!is.string(payload.name)) {
            throw new TypeError("payload.name must be a typeof <string>");
        }
        const validSemver = assertVersion("payload.version", version);
        if (!Manifest.TYPES.has(type)) {
            throw new TypeError(`payload.type must be one <string> of the Set : ${[...Manifest.TYPES]}`);
        }
        if (!is.plainObject(dependencies)) {
            throw new TypeError("payload.dependencies must be a typeof <object>");
        }

        Reflect.defineProperty(this, symName, { value: name });
        Reflect.defineProperty(this, symVer, { value: validSemver });
        Reflect.defineProperty(this, symType, { value: type });
        Reflect.defineProperty(this, symDep, { value: Object.create(null) });
        for (const [name, version] of Object.entries(dependencies)) {
            this.addDependency(name, version);
        }
    }

    /**
     * @method addDependency
     * @memberof Manifest#
     * @param {!String} name dependency name
     * @param {!String} version dependency version
     * @returns {void}
     *
     * @throws {Error}
     */
    addDependency(name, version) {
        if (this.type !== "Addon") {
            throw new Error("Dependencies are only allowed on 'Addon' porjects");
        }

        assertVersion(`payload.dependencies.${name}`, version);
        Reflect.set(this[symDep], name, version);
    }

    /**
     * @version 0.1.0
     * @member {String} name
     * @memberof Manifest#
     */
    get name() {
        return this[symName];
    }

    /**
     * @version 0.1.0
     * @member {String} version
     * @memberof Manifest#
     */
    get version() {
        return this[symVer];
    }

    /**
     * @version 0.1.0
     * @member {String} type
     * @memberof Manifest#
     */
    get type() {
        return this[symType];
    }

    /**
     * @version 0.1.0
     * @member {Object} dependencies
     * @memberof Manifest#
     */
    get dependencies() {
        return this[symDep];
    }

    /**
     * @version 0.1.0
     *
     * @static
     * @method create
     * @desc Create a new manifest file on the disk, return a Manifest Object.
     * @memberof Manifest#
     * @param {!Payload} config Config manifest
     * @param {String} [filePath] filePath
     * @returns {Manifest}
     *
     * @throws {Error}
     * @example
     * const manifest = Manifest.create({
     *     name: "my-project",
     *     version: "1.0.0",
     *     type: "NAPI"
     * });
     * console.log(manifest.dependencies);
     * console.log(manifest.toJSON());
     */
    static create(config, filePath = Manifest.DEFAULT_FILE) {
        assertFilePath(filePath);
        if (existsSync(filePath)) {
            throw new Error(`Can't create new manifest at ${filePath}!`);
        }

        const manifest = new Manifest(config);
        writeFileSync(filePath, TOML.stringify(manifest.toJSON()));

        return manifest;
    }

    /**
     * @version 0.1.0
     *
     * @static
     * @method open
     * @desc Open and read an existing manifest file (.toml). Return a Manifest Object.
     * @memberof Manifest#
     * @param {String} [filePath] File path
     * @returns {Manifest}
     *
     * @example
     * const manifest = Manifest.open(); // Will open the local manifest
     * console.log(manifest.name);
     * console.log(manifest.version);
     */
    static open(filePath = Manifest.DEFAULT_FILE) {
        assertFilePath(filePath);
        const buf = readFileSync(filePath);
        const payload = TOML.parse(buf.toString());

        return new Manifest(payload);
    }

    /**
     * @version 0.1.0
     *
     * @static
     * @method writeOnDisk
     * @desc Write the manifest file (.toml) on the disk (the file must exist).
     * @memberof Manifest#
     * @param {!Manifest} manifest manifest
     * @param {String} [filePath] filePath
     * @returns {void}
     *
     * @throws {TypeError}
     * @throws {Error}
     *
     * @example
     * const manifest = Manifest.open();
     * Manifest.writeOnDisk(manifest);
     */
    static writeOnDisk(manifest, filePath = Manifest.DEFAULT_FILE) {
        if (!(manifest instanceof Manifest)) {
            throw new TypeError("manifest param must be instanceof Manifest Object");
        }
        assertFilePath(filePath);

        if (!existsSync(filePath)) {
            throw new Error(`Unable to write ${filePath} on disk!`);
        }
        writeFileSync(filePath, TOML.stringify(manifest.toJSON()));
    }

    /**
     * @version 0.1.0
     *
     * @public
     * @method toJSON
     * @memberof Manifest#
     * @desc Transform Manifest Object to a valid JSON payload.
     * @returns {Payload}
     */
    toJSON() {
        return {
            name: this.name,
            version: this.version,
            type: this.type,
            dependencies: this.dependencies
        };
    }
}

Manifest.DEFAULT_FILE = join(process.cwd(), "slimio.toml");

/** @type {Readonly<Set<String>>} */
Manifest.TYPES = Object.freeze(new Set(["Addon", "NAPI", "CLI"]));

Object.preventExtensions(Manifest);

module.exports = Manifest;
