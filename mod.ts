import { join } from "https://deno.land/std/fs/path/mod.ts";
import { walk } from "https://deno.land/std/fs/walk.ts";
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
  args?: Record<string, any>;
}

const handler = {
  get: function(obj, prop, receiver) {
    if (!obj[prop]) {
      return obj.join(prop);
    }
    return Reflect.get(obj, prop, receiver);
  }
};

function returnProxy(e: EasyPath) {
  return new Proxy(e, handler);
}

export class EasyPath {
  private path: string;
  private queue: Array<Op>;
  private encoder: TextEncoder = new TextEncoder();

  static home: any = new EasyPath("~");
  static root: any = new EasyPath("/");

  constructor(path: string = "./") {
    this.path = path;
    this.queue = [];
    return returnProxy(this);
  }

  public toString(): string {
    return this.path;
  }

  public hasQueue(): boolean {
    return this.queue.length > 0;
  }

  get isFile() {
    if (existsSync(this.path)) {
      return Deno.statSync(this.path).isFile();
    }
    return false;
  }

  get isDirectory() {
    if (existsSync(this.path)) {
      return Deno.statSync(this.path).isDirectory();
    }
    return false;
  }

  get isSymlink() {
    if (existsSync(this.path)) {
      return Deno.statSync(this.path).isSymlink();
    }
    return false;
  }

  mkdir(): EasyPath {
    this.queue.push({ name: ops.mkdir, path: this.path });
    return returnProxy(this);
  }

  join(path: string): EasyPath {
    this.path = join(this.path, path);
    return returnProxy(this);
  }

  copy(opt: CopyOption): EasyPath {
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

  async ls(): Promise<string[]> {
    const arr = [];
    for await (const f of walk(this.path)) {
      arr.push(f.path.replace(/\\/g, "/"));
    }
    arr.sort();
    return arr;
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
