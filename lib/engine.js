///<reference path="../typings/node/node.d.ts"/>
///<reference path="../typings/node/vm.d.ts"/>
var lexer_1 = require("./lexer");
var parser_1 = require("./parser");
class EngineSettings {
    constructor() {
        this.minifyHtml = false;
    }
    static getDefault() {
        return new EngineSettings();
    }
}
class Engine {
    constructor(settings) {
        this._vm = require("vm");
        this._context = {};
        settings = settings || EngineSettings.getDefault();
    }
    output(obj) {
        if (obj instanceof parser_1.AST.View) {
            this.outputAll(obj.body);
        }
        else if (obj instanceof parser_1.AST.Function) {
            this.exec(obj);
        }
        else if (obj instanceof parser_1.AST.IfContainer) {
            this.outputIf(obj);
        }
        else if (obj instanceof parser_1.AST.Raw) {
            this._output += obj.content;
        }
    }
    outputIf(container) {
        for (let i = 0; container.active && i < container.body.length; i++) {
            let _if = container.body[i];
            switch (_if.type) {
                case parser_1.AST.IfType.If:
                case parser_1.AST.IfType.ElseIf:
                    let isTrue = this.expr(_if.expr);
                    if (typeof (isTrue) !== "boolean") {
                        throw new Error("Expecting a boolean as if/elseif-expression on line: unknown");
                    }
                    if (isTrue) {
                        this.outputAll(_if.body);
                        container.active = false;
                    }
                    break;
                case parser_1.AST.IfType.Else:
                    this.outputAll(_if.body);
                    container.active = false;
                    break;
            }
        }
    }
    exec(fn) {
        switch (fn.lib + "." + fn.name) {
            case "global.echo":
                this._output += this.expr(fn.expr);
                break;
        }
    }
    expr(expr) {
        let context = this._vm.createContext(this._context);
        return this._vm.runInContext(expr.content, context);
    }
    outputAll(objects) {
        for (let n in objects) {
            this.output(objects[n]);
        }
    }
    compile(source, context) {
        // Set context
        this._context = context || {};
        let lexer = new lexer_1.Lexer(), parser = new parser_1.Parser(), tokens = lexer.lex(source), ast = parser.ast(tokens);
        this._output = "";
        this.output(ast);
        return this._output;
    }
}
exports.default = Engine;
//# sourceMappingURL=engine.js.map