"use strict";

// Require Node Dependencies
const { readFileSync, writeFileSync, existsSync } = require("fs");
const { join, extname } = require("path");

// Require Third-party Dependencies
const TOML = require("@iarna/toml");
const is = require("@slimio/is");
const argc = require("@slimio/arg-checker");
const cloneDeep = require("lodash.clonedeep");
const { freezedProperty } = require("@slimio/immutable");

// Require Internal Dependencies
const { assertFilePath, assertVersion } = require("./src/assert");

/**
 * @typedef {object} Doc
 * @property {string[]} include
 * @property {number} port
 */

/**
 * @typedef {object} psp
 * @property {boolean} npmrc
 * @property {boolean} jsdoc
 * @property {string[]} disabled_dependency
 * @property {string[]} exclude
 */

/**
 * @typedef {object} Payload
 * @property {string} name Name config
 * @property {string} version Version config
 * @property {string} type Type project config
 * @property {string} org Organization name
 * @property {string} platform platform
 * @property {object} dependencies Addon dependencies config
 * @property {object} notes other notes for put somes keys/values
 * @property {Doc} doc
 * @property {psp} psp
 * @property {string} config config path
 */

// Symbols
const symDep = Symbol("dependencies");
const symDoc = Symbol("doc");
const symPsp = Symbol("psp");
const symNotes = Symbol("notes");

class Manifest {
    /**
     * @class
     * @memberof Manifest
     * @param {!Payload} payload Payload config
     *
     * @throws {TypeError}
     * @throws {Error}
     *
     * @example
     * const manifest = new Manifest({
     *     name: "my-project",
     *     version: "1.0.0",
     *     type: "NAPI"
     * });
     */
    constructor(payload) {
        argc(payload, is.plainObject);

        const {
            name, version, type, org, dependencies, doc, psp, notes, platform = "Any", required_core, config
        } = Object.assign({}, Manifest.DEFAULT_OPTIONS, payload);
        argc(name, is.string);
        argc(doc, is.plainObject);
        argc(psp, is.plainObject);
        argc(platform, is.string);
        argc(org, [is.string, is.nullOrUndefined]);
        argc(required_core, [is.string, is.nullOrUndefined]);
        argc(config, [is.string, is.nullOrUndefined]);

        if (is.string(required_core) && type !== "Addon") {
            throw new Error("required_core is only available for 'Addon' projects!");
        }
        const { port = Manifest.DEFAULT_DOC_PORT, include = [] } = doc;
        // eslint-disable-next-line camelcase
        const { jsdoc = true, npmrc = true, disabled_dependency = [], exclude = [] } = psp;

        const validSemver = assertVersion("payload.version", version);
        if (!Manifest.TYPES.has(type)) {
            throw new TypeError(`payload.type must be one <string> of the Set : ${[...Manifest.TYPES]}`);
        }
        argc(dependencies, is.plainObject);
        argc(notes, is.plainObject);
        argc(include, is.array);
        argc(exclude, is.array);
        argc(disabled_dependency, is.array);
        argc(port, is.number);
        argc(npmrc, is.boolean);
        argc(jsdoc, is.boolean);

        // Note: doc.include must contain string with a '.js' extension
        const includeFinal = include.filter((file) => typeof file === "string" && extname(file) === ".js");

        // eslint-disable-next-line
        freezedProperty(this, "required_core", required_core || null);
        freezedProperty(this, "name", name);
        freezedProperty(this, "type", type);
        freezedProperty(this, "version", validSemver);
        freezedProperty(this, "platform", platform);
        freezedProperty(this, "org", org || null);
        freezedProperty(this, "config", config || null);

        Reflect.defineProperty(this, symDep, {
            value: Object.create(null)
        });
        Reflect.defineProperty(this, symNotes, {
            value: Object.create(null)
        });
        Reflect.defineProperty(this, symDoc, { value: { port, include: includeFinal } });
        Reflect.defineProperty(this, symPsp, { value: { jsdoc, npmrc, disabled_dependency, exclude } });
        for (const [name, version] of Object.entries(dependencies)) {
            this.addDependency(name, version);
        }
        for (const [key, value] of Object.entries(notes)) {
            Reflect.set(this[symNotes], key, value);
        }
    }

