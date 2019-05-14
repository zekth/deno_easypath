# Deno_easyPath [![Build Status](https://travis-ci.org/zekth/deno_easypath.svg?branch=master)](https://travis-ci.org/zekth/deno_easypath)

## Usage

```ts
import { EasyPath } from "./mod.ts";

new EasyPath()
  .join("foo")
  .join("bar.ts")
  .toString(); // output foo/bar.ts

new EasyPath().join("bar.ts").touch(); // create ./bar.ts Synchronously

const e = new EasyPath({ path: "./", async: true }).join("bar.ts").touch();
e.exec(); // create ./bar.ts Asynchronously

// you can also chain actions
new EasyPath()
  .join("subFolder")
  .mkdir()
  .join("foo.ts")
  .touch(); // create ./subFolder/bar.ts Synchronously

const e = new EasyPath({ path: "./", async: true })
  .join("subFolder")
  .mkdir()
  .join("foo.ts")
  .touch();
await e.exec(); // create ./subFolder/bar.ts Asynchronously
```
