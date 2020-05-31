# Deno easyPath [![Build Status](https://travis-ci.org/zekth/deno_easypath.svg?branch=master)](https://travis-ci.org/zekth/deno_easypath)

Path wrapper to manipulate Filesystem using [Deno](https://github.com/denoland/deno). Mostly inspired by [Path.swift](https://github.com/mxcl/Path.swift)

## Concept

easyPath give you the possibility to manipulate the FileSystem of Deno using chains of actions. After the declaration you can execute all the actions synchronously or asynchronously. Also you can have nested chains, see `copy` example.

## API

### Actions

- **`path(path: string): EasyPath`**: Get a new instance of the path.
- **`join(path: string): void`**: Join the string to the path.
- **`touch(): void`**: Create an emptry file of the path.
- **`mkdir(): void`**: Create the directory of the path.
- **`copy(c: CopyOption): void`**: See [copy](#Copy) section
- **`cwd(path: string): void`**: Set the current working directory. Rewrite the path of the `path()` instance.
- **`chmod(mode: number): void`**: Chmod on the path (only Unix supported).
- **`exec(): Promise<void>`**: Executes the chain asynchronously.
- **`execSync(): void`**: Executes the chain synchronously.
- **`ls(): LsRes[]`**: Returns the list of the files and directories of the current path.

#### Copy

Copy will copy the current path `to` or `into` the passed option. `to` or `into` can either be a path string or an easyPath instance. Also this instance has not to have its chain executed, it will be executed with the main easyPath instance. See example below:

```ts
path()
  .join("foo.ts")
  .copy({
    into: path()
      .join("sub")
      .mkdir()
  })
  .execSync();
```

```ts
export interface CopyOption {
  to?: EasyPath | string;
  into?: EasyPath | string;
}
```

- `into`: Will copy the current path IN the path in parameter. eg:

```ts
path()
  .join("foo.ts")
  .copy({
    into: path().join("sub")
  });
// Will copy ./foo.ts to ./sub/foo.ts
```

- `to`: Will copy the current path to the path in parameter. eg:

```ts
path()
  .join("foo.ts")
  .copy({
    to: path()
      .join("sub")
      .join("bar.ts")
  });
// Will copy ./foo.ts to ./sub/bar.ts
```

### Status

Those statuses only work on a path without action in the chain. If so, you have to `exec` the chain before getting the status.

- **`isFile(): boolean`**: Returns a boolean if the path of the chain is a File.
- **`isDirectory(): boolean`**: Returns a boolean if the path of the chain is a Directory.
- **`isSymlink(): boolean`**: Returns a boolean if the path of the chain is a Symlink.

### Dynamic getters

easyPath uses [Javascript Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to have possibility to write syntax like this:
```ts
path('~').foo.bar.bur.bor.toString();
// output ~\foo\bar\bur\bor
```

### Examples

```ts
import { path } from "https://deno.land/x/easypath/mod.ts";

path("/")
  .join("foo")
  .join("bar.ts")
  .toString(); // output /foo/bar.ts

path()
  .join("bar.ts")
  .touch()
  .execSync(); // create ./bar.ts Synchronously

const e = path()
  .join("bar.ts")
  .touch();
await e.exec(); // create ./bar.ts Asynchronously

// you can also chain actions
path()
  .join("subFolder")
  .mkdir()
  .join("foo.ts")
  .touch()
  .execSync(); // create ./subFolder/bar.ts Synchronously

const e = path()
  .join("subFolder")
  .mkdir()
  .join("foo.ts")
  .touch();
await e.exec(); // create ./subFolder/bar.ts Asynchronously

path()
  .join("foo.ts")
  .copy({ to: path(testRootPath).join("bar.ts") })
  .execSync();
// Will copy ./foo.ts to ./bar.ts

path()
  .join("foo.ts")
  .copy({ into: path(testRootPath).join("sub") })
  .execSync();
// Will copy ./foo.ts to ./sub/bar.ts

// copy accept also EasyPath chains.
path(testRootPath)
  .join("foo.ts")
  .copy({
    into: path(testRootPath)
      .join("sub")
      .mkdir()
  })
  .execSync();
// Will copy ./foo.ts to ./sub/bar.ts
// Note chains in the copy args are executed synchronously
```

## TODO

- Add symlink resolution
