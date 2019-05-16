import { join } from "https://deno.land/std/fs/path/mod.ts";
import { unimplemented } from "https://deno.land/std/testing/asserts.ts";
import { existsSync } from "https://deno.land/std/fs/exists.ts";

export interface CopyOption {
  to?: EasyPath | string;
  into?: EasyPath | string;
}

export interface EasyPathOpt {
  path: string;
  async?: boolean;
}

enum ops {
  copy,
  mkdir,
  touch,
  chmod
}

export interface Op {
  name: ops;
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: Record<string, any>;
}

export interface LsRes {
  name: string;
  extension?: string;
  isDirectory: boolean;
  isFile: boolean;
  isSymlink: boolean;
}

const handler = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: function(obj, prop, receiver): any {
    if (!obj[prop]) {
      return obj.join(prop);
    }
    return Reflect.get(obj, prop, receiver);
  }
};

function returnProxy(e: EasyPath): EasyPath {
  return new Proxy(e, handler);
}

export class EasyPath {
  private path: string;
  private queue: Op[] = [];
  private encoder: TextEncoder = new TextEncoder();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static home: any = new EasyPath("~");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static root: any = new EasyPath("/");

  constructor(path: string = "./") {
    this.path = path;
    return returnProxy(this);
  }

  public toString(): string {
    return this.path;
  }

  hasQueue(): boolean {
    return this.queue.length > 0;
  }

  isFile(): boolean {
    if (existsSync(this.path)) {
      return Deno.statSync(this.path).isFile();
    }
    return false;
  }

  isDirectory(): boolean {
    if (existsSync(this.path)) {
      return Deno.statSync(this.path).isDirectory();
    }
    return false;
  }

  isSymlink(): boolean {
    if (existsSync(this.path)) {
      return Deno.statSync(this.path).isSymlink();
    }
    return false;
  }

  cwd(path: string): EasyPath {
    this.path = path;
    return returnProxy(this);
  }

  mkdir(): EasyPath {
    this.queue.push({ name: ops.mkdir, path: this.path });
    return returnProxy(this);
  }

  join(path: string): EasyPath {
    this.path = join(this.path, path);
    return returnProxy(this);
  }

  copy(_: CopyOption): EasyPath {
    unimplemented();
    this.queue.push({ name: ops.copy, path: this.path });
    return returnProxy(this);
  }

  touch(): EasyPath {
    this.queue.push({ name: ops.touch, path: this.path });
    return returnProxy(this);
  }

  chmod(mode: number): EasyPath {
    this.queue.push({ name: ops.chmod, path: this.path, args: { mode: mode } });
    return returnProxy(this);
  }

  ls(): LsRes[] {
    function compare(a: LsRes, b: LsRes): number {
      let comparison = 0;
      if (a.name > b.name) {
        comparison = 1;
      } else if (a.name < b.name) {
        comparison = -1;
      }
      return comparison;
    }
    const arr = Deno.readDirSync(this.path);
    const out = [];
    for (const f of arr) {
      let ext;
      let o: LsRes = {
        name: f.name,
        isDirectory: f.isDirectory(),
        isFile: f.isFile(),
        isSymlink: f.isSymlink()
      };
      if (f.isFile()) {
        const s = f.name.split(".");
        ext = s[s.length - 1];
        o.extension = ext;
      }
      out.push(o);
    }
    out.sort(compare);
    return out;
  }

  execSync(): void {
    for (const o of this.queue) {
      switch (o.name) {
        case ops.chmod:
          Deno.chmodSync(o.path, o.args.mode);
          break;
        case ops.mkdir:
          Deno.mkdirSync(o.path, true);
          break;
        case ops.copy:
          break;
        case ops.touch:
          Deno.writeFileSync(o.path, this.encoder.encode(""));
          break;
      }
    }
    this.queue = [];
  }

  async exec(): Promise<void> {
    for (const o of this.queue) {
      let p;
      switch (o.name) {
        case ops.chmod:
          p = Deno.chmod(o.path, o.args.mode);
          break;
        case ops.mkdir:
          p = Deno.mkdir(o.path, true);
          break;
        case ops.copy:
          break;
        case ops.touch:
          p = Deno.writeFile(o.path, this.encoder.encode(""));
          break;
      }
      await p;
    }
    this.queue = [];
  }
}
