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

const Types = new Set(["Addon", "NAPI", "CLI"]);

/**
 * @param {String} filePath filePath
 *
 * @returns {coid}
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
 * @property {String} filePath File path
 */
class Manifest {
    /**
     * @constructor
     * @param {Object} obj obj
     *
     * @throws {TypeError|Error}
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
     * @member {String} name
     * @memberof Manifest#
     */
    get name() {
        return this[symName];
    }

    /**
     * @member {String} version
     * @memberof Manifest#
     */
    get version() {
        return this[symVer];
    }

    /**
     * @member {String} type
     * @memberof Manifest#
     */
    get type() {
        return this[symType];
    }

    /**
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
     * @method wcreaterite
     * @memberof Manifest#
     * @param {Object} config config
     *
     * @returns {Promise}
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
     * @param {String} filePath filePath
     *
     * @returns {Object}
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
     * @param {Manifest} manifest manifest
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
     * @returns {Object}
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
