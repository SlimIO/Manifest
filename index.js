// Require Node Dependencies
const {
    readFile,
    writeFile
} = require("fs").promises;
const { isAbsolute, join } = require("path");

// Require Third-party Dependencies
const TOML = require("@iarna/toml");

const DEFAULT_TOML = {
    name: "project",
    version: "1.0.0",
    project_type: "Addon",
    dependencies: {
        Events: "1.0.0"
    },
    psp: {
        param: false
    },
    build: {
        treeshake: true,
        removeComment: false
    }
};

/**
 * @class Manifest
 * @property {String} filePath File path
 */
class Manifest {
    /**
     * @constructor
     * @param {String} filePath filePath
     *
     * @throws {TypeError|Error}
     */
    constructor(filePath = join(process.cwd(), "slimio.toml")) {
        if (typeof filePath !== "undefined" && typeof filePath !== "string") {
            throw new TypeError("filePath param must be a typeof <string>");
        }
        if (!isAbsolute(filePath)) {
            throw new Error("filePath param must ba an absolute path");
        }

        this.filePath = filePath;
    }

    /**
     * @version 0.1.0
     *
     * @async
     * @method wcreaterite
     * @memberof Manifest#
     * @param {Object} tomlObj tomlObj
     * 
     * @returns {Promise}
     */
    async create(tomlObj = DEFAULT_TOML) {
        await writeFile(this.filePath, TOML.stringify(tomlObj));
    }

    /**
     * @version 0.1.0
     *
     * @public
     * @async
     * @method write
     * @memberof Manifest#
     * @param {Object} updateObj updateObj
     *
     * @returns {Promise}
     */
    async update(updateObj) {
        const tomlObj = await this.read();
        const update = Object.assign(tomlObj, updateObj);
        await writeFile(this.filePath, TOML.stringify(update));

        return this.dir;
    }

    /**
     * @version 0.1.0
     *
     * @public
     * @async
     * @method read
     * @memberof Manifest#
     *
     * @returns {Object}
     */
    async read() {
        const toml = await readFile(this.filePath, { encoding: "utf-8" });

        return TOML.parse(toml);
    }
}

module.exports = Manifest;
