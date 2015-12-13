var AST;
(function (AST) {
    class Object {
        constructor() {
            this.body = new Array();
        }
    }
    AST.Object = Object;
    class Function extends AST.Object {
        constructor(...args) {
            super(...args);
            this.lib = "global";
        }
    }
    AST.Function = Function;
    (function (IfType) {
        IfType[IfType["If"] = 1] = "If";
        IfType[IfType["ElseIf"] = 2] = "ElseIf";
        IfType[IfType["Else"] = 3] = "Else";
    })(AST.IfType || (AST.IfType = {}));
    var IfType = AST.IfType;
    ;
    class Expression extends AST.Object {
        constructor(content) {
            super();
            this.content = content;
        }
    }
    AST.Expression = Expression;
    (function (BracketType) {
        BracketType[BracketType["Open"] = 1] = "Open";
        BracketType[BracketType["Close"] = 2] = "Close";
    })(AST.BracketType || (AST.BracketType = {}));
    var BracketType = AST.BracketType;
    class Bracket extends AST.Object {
    }
    AST.Bracket = Bracket;
    class IfStatement extends AST.Object {
        constructor(type) {
            super();
            if (type) {
                this.type = type;
            }
        }
    }
    AST.IfStatement = IfStatement;
    class Raw extends AST.Object {
        constructor(content) {
            super();
            this.content = content;
        }
    }
    AST.Raw = Raw;
    class View extends AST.Object {
    }
    AST.View = View;
})(AST = exports.AST || (exports.AST = {}));
class Parser {
    constructor() {
        this._ast = new AST.View();
        this._current = this._ast;
        this.lineNumber = 1;
    }
    get current() {
        return this._current;
    }
    set current(cur) {
        cur.parent = this._current;
        this._current = cur;
    }
    ast(tokens) {
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
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map