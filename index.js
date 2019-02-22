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

const ProjectType = new Set(["Addon", "NAPI", "CLI"]);

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
const symProjType = Symbol("project_type");
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

        if (!ProjectType.has(obj.project_type)) {
            throw new TypeError(`obj.project_type must be one <string> of the Set : ${[...ProjectType]}`);
        }

        if (!is.undefined(obj.dependencies)) {
            if (!is.plainObject(obj.dependencies)) {
                throw new TypeError("obj.dependencies must be a typeof <object>");
            }

            for (const [key, value] of Object.entries(obj.dependencies)) {
                assertversion(`obj.dependencies.${key}`, value);
            }
        }

        this[symName] = obj.name;
        this[symVer] = validSemVer;
        this[symProjType] = obj.project_type;
        this[symDep] = obj.dependencies;
    }

    /**
     *
     */
    get name() {
        return this[symName];
    }

    /**
     *
     */
    get version() {
        return this[symVer];
    }

    /**
     *
     */
    get projectType() {
        return this[symProjType];
    }

    /**
     *
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
    static create(config = {}) {
        const name = config.name ? config.name : "project";
        const version = config.version ? config.version : "1.0.0";
        const projectType = config.project_type ? config.project_type : "Addon";
        const dependencies = config.dependencies ? config.dependencies : {};

        return new Manifest({
            name,
            version,
            project_type: projectType,
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
     * @param {String} filePath filePath
     * @param {Manifest} manifest manifest
     *
     * @returns {void}
     */
    static writeOnDisk(filePath = join(process.cwd(), "slimio.toml"), manifest) {
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
            project_type: this.projectType,
            dependencies: this.dependencies
        };
    }
}

module.exports = Manifest;
