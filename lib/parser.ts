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
    
    export class IfContainer extends AST.Object {
        public active: boolean = true;
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
    
    public isWhitespace(obj: AST.Object): boolean {
        if (!(obj instanceof AST.Raw)) {
            return false;
        }
        
        let raw = obj as AST.Raw;
        
        return raw.content.length === 1 && [
            "\t",
            "\n",
            "\r",
            " "
        ].indexOf(raw.content) > -1;
    }
    
    public ast(tokens: Token[]): AST.Object {   
        /**
         * AST token loop
         * 
         **/     
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
                    
                case "statement.else":
                    let _else = new AST.IfStatement(AST.IfType.Else);
                    
                    tokens.shift(); // The ELSE statement
                    
                    if (!tokens[0].type.is("bracket.open")) {
                        throw new Error("Expecting an opening bracket to start the else-statement on line: " + this.lineNumber);
                    }
                    
                    tokens.shift(); // Opening bracket
                    
                    this.current = _else;
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
        
        /**
         * Combine multiple if/elseif/else statements in one container (for easier parsing)
         */
        let ifBlocks = new Array<AST.IfStatement>();

        for (let i = 0; i < this._ast.body.length; i++) {
            let _if = this._ast.body[i] as AST.IfStatement;
            
            if (this._ast.body[i] instanceof AST.IfStatement && 
                    ( 
                        ifBlocks.length === 0 ||
                        (
                            ifBlocks.length > 0 &&
                            (
                                ( _if.type === AST.IfType.ElseIf && ifBlocks[ifBlocks.length - 1].type === AST.IfType.If ) ||
                                ( _if.type === AST.IfType.ElseIf && ifBlocks[ifBlocks.length - 1].type === AST.IfType.ElseIf ) ||
                                ( _if.type === AST.IfType.Else && ifBlocks[ifBlocks.length - 1].type === AST.IfType.If ) ||
                                ( _if.type === AST.IfType.Else && ifBlocks[ifBlocks.length - 1].type === AST.IfType.ElseIf )
                            )
                        )
                    )
                ) {
                ifBlocks.push(this._ast.body.splice(i, 1)[0] as AST.IfStatement);
            } else if (!this.isWhitespace(this._ast.body[i]) && ifBlocks.length > 0) {
                let container = new AST.IfContainer();
                
                container.body = ifBlocks.slice(0);
                
                this._ast.body.splice(i, 0, container);
                
                ifBlocks.length = 0;
            }
        }
        
        return this._ast;
    }
}