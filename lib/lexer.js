class TokenType {
    constructor(fullName) {
        this.lib = fullName.split(".")[0];
        this.name = fullName.split(".")[1];
    }
    get fullName() {
        return this.lib + "." + this.name;
    }
    is(expr) {
        if (expr.indexOf(".") === -1) {
            return expr === this.lib;
        }
        let params = expr.split(".");
        return params[0] === this.lib && params[1] === this.name;
    }
}
exports.TokenType = TokenType;
class Token {
}
exports.Token = Token;
class GrammarRule {
}
exports.GrammarRule = GrammarRule;
class Lexer {
    constructor() {
        this._states = new Array();
        this._grammar = new Array();
        this.tokens = new Array();
        // Import all grammar
        require("./grammar/razor").default(this);
    }
    get state() {
        return this._states[this._states.length - 1];
    }
    set state(value) {
        this._states.push(value);
    }
    rewindState() {
        this._states.pop();
    }
    register(regex, state, callback) {
        // Param fix
        if (typeof (state) !== "string") {
            callback = state;
            state = null;
        }
        let rule = new GrammarRule();
        rule.callback = callback;
        rule.state = state;
        rule.regex = regex;
        this._grammar.push(rule);
    }
    setVar(key, value) {
        this._vars[key] = value;
    }
    next() {
        for (let n in this._grammar) {
            let rule = this._grammar[n];
            // Skip the rule if the state doesn't match
            if (rule.state !== null && rule.state !== this.state) {
                continue;
            }
            // Check regex
            let matches;
            let reg = new RegExp("^" + rule.regex.source, rule.regex.flags);
            if ((matches = reg.exec(this.source)) !== null) {
                rule.callback(matches);
                return true;
            }
        }
        return false;
    }
    lex(source) {
        this.source = source;
        while (this.source.length > 0) {
            if (this.next()) {
                continue;
            }
            throw new Error("Infinite lexical loop at: `" + this.source[0] + "`");
        }
        return this.tokens;
    }
}
exports.Lexer = Lexer;
//# sourceMappingURL=lexer.js.map