// Require Node Dependencies
const { isAbsolute, extname } = require("path");

// Require Third-party Dependencies
const is = require("@slimio/is");
const semver = require("semver");

/**
 * @namespace Assert
 */

/**
 * @version 0.1.0
 * @function assertFilePath
 * @memberof Assert#
 * @desc File path checker
 * @param {!String} filePath File path
 * @returns {void}
 *
 * @throws {TypeError}
 * @throws {Error}
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
 * @function assertVersion
 * @memberof Assert#
 * @desc Sementic versionning checker
 * @param {!String} paramName Param name checking
 * @param {!String} value Sementic versionning value
 * @return {String}
 *
 * @throws {Error}
 */
function assertVersion(paramName, value) {
    const validSemver = semver.valid(value);
    if (is.nullOrUndefined(validSemver)) {
        throw new Error(`${paramName} must be a valid semver`);
    }

    return validSemver;
}

module.exports = {
    assertFilePath,
    assertVersion
};
