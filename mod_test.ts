// import { test, runIfMain } from "https://deno.land/std@v0.53.0/testing/mod.ts";
import {
  assertEquals,
  assert,
} from "https://deno.land/std@v0.53.0/testing/asserts.ts";
import { exists } from "https://deno.land/std@v0.53.0/fs/exists.ts";
import { join } from "https://deno.land/std@v0.53.0/path/mod.ts";

import { path } from "./mod.ts";
const { test } = Deno;

const testRootPath = "./test_data";
const isNotWindows = Deno.build.os !== "windows";

async function setupTestEnv(): Promise<void> {
  if (!(await exists(testRootPath))) {
    await Deno.mkdir(testRootPath);
  }
}

async function wipeTestEnv(): Promise<void> {
  if (await exists(testRootPath)) {
    await Deno.remove(testRootPath, { recursive: true });
  }
  await setupTestEnv();
}

test({
  name: "ls",
  async fn(): Promise<void> {
    await setupTestEnv();
    const e = new TextEncoder();
    Deno.writeFileSync(join(testRootPath, "foo.ts"), e.encode(""));
    Deno.writeFileSync(join(testRootPath, "bar.ts"), e.encode(""));
    Deno.mkdirSync(join(testRootPath, "folder"));
    const ls = await path(testRootPath).ls();
    assertEquals(ls, [
      {
        isDirectory: false,
        isFile: true,
        isSymlink: false,
        name: "bar.ts",
        extension: "ts",
      },
      {
        isDirectory: true,
        isFile: false,
        isSymlink: false,
        name: "folder",
      },
      {
        isDirectory: false,
        isFile: true,
        isSymlink: false,
        name: "foo.ts",
        extension: "ts",
      },
    ]);
    await wipeTestEnv();
  },
});

test({
  name: "Exec",
  async fn(): Promise<void> {
    await setupTestEnv();
    const e = path(testRootPath)
      .join("subFolder")
      .mkdir()
      .join("foo.ts")
      .touch();
    await e.exec();
    assert(await exists(join(testRootPath, "subFolder", "foo.ts")));
    await wipeTestEnv();
  },
});

test({
  name: "Join",
  async fn(): Promise<void> {
    await setupTestEnv();
    const d = path(testRootPath)
      .join("sub1")
      .join("sub2")
      .join("sub3")
      .join("sub4")
      .join("sub5");
    assertEquals(
      d.toString(),
      join(testRootPath, "sub1", "sub2", "sub3", "sub4", "sub5"),
    );
  },
});

test({
  name: "Touch Sync",
  async fn(): Promise<void> {
    await setupTestEnv();
    path(testRootPath)
      .join("foo.ts")
      .touch()
      .execSync();
    assert(await exists(join(testRootPath, "foo.ts")));
    await wipeTestEnv();
  },
});

test({
  name: "Touch Async",
  async fn(): Promise<void> {
    await setupTestEnv();
    const d = path(testRootPath)
      .join("foo.ts")
      .touch();
    await d.exec();
    assert(await exists(join(testRootPath, "foo.ts")));
    await wipeTestEnv();
  },
});

test({
  name: "MkDir Sync",
  async fn(): Promise<void> {
    await setupTestEnv();
    await path(testRootPath)
      .join("subdir")
      .mkdir()
      .execSync();
    assert(await exists(join(testRootPath, "subdir")));
    await wipeTestEnv();
  },
});

test({
  name: "MkDir Async",
  async fn(): Promise<void> {
    await setupTestEnv();
    const d = await path(testRootPath)
      .join("subdir")
      .mkdir();
    await d.exec();
    assert(await exists(join(testRootPath, "subdir")));
    await wipeTestEnv();
  },
});

test({
  name: "Proxy properties",
  async fn(): Promise<void> {
    const actual = path("/").is.where.the.tree.iz.toString();
    const expected = join("/", "is", "where", "the", "tree", "iz");
    assertEquals(actual, expected);
    const actual1 = path("~").sweet.home.toString();
    const expected1 = join("~", "sweet", "home");
    assertEquals(actual1, expected1);
    const actual2 = path().somewhere.far.away.toString();
    const expected2 = join("./", "somewhere", "far", "away");
    assertEquals(actual2, expected2);
  },
});

