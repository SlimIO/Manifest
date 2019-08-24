# Manifest

![Version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/SlimIO/Manifest/master/package.json?token=Aeue0OHXB6Ozx8agcA1fkbEC6bCdL6epks5cearKwA%3D%3D&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/Manifest/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
![dep](https://img.shields.io/david/SlimIO/Manifest.svg)
![size](https://img.shields.io/bundlephobia/min/@slimio/manifest.svg)
[![Known Vulnerabilities](https://snyk.io/test/github/SlimIO/Manifest/badge.svg?targetFile=package.json)](https://snyk.io/test/github/SlimIO/Manifest?targetFile=package.json)
[![Build Status](https://travis-ci.com/SlimIO/Manifest.svg?branch=master)](https://travis-ci.com/SlimIO/Manifest) [![Greenkeeper badge](https://badges.greenkeeper.io/SlimIO/Manifest.svg)](https://greenkeeper.io/)

This package was created to manage the [manifest file](https://en.wikipedia.org/wiki/Manifest_file) of SlimIO projects. The manifest is useful when we need to describe specific behaviors and settings in our internals tools or to our global product. Some examples are:

- To create Addon archive the right way with the right parameters
- To the CLI to known the current addon dependencies (like npm).
- To disable given psp warnings (like eslint when you disable a rule).

Some might bring the question of why creating a dedicated manifest. The answer is simple: We did not want to add more keys and complexity to the package.json and bring a clean concern separation.

> ⚠️ This package read and write with Synchronous Node.js API. This package has been designed to be used as a tool or at runtime.

## Requirements
- [Node.js](https://nodejs.org/en/) v10 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slimio/manifest
# or
$ yarn add @slimio/manifest
```

## Usage example
Open local manifest. The default manifest name is `slimio.toml` !

```toml
name = "yourProject"
version = "1.0.0"
type = "Package"
```

Then, use the package manifest to open the manifest (located in the current working dir).
```js
const Manifest = require("@slimio/manifest");

const manifest = Manifest.open();
console.log(`name => ${manifest.name}`);
```

## Available Types

| name | description |
| --- | --- |
| Addon | Describe a SlimIO Addon |
| NAPI | A Node.js low-level binding in C or C++ with the new N-API |
| CLI | A command line interface project |
| Package | A classical npm/Node.js package |
| Service | A web API |
| Degraded | A project that doesn't match classical SlimIO policies like the eslint-config one |

## API
Following methods are members of **Manifest** class. Some types are described in the TypeScript namespace as follow:

```ts
declare namespace Manifest {
    type Type = "Addon" | "NAPI" | "CLI" | "Package" | "Service" | "Degraded";
    type Platform = "Any" | "Windows" | "Unix";

    interface psp {
        npmrc: boolean;
        jsdoc: boolean;
    }

    interface Documentation {
        include: string[];
        port: number;
    }

    interface Dependencies {
        [name: string]: string;
    }

    interface Payload {
        name: string;
        version: string;
        type: Type;
        dependencies?: Dependencies;
        platform?: Platform;
        doc?: {
            include?: string[];
            port?: number;
        }
    }
}
```

> ⚠️ Only "**Addon**" manifests can have dependencies.

<details>
    <summary><b>static</b> create(payload: Manifest.Payload, filePath?: string): Manifest</summary>

Create a new manifest at given **filePath** (The default value is equal to **Manifest.DEFAULT_FILE**). The manifest file must not exist, else the method will throw an Error.

```js
const { strictEqual } = require("assert");
const { existsSync } = require("fs");

const Manifest = require("@slimio/manifest");

const manifest = Manifest.create({
    name: "project",
    version: "1.0.0",
    type: "NAPI"
});
strictEqual(existsSync(Manifest.DEFAULT_FILE), true);
console.log(manifest.toJSON());
```

<br />
</details>

<details>
    <summary><b>static</b> writeOnDisk(manifest: Manifest, filePath?: string): void</summary>

Write a Manifest Object on the disk.
```js
const Manifest = require("@slimio/manifest");

const manifest = Manifest.open();
// Do your work here... update manifest

Manifest.writeOnDisk(manifest);
```

<br />
</details>

<details>
    <summary><b>static</b> open(filePath?: string): Manifest</summary>

Read and parse local .toml manifest file. The method return a complete Manifest Object (it will throw if something is wrong). The default value for filePath will be **Manifest.DEFAULT_FILE**.
```js
const Manifest = require("@slimio/manifest");

const manifest = Manifest.open();
console.log(manifest.toJSON());
```

<br />
</details>

<details><summary>toJSON(): Manifest.Payload</summary>

Return the Manifest Object as a JavaScript object (JSON compatible).
```js
const Manifest = require("@slimio/manifest");

const manifest = Manifest.open();
console.log(manifest.toJSON());
console.log(JSON.stringify(manifest));
```

<br />
</details>

### Getters

The Manifest Object is mostly composed of getters:

```ts
class Manifest {
    readonly name: string;
    readonly version: string;
    readonly type: Manifest.Type;
    readonly dependencies: Manifest.Dependencies;
    readonly doc: Manifest.Documentation;
    readonly psp: Manifest.psp;
    readonly platform: Manifest.platform;
    readonly org: string;
}
```

### Properties

following properties are static.

<details><summary>Manifest.DEFAULT_FILE</summary>
<br />

```js
const { join } = require("path");

Manifest.DEFAULT_FILE = join(process.cwd(), "slimio.toml");
```

<br />
</details>

<details><summary>Manifest.TYPES</summary>
<br />

Readonly Sets of available string types.
```js
Manifest.TYPES = Object.freeze(new Set(["Addon", "NAPI", "CLI", "Package", "Service"]));
```

<br />
</details>

<details><summary>Manifest.DEFAULT_DOC_PORT</summary>
<br />

Default documentation port (equal to **2000** by default).

<br />
</details>

## Dependencies
This project is covered by the SlimIO security policy and undergoes regular security audits.

| Name | Refactoring | Security Risk | Usage |
| --- | --- | --- | --- |
| [@slimio/is](https://github.com/SlimIO/is#readme) | Minor | Low | Type checker |
| [lodash.clonedeep](https://lodash.com/) | Minor | Low | Clone deep Objects |
| [semver](https://lodash.com/) | Major | Low | Assert manifest version as SemVer |
| [@iarna/toml](https://lodash.com/) | Major | Medium | Parse TOML, Stringify JSON into TOML |

## License
MIT
