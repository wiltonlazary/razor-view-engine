///<reference path="./node.d.ts"/>
declare namespace NodeVm {
    interface Context { }
    interface Script {
        runInThisContext(): void;
        runInNewContext(sandbox?: Context): void;
    }
    
    interface VM {
        runInThisContext(code: string, filename?: string): void;
        runInNewContext(code: string, sandbox?: Context, filename?: string): void;
        runInContext(code: string, context: Context, filename?: string): void;
        createContext(initSandbox?: Context): Context;
        createScript(code: string, filename?: string): Script;
    }
}

interface NodeRequireFunction {
    (id: "vm"): NodeVm.VM;
}