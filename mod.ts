import { join } from "https://deno.land/std/fs/path/mod.ts";
import { walk } from "https://deno.land/std/fs/walk.ts";

export interface CopyOption {
  to?: string;
  into?: string;
}
export class Path {
  private path: string;
  private encoder: TextEncoder = new TextEncoder();
  static home = new Path("~");
  static root = new Path("/");
  constructor(path: string) {
    this.path = path;
    return this;
  }
  public toString(): string {
    return this.path;
  }
  async mkdir(): Promise<Path> {
    await Deno.mkdir(this.path, true);
    return this;
  }
  join(path: string): Path {
    this.path = join(this.path, path);
    return this;
  }
  async copy(opt: CopyOption): Promise<Path> {
    console.log(`copy:${opt}`);
    return this;
  }
  async touch(): Promise<Path> {
    await Deno.writeFile(this.path, this.encoder.encode(""));
    return this;
  }
  async chmod(mode: number): Promise<void> {
    await Deno.chmod(this.path, mode);
  }
  async ls(): Promise<string[]> {
    const arr = [];
    for await (const f of walk(this.path)) {
      arr.push(f.path.replace(/\\/g, "/"));
    }
    arr.sort();
    return arr;
  }
}
