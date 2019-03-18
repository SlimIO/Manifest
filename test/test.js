// Require Node.js Dependencies
const { promises: { unlink, access }, existsSync } = require("fs");
const { join } = require("path");

// Require Third-party Dependencies
const avaTest = require("ava");
const Manifest = require("../");
const is = require("@slimio/is");
const cloneDeep = require("lodash.clonedeep");

const Types = new Set(["Addon", "NAPI", "CLI"]);
const VALID_OBJ = {
    name: "My project",
    version: "7.7.7",
    type: "Addon",
    dependencies: {
        Event: "1.1.1"
    }
};

avaTest.after(async(assert) => {
    if (existsSync(Manifest.DEFAULT_FILE)) {
        await unlink(Manifest.DEFAULT_FILE);
    }

    const test = join(__dirname, "test.toml");
    if (existsSync(test)) {
        await unlink(test);
    }
    assert.pass();
});

function modifValidobj(obj) {
    return Object.assign(cloneDeep(VALID_OBJ), obj);
}

avaTest("Check Manifest static properties", async(assert) => {
    assert.true(is.classObject(Manifest));
    assert.false(Object.isExtensible(Manifest));
    assert.true(is.set(Manifest.TYPES));
    assert.true(Object.isFrozen(Manifest.TYPES));
    assert.true(is.string(Manifest.DEFAULT_FILE));
    assert.is(Manifest.DEFAULT_FILE, join(process.cwd(), "slimio.toml"));
});

avaTest("Manifest properties must be private", async(assert) => {
    const manifest = new Manifest({
        name: "project", version: "2.0.0", type: "Addon"
    });

    assert.is(Object.keys(manifest).length, 0);
    assert.is(Reflect.ownKeys(manifest).length, 4);
    assert.is(manifest.name, "project");
    assert.is(manifest.version, "2.0.0");
    assert.is(manifest.type, "Addon");
    assert.deepEqual(manifest.dependencies, {});
});

avaTest("manifest toJSON()", (assert) => {
    const payload = {
        name: "project", version: "2.0.0", type: "Addon", dependencies: {}
    };
    const manifest = new Manifest(payload);
    assert.deepEqual(payload, manifest.toJSON());
});

avaTest("constructor: payload param must be a typeof <object>", (assert) => {
    assert.throws(() => {
        new Manifest(null);
    }, { instanceOf: TypeError, message: "payload param must be a typeof <object>" });

    assert.throws(() => {
        new Manifest([]);
    }, { instanceOf: TypeError, message: "payload param must be a typeof <object>" });
});

avaTest("constructor: payload.name must be a typeof <string>", (assert) => {
    assert.throws(() => {
        new Manifest(modifValidobj({ name: 10 }));
    }, { instanceOf: TypeError, message: "payload.name must be a typeof <string>" });
});

avaTest("constructor: payload.version must be a valid semver", (assert) => {
    assert.throws(() => {
        new Manifest(modifValidobj({ version: 10 }));
    }, { instanceOf: Error, message: "payload.version must be a valid semver" });
});

avaTest(`constructor: payload.type must be one <string> of the Set : ${[...Types]}`, (assert) => {
    assert.throws(() => {
        new Manifest(modifValidobj({ type: 10 }));
    }, { instanceOf: TypeError, message: `payload.type must be one <string> of the Set : ${[...Types]}` });
});

avaTest("constructor: payload.dependencies must be a typeof <object>", (assert) => {
    assert.throws(() => {
        new Manifest(modifValidobj({ dependencies: 10 }));
    }, { instanceOf: TypeError, message: "payload.dependencies must be a typeof <object>" });
});

avaTest("constructor: payload.dependencies.key must be a valid semver", (assert) => {
    assert.throws(() => {
        new Manifest(modifValidobj({ dependencies: { abc: 10 } }));
    }, { instanceOf: Error, message: "payload.dependencies.abc must be a valid semver" });
});

avaTest("open: filePath param must be a typeof <string>", (assert) => {
    assert.throws(() => {
        Manifest.open(null);
    }, { instanceOf: TypeError, message: "filePath param must be a typeof <string>" });
});

avaTest("open: filePath param must ba an absolute path", (assert) => {
    assert.throws(() => {
        Manifest.open("foo");
    }, { instanceOf: Error, message: "filePath param must ba an absolute path" });
});

avaTest("open: extension file must be a .toml", (assert) => {
    assert.throws(() => {
        Manifest.open(join(__dirname, "slimio.txt"));
    }, { instanceOf: Error, message: "extension file must be a .toml" });
});

avaTest("open: slimio.toml (with absolute path)", (assert) => {
    const manifest = Manifest.open(join(__dirname, "slimio.toml"));
    assert.is(manifest.name, "project");
    assert.is(manifest.version, "0.1.0");
    assert.is(manifest.type, "CLI");
    assert.deepEqual(manifest.dependencies, {});
});

avaTest("create: default", async(assert) => {
    const filePath = join(__dirname, "test.toml");
    const manifest = Manifest.create({
        name: "project", version: "1.0.0", type: "Addon"
    }, filePath);
    await access(filePath);

    assert.is(manifest.name, "project");
    assert.is(manifest.version, "1.0.0");
    assert.is(manifest.type, "Addon");
    assert.deepEqual(manifest.dependencies, {});
    await unlink(filePath);
});

avaTest("create: must throw if file exist", (assert) => {
    const filePath = join(__dirname, "slimio.toml");
    assert.throws(() => {
        Manifest.create({
            name: "project", version: "1.0.0", type: "Addon"
        }, filePath);
    }, { instanceOf: Error, message: `Can't create new manifest at ${filePath}!` });
});

avaTest("writeOnDisk: manifest must be instanceof Manifest Object", (assert) => {
    assert.throws(() => {
        Manifest.writeOnDisk(null);
    }, { instanceOf: TypeError, message: "manifest param must be instanceof Manifest Object" });
});

avaTest("writeOnDisk: unable to writeOnDisk", (assert) => {
    const manifest = new Manifest(VALID_OBJ);
    assert.throws(() => {
        Manifest.writeOnDisk(manifest);
    }, { instanceOf: Error, message: `Unable to write ${Manifest.DEFAULT_FILE} on disk!` });
});

avaTest("writeOnDisk: filePath param must be a typeof <string>", (assert) => {
    const manifest = new Manifest(VALID_OBJ);
    assert.throws(() => {
        Manifest.writeOnDisk(manifest, null);
    }, { instanceOf: TypeError, message: "filePath param must be a typeof <string>" });
});

avaTest("writeOnDisk: filePath param must ba an absolute path", (assert) => {
    const manifest = new Manifest(VALID_OBJ);
    assert.throws(() => {
        Manifest.writeOnDisk(manifest, "foo");
    }, { instanceOf: Error, message: "filePath param must ba an absolute path" });
});

avaTest("writeOnDisk: extension file must be a .toml", (assert) => {
    const manifest = new Manifest(VALID_OBJ);
    assert.throws(() => {
        Manifest.writeOnDisk(manifest, join(__dirname, "slimio.txt"));
    }, { instanceOf: Error, message: "extension file must be a .toml" });
});

avaTest("create and re-write on disk", async(assert) => {
    const manifest = Manifest.create(VALID_OBJ);
    await access(Manifest.DEFAULT_FILE);

    const iManifest = Manifest.open();
    assert.deepEqual(iManifest.toJSON(), VALID_OBJ);

    Manifest.writeOnDisk(manifest);
    await unlink(Manifest.DEFAULT_FILE);
    assert.pass();
});
