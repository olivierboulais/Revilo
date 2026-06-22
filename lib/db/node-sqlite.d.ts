// Minimal local type declaration for node:sqlite, which @types/node@20
// doesn't yet include (it landed in Node 22). The runtime here is Node
// 22.22.2 and the module works correctly — this just fills the typings gap
// rather than waiting on an @types/node major bump that could introduce
// unrelated breaking changes.
declare module "node:sqlite" {
  export class DatabaseSync {
    constructor(path: string, options?: { readOnly?: boolean });
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }

  export class StatementSync {
    run(...params: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint };
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
  }
}
