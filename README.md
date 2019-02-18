# Manifest
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/is/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
![V1.0](https://img.shields.io/badge/version-0.1.0-blue.svg)


## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slimio/manifester
# or
$ yarn add @slimio/manifester
```


# API

<details>
    <summary>constructor(filePath: string)</summary>

> Default filePath value : `process.cwd() /slimio.toml`
```js
const Manifest = require("@slimio/manifest");
const { join } = require("path");

// Create slimio.toml at process.cwd
const manifest = new Manifest();

// Create manifest.toml at js file dirname
const manifest = new Manifest(join(__dirname, "manifest.toml"));
```
</details>

<details>
    <summary>create(tomlObj: object): Promise</summary>
Create TOML file with a javascript object

```js
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
```

JS code:
```js
const Manifest = require("@slimio/manifest");

const manifest = new Manifest();
manifest.create();
```

TOML file created :
```toml
name = "project"
version = "1.0.0"
project_type = "Addon"

[dependencies]
Events = "1.0.0"

[psp]
param = false

[build]
treeshake = true
removeComment = false
```
> Default TOML file name: `slimio.toml`

<br>
</details>

<details>
    <summary>update(updateObj: object): Promise</summary>

```js
const manifest = new Manifest();
manifest.create();
manifest.update({ psp: undefined, build: undefined })
```

Output TOML file:
```toml
name = "project"
version = "1.0.0"
project_type = "Addon"

[dependencies]
Events = "1.0.0"
```

<br>
</details>

<details>
    <summary>read(): string</summary>
    
File readed :
```toml
name = "project"
version = "1.0.0"
project_type = "Addon"

[dependencies]
Events = "1.0.0"
```

JS code:
```js
const manifest = new Manifest();
const toml = manifest.read();
console.log(toml);
/* output
{
    name: "project",
    version: "1.0.0",
    project_type: "Addon",
    dependencies: {
        Event: "1.0.0"
    }
}
*/
```


<br>
</details>

# License
MIT
