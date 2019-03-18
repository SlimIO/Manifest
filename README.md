# Manifest

![Version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/SlimIO/Manifest/master/package.json?token=Aeue0OHXB6Ozx8agcA1fkbEC6bCdL6epks5cearKwA%3D%3D&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/is/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)

This package was created to manage the manifest file of SlimIO packages and addons.

> ⚠️ Synchronous API

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slimio/manifest
# or
$ yarn add @slimio/manifest
```

## Usage example
Open local manifest.

```js
const Manifest = require("@slimio/manifest");

const manifest = Manifest.open();
console.log(`name => ${manifest.name}`);
```

## API
Following methods are members of **Manifest** class. Some types are described in the TypeScript namespace as follow:

```ts
declare namespace Manifest {
    type Type = "Addon" | "NAPI" | "CLI";

    interface Dependencies {
        [name: string]: string;
    }

    interface Payload {
        name: string;
        version: string;
        type: Type;
        dependencies?: Dependencies;
    }
}
```

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

### Properties

<details><summary>Manifest.DEFAULT_FILE</summary>
<br />

**DEFAULT_FILE** is a static property of **Manifest**.
```js
const { join } = require("path");

Manifest.DEFAULT_FILE = join(process.cwd(), "slimio.toml");
```

<br />
</details>

# License
MIT
