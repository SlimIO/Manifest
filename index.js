// Require Node Dependencies
const { readFileSync, writeFileSync, existsSync } = require("fs");
const { isAbsolute, join, extname } = require("path");

// Require Third-party Dependencies
const TOML = require("@iarna/toml");
const is = require("@slimio/is");
const semver = require("semver");

/**
 * @typedef {Object} Payload
 * @property {String} name Name config
 * @property {String} version Version config
 * @property {String} type Type project config
 * @property {Object} dependencies Addon dependencies config
 */

/**
 * @const Types
 * @type {Set<String>}
 */
const Types = new Set(["Addon", "NAPI", "CLI"]);

/**
 * @version 0.1.0
 * @function assertFilePath
 * @desc File path checker
 * @param {String} filePath File path
 *
 * @throws {TypeError|Error}
 * @returns {void}
 */
function assertFilePath(filePath) {
    if (!is.string(filePath)) {
        throw new TypeError("filePath param must be a typeof <string>");
    }
    if (!isAbsolute(filePath)) {
        throw new Error("filePath param must ba an absolute path");
    }
    if (extname(filePath) !== ".toml") {
        throw new Error("extension file must be a .toml");
    }
}

/**
 * @version 0.1.0
 * @function assertversion
 * @desc Sementic versionning checker
 * @param {String} paramName Param name checking
 * @param {String} value Sementic versionning value
 *
 * @throws {Error}
 * @return {String}
 */
function assertversion(paramName, value) {
    const validSemver = semver.valid(value);
    if (is.nullOrUndefined(validSemver)) {
        throw new Error(`${paramName} must be a valid semver`);
    }

    return validSemver;
}

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
     * @param {Payload} payload Payload config
     *
     * @throws {TypeError}
     */
    constructor(payload) {
        if (!is.plainObject(payload)) {
            throw new TypeError("payload param must be a typeof <object>");
        }
        const { name, version, type, dependencies = Object.create(null) } = payload;

        if (!is.string(payload.name)) {
            throw new TypeError("payload.name must be a typeof <string>");
        }
        const validSemVer = assertversion("payload.version", version);
        if (!Types.has(type)) {
            throw new TypeError(`payload.type must be one <string> of the Set : ${[...Types]}`);
        }
        if (!is.plainObject(dependencies)) {
            throw new TypeError("payload.dependencies must be a typeof <object>");
        }
        for (const [key, value] of Object.entries(dependencies)) {
            assertversion(`payload.dependencies.${key}`, value);
        }

        Reflect.defineProperty(this, symName, { value: name });
        Reflect.defineProperty(this, symVer, { value: validSemVer });
        Reflect.defineProperty(this, symType, { value: type });
        Reflect.defineProperty(this, symDep, { value: dependencies });
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
     * @member {String} name
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
     * @desc Create Manifest object with an object.
     * @memberof Manifest#
     * @param {Payload} config Config manifest
     * @param {String=} [config.name = "project"] Name config
     * @param {String=} [config.version = "1.0.0"] Version config
     * @param {String=} [config.type = "Addon"] Type project config
     * @param {Object=} [config.dependencies = {}] Addon dependencies config
     * @param {String} [filePath] filePath
     * @returns {Manifest}
     *
     * @throws {TypeError}
     */
    static create(config = Object.create(null), filePath = Manifest.DEFAULT_FILE) {
        if (!is.plainObject(config)) {
            throw new TypeError("config param must be a plainObject");
        }
        assertFilePath(filePath);
        if (existsSync(filePath)) {
            throw new Error(`Can't create new manifest at ${filePath}, one already exist!`);
        }

        const name = config.name ? config.name : "project";
        const version = config.version ? config.version : "1.0.0";
        const type = config.type ? config.type : "Addon";
        const dependencies = config.dependencies ? config.dependencies : {};

        const manifest = new Manifest({ name, version, type, dependencies });
        Manifest.writeOnDisk(manifest, filePath);

        return manifest;
    }

    /**
     * @version 0.1.0
     *
     * @static
     * @method open
     * @desc Read toml file and return a specific Manifest object.
     * @memberof Manifest#
     * @param {String} [filePath] File path
     *
     * @returns {Manifest}
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
     * @desc Write toml file if not exist.
     * @memberof Manifest#
     * @param {!Manifest} manifest manifest
     * @param {String} filePath filePath
     *
     * @returns {void}
     */
    static writeOnDisk(manifest, filePath = Manifest.DEFAULT_FILE) {
        if (!(manifest instanceof Manifest)) {
            throw new TypeError("manifest param must be instanceof Manifest Object");
        }
        assertFilePath(filePath);

        if (!existsSync(filePath)) {
            throw new Error(`No file ${filePath} on the system`);
        }
        writeFileSync(filePath, TOML.stringify(manifest.toJSON()));
    }

    /**
     * @version 0.1.0
     *
     * @public
     * @method toJSON
     * @desc Return Manifest with private attributs as a JSON Object.
     * @memberof Manifest#
     *
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

module.exports = Manifest;
