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
    class IfContainer extends AST.Object {
        constructor(...args) {
            super(...args);
            this.active = true;
        }
    }
    AST.IfContainer = IfContainer;
    class Statement extends AST.Object {
    }
    AST.Statement = Statement;
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
    isWhitespace(obj) {
        if (!(obj instanceof AST.Raw)) {
            return false;
        }
        let raw = obj;
        return raw.content.length === 1 && [
            "\t",
            "\n",
            "\r",
            " "
        ].indexOf(raw.content) > -1;
    }
    ast(tokens) {
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
                case "statement.start":
                    let st = new AST.Statement();
                    tokens.shift(); // The statement start
                    if (!tokens[0].type.is("expr.body")) {
                        throw new Error("Expecting an expression in the code-statement on line: " + this.lineNumber);
                    }
                    st.expr = new AST.Expression(tokens.shift().value);
                    if (!tokens[0].type.is("statement.end")) {
                        throw new Error("Expecting a statement-end on line: " + this.lineNumber);
                    }
                    tokens.shift(); // Statement end
                    this.current.body.push(st);
                    break;
                case "statement.if":
                case "statement.elseif":
                    let _if = new AST.IfStatement(tokens[0].type.name === "if" ? AST.IfType.If : AST.IfType.ElseIf);
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
        let ifBlocks = new Array();
        for (let i = 0; i < this._ast.body.length; i++) {
            let _if = this._ast.body[i];
            if (this._ast.body[i] instanceof AST.IfStatement &&
                (ifBlocks.length === 0 ||
                    (ifBlocks.length > 0 &&
                        ((_if.type === AST.IfType.ElseIf && ifBlocks[ifBlocks.length - 1].type === AST.IfType.If) ||
                            (_if.type === AST.IfType.ElseIf && ifBlocks[ifBlocks.length - 1].type === AST.IfType.ElseIf) ||
                            (_if.type === AST.IfType.Else && ifBlocks[ifBlocks.length - 1].type === AST.IfType.If) ||
                            (_if.type === AST.IfType.Else && ifBlocks[ifBlocks.length - 1].type === AST.IfType.ElseIf))))) {
                ifBlocks.push(this._ast.body.splice(i, 1)[0]);
            }
            else if (!this.isWhitespace(this._ast.body[i]) && ifBlocks.length > 0) {
                let container = new AST.IfContainer();
                container.body = ifBlocks.slice(0);
                this._ast.body.splice(i, 0, container);
                ifBlocks.length = 0;
            }
        }
        return this._ast;
    }
}
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map