"use strict";

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
 * @description File path checker
 * @param {!string} filePath File path
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
 * @description Sementic versionning checker
 * @param {!string} paramName Param name checking
 * @param {!string} value Sementic versionning value
 * @returns {string}
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