    /**
     * @function addDependency
     * @memberof Manifest
     * @param {!string} name dependency name
     * @param {!string} version dependency version
     * @returns {void}
     *
     * @throws {Error}
     */
    addDependency(name, version) {
        if (this.type !== "Addon") {
            throw new Error("Dependencies are only allowed on 'Addon' projects");
        }

        assertVersion(`payload.dependencies.${name}`, version);
        const isWrited = Reflect.set(this[symDep], name, version);
        if (!isWrited) {
            throw new Error(`Unable to write dependency '${name}' version '${version}'`);
        }
    }

    /**
     * @function hasDependency
     * @memberof Manifest
     * @param {!string} name dependency name
     * @returns {boolean}
     */
    hasDependency(name) {
        return Reflect.has(this[symDep], name);
    }

    /**
     * @version 0.1.0
     * @member {object} dependencies
     * @memberof Manifest
     * @returns {symbol<string>}
     */
    get dependencies() {
        return cloneDeep(this[symDep]);
    }

    /**
     * @version 0.1.0
     * @member {object} notes
     * @memberof Manifest
     * @returns {symbol<string>}
     */
    get notes() {
        return cloneDeep(this[symNotes]);
    }

    /**
     * @version 0.2.0
     * @member {Doc} doc
     * @memberof Manifest
     * @returns {symbol<string>}
     */
    get doc() {
        return cloneDeep(this[symDoc]);
    }

    /**
     * @version 0.3.0
     * @member {psp} psp
     * @memberof Manifest
     * @returns {symbol<string>}
     */
    get psp() {
        return cloneDeep(this[symPsp]);
    }

    /**
     * @version 0.1.0
     *
     * @static
     * @function create
     * @description Create a new manifest file on the disk, return a Manifest Object.
     * @memberof Manifest
     * @param {!Payload} config Config manifest
     * @param {string} [filePath] filePath
     * @param {boolean} [lightMode=false] activate light mode
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
    static create(config, filePath = Manifest.DEFAULT_FILE, lightMode = false) {
        assertFilePath(filePath);
        if (existsSync(filePath)) {
            throw new Error(`Can't create new manifest at ${filePath}!`);
        }

        const manifest = new Manifest(config);
        const json = lightMode ? { name: manifest.name, version: manifest.version, type: manifest.type } : manifest.toJSON();
        writeFileSync(filePath, TOML.stringify(json));

        return manifest;
    }

    /**
     * @version 0.1.0
     *
     * @static
     * @function open
     * @description Open and read an existing manifest file (.toml). Return a Manifest Object.
     * @memberof Manifest
     * @param {string} [filePath] File path
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
     * @function writeOnDisk
     * @description Write the manifest file (.toml) on the disk (the file must exist).
     * @memberof Manifest
     * @param {!Manifest} manifest manifest
     * @param {string} [filePath] filePath
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
     * @function toJSON
     * @memberof Manifest
     * @description Transform Manifest Object to a valid JSON payload.
     * @returns {Payload}
     */
    toJSON() {
        const ret = {
            name: this.name,
            version: this.version,
            type: this.type,
            org: this.org,
            required_core: this.required_core,
            dependencies: this.dependencies,
            notes: this.notes,
            platform: this.platform,
            doc: this.doc,
            psp: this.psp,
            config: this.config
        };

        return ret;
    }
}

Manifest.DEFAULT_FILE = join(process.cwd(), "slimio.toml");
Manifest.DEFAULT_DOC_PORT = 2000;
Manifest.DEFAULT_OPTIONS = {
    dependencies: Object.create(null),
    notes: Object.create(null),
    doc: { include: [], port: Manifest.DEFAULT_DOC_PORT },
    psp: Object.create(null)
};

/** @type {Readonly<Set<string>>} */
Manifest.TYPES = Object.freeze(new Set(["Addon", "NAPI", "CLI", "Package", "Service", "Degraded"]));

Object.preventExtensions(Manifest);

module.exports = Manifest;