test({
  name: "isDirectory()",
  async fn(): Promise<void> {
    await setupTestEnv();
    const d = path(testRootPath).isDirectory();
    assert(d);
    const d2 = path()
      .join("mod.ts")
      .isDirectory();
    assertEquals(d2, false);
    const d3 = path()
      .join("dOzNotEXiZt")
      .isDirectory();
    assertEquals(d3, false);
    await wipeTestEnv();
  },
});

test({
  name: "isFile()",
  async fn(): Promise<void> {
    await setupTestEnv();
    const d = path(testRootPath).isFile();
    assertEquals(d, false);
    const d2 = path()
      .join("mod.ts")
      .isFile();
    assertEquals(d2, true);
    const d3 = path()
      .join("dOzNotEXiZt")
      .isFile();
    assertEquals(d3, false);
    await wipeTestEnv();
  },
});

test({
  name: "Copy",
  async fn(): Promise<void> {
    await setupTestEnv();
    const e = new TextEncoder();

    Deno.writeFileSync(join(testRootPath, "foo.ts"), e.encode(""));
    path(testRootPath)
      .join("foo.ts")
      .copy({ to: path(testRootPath).join("bar.ts") })
      .execSync();
    assert(await exists(join(testRootPath, "bar.ts")));

    Deno.mkdirSync(join(testRootPath, "sub"));
    path(testRootPath)
      .join("foo.ts")
      .copy({ into: path(testRootPath).join("sub") })
      .execSync();
    assert(await exists(join(testRootPath, "sub", "foo.ts")));

    await wipeTestEnv();
  },
});

test({
  name: "Copy Chain",
  async fn(): Promise<void> {
    await setupTestEnv();
    const e = new TextEncoder();

    Deno.writeFileSync(join(testRootPath, "foo.ts"), e.encode(""));
    path(testRootPath)
      .join("foo.ts")
      .copy({
        into: path(testRootPath)
          .join("sub")
          .mkdir(),
      })
      .execSync();
    assert(await exists(join(testRootPath, "sub", "foo.ts")));

    await wipeTestEnv();
  },
});

test({
  name: "Copy Async",
  async fn(): Promise<void> {
    await setupTestEnv();
    const e = new TextEncoder();

    Deno.writeFileSync(join(testRootPath, "foo.ts"), e.encode(""));
    await path(testRootPath)
      .join("foo.ts")
      .copy({ to: path(testRootPath).join("bar.ts") })
      .exec();
    assert(await exists(join(testRootPath, "bar.ts")));

    Deno.mkdirSync(join(testRootPath, "sub"));
    await path(testRootPath)
      .join("foo.ts")
      .copy({ into: path(testRootPath).join("sub") })
      .exec();
    assert(await exists(join(testRootPath, "sub", "foo.ts")));

    await wipeTestEnv();
  },
});

if (isNotWindows) {
  test({
    name: "chmod",
    async fn(): Promise<void> {
      await setupTestEnv();
      const e = new TextEncoder();
      Deno.writeFileSync(join(testRootPath, "foo.ts"), e.encode(""));
      await path(testRootPath)
        .join("foo.ts")
        .chmod(0o755)
        .execSync();
      const fileInfo = Deno.statSync(
        path(testRootPath)
          .join("foo.ts")
          .toString(),
      );
      assertEquals(fileInfo.mode! & 0o755, 0o755);
      await path(testRootPath)
        .join("foo.ts")
        .chmod(0o644)
        .execSync();
      if (isNotWindows) {
        const fileInfo = Deno.statSync(
          path(testRootPath)
            .join("foo.ts")
            .toString(),
        );
        assertEquals(fileInfo.mode! & 0o644, 0o644);
      }
      await path(testRootPath)
        .join("foo.ts")
        .chmod(0o666)
        .execSync();
      if (isNotWindows) {
        const fileInfo = Deno.statSync(
          path(testRootPath)
            .join("foo.ts")
            .toString(),
        );
        assertEquals(fileInfo.mode! & 0o666, 0o666);
      }
      await wipeTestEnv();
    },
  });
}

// runIfMain(import.meta);
