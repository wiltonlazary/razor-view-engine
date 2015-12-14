export class TokenType {
    public lib: string;
    public name: string;
    
    public get fullName(): string {
        return this.lib + "." + this.name;
    }

    constructor(fullName: string) {
        this.lib = fullName.split(".")[0];
        this.name = fullName.split(".")[1];
    }
    
    public is(expr: string): boolean {
        if (expr.indexOf(".") === -1) {
            return expr === this.lib;
        }
        
        let params = expr.split(".");
        
        return params[0] === this.lib && params[1] === this.name;
    }
}

export class Token {
    public type: TokenType;
    public value: any;
}

interface LexerRegisterCallback {
    (matches: string[]);
}

export class GrammarRule {
    public state: string;
    public regex: RegExp;
    public callback: LexerRegisterCallback;
}

export class Lexer {
    public tokens: Array<Token>;
    public source: string;

    private _vars: { [key: string]: string };
    private _states: Array<string> = new Array<string>();
    private _grammar: Array<GrammarRule> = new Array<GrammarRule>();

    constructor() {
        this.tokens = new Array<Token>();

        // Import all grammar
        require("./grammar/razor").default(this);
    }

    public get state() {
        return this._states[this._states.length - 1];
    }

    public set state(value: string) {
        this._states.push(value);
    }

    public rewindState(): void {
        this._states.pop();
    }

    public register(regex: RegExp, callback: LexerRegisterCallback);
    public register(regex: RegExp, state: string, callback: LexerRegisterCallback);

    public register(regex: RegExp, state: LexerRegisterCallback|string, callback?: LexerRegisterCallback|string) {
        // Param fix
        if (typeof(state) !== "string") {
            callback = state;
            state = null;
        }

        let rule = new GrammarRule();

        rule.callback = callback as LexerRegisterCallback;
        rule.state = state as string;
        rule.regex = regex;

        this._grammar.push(rule);
    }

    public setVar(key: string, value: string) {
        this._vars[key] = value;
    }

    public next() {
        for (let n in this._grammar) {
            let rule = this._grammar[n];
            
            // Skip the rule if the state doesn't match
            if (rule.state !== null && rule.state !== this.state) {
                continue;
            }
            
            // Check regex
            let matches: string[];
            let reg = new RegExp("^" + rule.regex.source, rule.regex.flags);
            
            if ((matches = reg.exec(this.source)) !== null) {
                rule.callback(matches);
                
                return true;
            }
        }
        
        return false;
    }

    public lex(source: string): Array<Token> {
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