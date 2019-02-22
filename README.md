# Manifest
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/is/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
![V1.0](https://img.shields.io/badge/version-0.1.0-blue.svg)

This package was created to manage manifest for the SlimIO Project.

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slimio/manifester
# or
$ yarn add @slimio/manifester
```

## Usage example
Create and write TOML file

```js
const Manifest = require("@slimio/manifest");

const manifest = Manifest.create();
const filePath = "/your/file/path.toml";

Manifest.writeOnDisk(manifest, filePath);
```

## API

```ts
declare namespace Manifest {
    interface Dependencies {
        [name: string]: string;
    }

    interface Payload {
        name: string;
        version: string;
        type: string;
        dependencies?: Dependencies;
    }
}
```

Default values:
- name: `project`
- version: `1.0.0`
- type: `Addon`
- dependecies: `{}` or `undefined`

<details>
    <summary>static create(payload?: Manifest.Payload): Manifest</summary>

Create Manifest object with an object.

```js
const Manifest = require("@slimio/manifest");

const manifest = Manifest.create();
console.log(manifest.toJSON());
```

<br>
</details>

<details>
    <summary>static writeOnDisk(manifest: Manifest, filePath?: string): void</summary>

Write toml file if not exist.
```js
const Manifest = require("@slimio/manifest");

const manifest = Manifest.create();
const filePath = "/your/file/path.toml";

Manifest.writeOnDisk(manifest, filePath);
```
> Default path : `process.cwd/slimio.toml`

<br>
</details>

<details>
    <summary>static read(filePath: string): Manifest</summary>
    
Read toml file and return a specific Manifest object.
```js
const Manifest = require("@slimio/manifest");
const filePath = "/your/file/path.toml";

const manifest Manifest.read(filePath);
console.log(manifest.toJSON());
```

<br>
</details>

<details>
    <summary>toJSON(): Manifest.Payload</summary>
    
Return Manifest with private attributs as a JSON Object.
```js
const Manifest = require("@slimio/manifest");

const manifest = Manifest.create();
console.log(manifest.toJSON());
```

<br>
</details>

# License
MIT
