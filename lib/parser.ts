import { Token } from "./lexer";

export namespace AST {
    export abstract class Object {
        public body: Array<AST.Object> = new Array<AST.Object>();
        public parent: AST.Object;
    }
    
    export class Function extends AST.Object {
        public name: string;
        public lib: string = "global";
        public expr: AST.Expression;
    }
    
    export enum IfType {
       If = 1,
       ElseIf = 2,
       Else = 3
    };
    
    export class Expression extends AST.Object {
        public content: string;
        
        constructor(content?: string) {
            super();
            
            this.content = content;
        }
    }
    
    export enum BracketType {
        Open = 1,
        Close = 2
    }
    
    export class Bracket extends AST.Object {
        public type: AST.BracketType;
    }
    
    export class IfStatement extends AST.Object {
        public type: AST.IfType;
        public expr: AST.Expression;
        
        constructor(type?: AST.IfType) {
            super();
            
            if (type) {
                this.type = type;
            }
        }
    }
    
    export class Raw extends AST.Object {
        public content: string;
        
        constructor(content?: string) {
            super();
            
            this.content = content;
        }
    }
    
    export class View extends AST.Object {
        
    }
}

export class Parser {
    private _ast: AST.Object = new AST.View();
    
    private _current: AST.Object = this._ast;
    public lineNumber: number = 1;
    
    public get current(): AST.Object {
        return this._current;
    }
    
    public set current(cur: AST.Object) {
        cur.parent = this._current;
        
        this._current = cur;
    }
    
    public ast(tokens: Token[]): AST.Object {
        while (tokens.length > 0) {
            switch (tokens[0].type.fullName) {
                case "raw.char":
                case "raw.string":
                    if (tokens[0].type.is("raw.char") && tokens[0].value === "\n") {
                        this.lineNumber++;
                    }
                
                    this.current.body.push(new AST.Raw(tokens.shift().value));
                    break;
                    
                case "statement.if":
                    let _if = new AST.IfStatement(AST.IfType.If);
                    
                    tokens.shift(); // The IF statement
                    
                    if (!tokens[0].type.is("expr.body")) {
                        throw new Error("Expecting an expression in the if-statement on line: " + this.lineNumber);
                    }
                    
                    _if.expr = new AST.Expression(tokens.shift().value);
                    
                    if (!tokens[0].type.is("bracket.open")) {
                        throw new Error("Expecting an opening bracket to start the if-statement on line: " + this.lineNumber);
                    }
                    
                    tokens.shift(); // Opening bracket
                    
                    this.current = _if;
                    break;
                    
                case "fn.echo":
                    let fn = new AST.Function();
                    
                    fn.name = "echo";
                    fn.expr = new AST.Expression(tokens.shift().value);
                    
                    this.current.body.push(fn);
                    break;
                
                case "bracket.close":
                    tokens.shift(); // Bracket close
                    
                    let cur = this.current;
                    
                    this.current = this.current.parent;
                    this.current.body.push(cur);
                    break;
                    
                default:
                    throw new Error("Unknown token type: " + tokens[0].type.fullName + " on line: " + this.lineNumber);
            }
        }
        
        return this._ast;
    }
}