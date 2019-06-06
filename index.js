// Require Node Dependencies
const { readFileSync, writeFileSync, existsSync } = require("fs");
const { join, extname } = require("path");

// Require Third-party Dependencies
const TOML = require("@iarna/toml");
const ow = require("ow");
const cloneDeep = require("lodash.clonedeep");

// Require Internal Dependencies
const { assertFilePath, assertVersion } = require("./src/assert");

/**
 * @typedef {Object} Doc
 * @property {String[]} include
 * @property {Number} port
 */

/**
 * @typedef {Object} psp
 * @property {Boolean} npmrc
 * @property {Boolean} jsdoc
 */

/**
 * @typedef {Object} Payload
 * @property {String} name Name config
 * @property {String} version Version config
 * @property {String} type Type project config
 * @property {String} org Organization name
 * @property {Object} dependencies Addon dependencies config
 * @property {Doc} doc
 * @property {psp} psp
 */

// Symbols
const symName = Symbol("name");
const symVer = Symbol("version");
const symType = Symbol("type");
const symDep = Symbol("dependencies");
const symDoc = Symbol("doc");
const symPsp = Symbol("psp");
const symOrg = Symbol("org");

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
     * @memberof Manifest
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
        ow(payload, ow.object);

        const { name, version, type, org, dependencies, doc, psp } = Object.assign({}, Manifest.DEFAULT_OPTIONS, payload);
        ow(name, ow.string);
        ow(doc, ow.object);
        ow(psp, ow.object);
        ow(org, ow.optional.string);

        const { port = Manifest.DEFAULT_DOC_PORT, include = [] } = doc;
        const { jsdoc = true, npmrc = true } = psp;

        const validSemver = assertVersion("payload.version", version);
        if (!Manifest.TYPES.has(type)) {
            throw new TypeError(`payload.type must be one <string> of the Set : ${[...Manifest.TYPES]}`);
        }
        ow(dependencies, ow.object);
        ow(include, ow.array);
        ow(port, ow.number);
        ow(npmrc, ow.boolean);
        ow(jsdoc, ow.boolean);

        // Note: doc.include must contain string with a '.js' extension
        const includeFinal = include.filter((file) => typeof file === "string" && extname(file) === ".js");

        Reflect.defineProperty(this, symName, { value: name });
        Reflect.defineProperty(this, symVer, { value: validSemver });
        Reflect.defineProperty(this, symType, { value: type });
        Reflect.defineProperty(this, symOrg, { value: org || null });
        Reflect.defineProperty(this, symDep, {
            value: Object.create(null)
        });
        Reflect.defineProperty(this, symDoc, { value: { port, include: includeFinal } });
        Reflect.defineProperty(this, symPsp, { value: { jsdoc, npmrc } });
        for (const [name, version] of Object.entries(dependencies)) {
            this.addDependency(name, version);
        }
    }

    /**
     * @method addDependency
     * @memberof Manifest
     * @param {!String} name dependency name
     * @param {!String} version dependency version
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
     * @method hasDependency
     * @memberof Manifest
     * @param {!String} name dependency name
     * @returns {Boolean}
     */
    hasDependency(name) {
        return Reflect.has(this[symDep], name);
    }

    /**
     * @version 0.1.0
     * @member {String} name
     * @memberof Manifest
     */
    get name() {
        return this[symName];
    }

    /**
     * @version 0.1.0
     * @member {String} version
     * @memberof Manifest
     */
    get version() {
        return this[symVer];
    }

    /**
     * @version 0.4.0
     * @member {String} org
     * @memberof Manifest
     */
    get org() {
        return this[symOrg];
    }

    /**
     * @version 0.1.0
     * @member {String} type
     * @memberof Manifest
     */
    get type() {
        return this[symType];
    }

    /**
     * @version 0.1.0
     * @member {Object} dependencies
     * @memberof Manifest
     */
    get dependencies() {
        return cloneDeep(this[symDep]);
    }

    /**
     * @version 0.2.0
     * @member {Doc} doc
     * @memberof Manifest
     */
    get doc() {
        return cloneDeep(this[symDoc]);
    }

    /**
     * @version 0.3.0
     * @member {psp} psp
     * @memberof Manifest
     */
    get psp() {
        return cloneDeep(this[symPsp]);
    }

    /**
     * @version 0.1.0
     *
     * @static
     * @method create
     * @desc Create a new manifest file on the disk, return a Manifest Object.
     * @memberof Manifest
     * @param {!Payload} config Config manifest
     * @param {String} [filePath] filePath
     * @param {Boolean} [lightMode=false] activate light mode
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
     * @method open
     * @desc Open and read an existing manifest file (.toml). Return a Manifest Object.
     * @memberof Manifest
     * @param {String=} filePath File path
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
     * @memberof Manifest
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
     * @memberof Manifest
     * @desc Transform Manifest Object to a valid JSON payload.
     * @returns {Payload}
     */
    toJSON() {
        const ret = {
            name: this.name,
            version: this.version,
            type: this.type,
            org: this.org,
            dependencies: this.dependencies,
            doc: this.doc,
            psp: this.psp
        };

        return ret;
    }
}

Manifest.DEFAULT_FILE = join(process.cwd(), "slimio.toml");
Manifest.DEFAULT_DOC_PORT = 2000;
Manifest.DEFAULT_OPTIONS = {
    dependencies: Object.create(null),
    doc: { include: [], port: Manifest.DEFAULT_DOC_PORT },
    psp: Object.create(null)
};

/** @type {Readonly<Set<String>>} */
Manifest.TYPES = Object.freeze(new Set(["Addon", "NAPI", "CLI", "Package", "Service"]));

Object.preventExtensions(Manifest);

module.exports = Manifest;
