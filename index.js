// Require Node Dependencies
const {
    accessSync,
    readFileSync,
    writeFileSync
} = require("fs");
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
    const ext = extname(filePath);
    if (ext !== ".toml") {
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
     * @param {Payload} obj Object config
     *
     * @throws {TypeError}
     */
    constructor(obj) {
        if (!is.plainObject(obj)) {
            throw new TypeError("obj param must be a typeof <object>");
        }

        if (!is.string(obj.name)) {
            throw new TypeError("obj.name must be a typeof <string>");
        }

        const validSemVer = assertversion("obj.version", obj.version);

        if (!Types.has(obj.type)) {
            throw new TypeError(`obj.type must be one <string> of the Set : ${[...Types]}`);
        }

        if (!is.undefined(obj.dependencies)) {
            if (!is.plainObject(obj.dependencies)) {
                throw new TypeError("obj.dependencies must be a typeof <object>");
            }

            for (const [key, value] of Object.entries(obj.dependencies)) {
                assertversion(`obj.dependencies.${key}`, value);
            }
        }

        Reflect.defineProperty(this, symName, { value: obj.name });
        Reflect.defineProperty(this, symVer, { value: validSemVer });
        Reflect.defineProperty(this, symType, { value: obj.type });
        Reflect.defineProperty(this, symDep, { value: obj.dependencies });
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
     * @memberof Manifest#
     * @param {Payload} config Config manifest
     * @param {String=} [config.name = "project"] Name config
     * @param {String=} [config.version = "1.0.0"] Version config
     * @param {String=} [config.type = "Addon"] Type project config
     * @param {Object=} [config.dependencies = {}] Addon dependencies config
     *
     * @returns {Manifest}
     */
    static create(config = Object.create(null)) {
        const name = config.name ? config.name : "project";
        const version = config.version ? config.version : "1.0.0";
        const type = config.type ? config.type : "Addon";
        const dependencies = config.dependencies ? config.dependencies : {};

        return new Manifest({
            name,
            version,
            type,
            dependencies
        });
    }

    /**
     * @version 0.1.0
     *
     * @static
     * @method read
     * @memberof Manifest#
     * @param {String} filePath File path
     *
     * @returns {Manifest}
     */
    static read(filePath) {
        assertFilePath(filePath);
        const toml = readFileSync(filePath, { encoding: "utf-8" });
        const obj = TOML.parse(toml);

        return new Manifest(obj);
    }

    /**
     * @version 0.1.0
     *
     * @static
     * @method writeOnDisk
     * @memberof Manifest#
     * @param {!Manifest} manifest manifest
     * @param {String} filePath filePath
     *
     * @returns {void}
     */
    static writeOnDisk(manifest, filePath = join(process.cwd(), "slimio.toml")) {
        assertFilePath(filePath);
        try {
            accessSync(filePath);
        }
        catch (err) {
            if (err.code === "ENOENT") {
                writeFileSync(filePath, TOML.stringify(manifest.toJSON()));
            }
        }
    }

    /**
     * @version 0.1.0
     *
     * @public
     * @method toJSON
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

module.exports = Manifest;
