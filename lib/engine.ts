///<reference path="../typings/node/node.d.ts"/>
///<reference path="../typings/node/vm.d.ts"/>
import { Lexer } from "./lexer";
import { Parser, AST } from "./parser";

class EngineSettings {
    public minifyHtml: boolean = false;
    
    public static getDefault(): EngineSettings {
        return new EngineSettings();
    }
}

class Engine {
    private _output: string;
    private _vm = require("vm");
    private _context: { [key: string]: string } = {};
    
    constructor(settings?: EngineSettings) {
        settings = settings || EngineSettings.getDefault();
    }
    
    public output(obj: AST.Object) {
        if (obj instanceof AST.View) {
            this.outputAll(obj.body);
        } else if (obj instanceof AST.Function) {
            this.exec(obj as AST.Function);
        } else if (obj instanceof AST.IfStatement) {
            this.outputIf(obj as AST.IfStatement);
        } else if (obj instanceof AST.Raw) {
            this._output += obj.content;
        }
    }
    
    public outputIf(_if: AST.IfStatement) {
        let isTrue = this.expr(_if.expr);
        
        if (typeof(isTrue) !== "boolean") {
            throw new Error("Expecting a boolean as if-expression on line: unknown");
        }
        
        switch (_if.type) {
            case AST.IfType.If:
                if (isTrue) {
                    this.outputAll(_if.body);
                }
                break;
        }
    }
    
    public exec(fn: AST.Function) {
        switch (fn.lib + "." + fn.name) {
            case "global.echo":
                this._output += this.expr(fn.expr);
                break;
        }
    }
    
    public expr(expr: AST.Expression) {
        let context = this._vm.createContext(this._context);
        
        return this._vm.runInContext(expr.content, context);
    }
    
    public outputAll(objects: Array<AST.Object>) {
        for (let n in objects) {
            this.output(objects[n]);
        }
    }
    
    public compile(source: string, context?: { [key: string]: string }): string {
        // Set context
        this._context = context || {};
        
        let lexer = new Lexer(),
            parser = new Parser(),
            tokens = lexer.lex(source),
            ast = parser.ast(tokens);
            
        this._output = "";
        this.output(ast);
        
        return this._output;
    }
}

export default Engine;