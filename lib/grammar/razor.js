var lexer_1 = require("../lexer");
exports.default = (lexer) => {
    /**
     * Escaped `@` symbol
     */
    lexer.register(/\@\@/, (matches) => {
        lexer.source = lexer.source.substr(matches[0].length);
        let token = {
            type: new lexer_1.TokenType("raw.char"),
            value: "@"
        };
        lexer.tokens.push(token);
    });
    /**
     * Start an if statement
     */
    lexer.register(/\@if[ ]+/, (matches) => {
        lexer.source = lexer.source.substr(matches[0].length);
        lexer.state = "if_start";
        let token = {
            type: new lexer_1.TokenType("statement.if"),
            value: null
        };
        lexer.tokens.push(token);
    });
    /**
     * If/else/elseif expr
     */
    lexer.register(/\(([^\}]+)\)[ ]*\{/, "if_start", (matches) => {
        lexer.source = lexer.source.substr(matches[0].length);
        lexer.state = "if_body";
        let token_expr = {
            type: new lexer_1.TokenType("expr.body"),
            value: matches[1]
        };
        let token_bracket = {
            type: new lexer_1.TokenType("bracket.open"),
            value: null
        };
        lexer.tokens.push(token_expr);
        lexer.tokens.push(token_bracket);
    });
    /**
     * End an if-body statement
     */
    lexer.register(/\}/, "if_body", (matches) => {
        lexer.source = lexer.source.substr(matches[0].length);
        lexer.rewindState();
        let token = {
            type: new lexer_1.TokenType("bracket.close"),
            value: null
        };
        lexer.tokens.push(token);
    });
    /**
     * Start an else statement
     */
    lexer.register(/else[ ]*\{/, "if_start", (matches) => {
        lexer.source = lexer.source.substr(matches[0].length);
        lexer.state = "if_body";
        let token_else = {
            type: new lexer_1.TokenType("statement.else"),
            value: null
        };
        lexer.tokens.push(token_else);
        let token_bracket = {
            type: new lexer_1.TokenType("bracket.open"),
            value: null
        };
        lexer.tokens.push(token_bracket);
    });
    /**
     * End an if statement
     */
    // lexer.register(/\}/, "if_start", (matches) => {
    //     lexer.source = lexer.source.substr(matches[0].length);
    //     lexer.rewindState();
    //     let token: Token = {
    //         type: new TokenType("bracket.close"),
    //         value: null
    //     };
    //     lexer.tokens.push(token);
    // });
    /**
     * Write text
     */
    lexer.register(/\@([^< >]+)/, (matches) => {
        lexer.source = lexer.source.substr(matches[0].length);
        let token = {
            type: new lexer_1.TokenType("fn.echo"),
            value: matches[1]
        };
        lexer.tokens.push(token);
    });
    /**
     * Everything else
     */
    lexer.register(/([\w]+)/m, (matches) => {
        lexer.source = lexer.source.substr(matches[0].length);
        let token = {
            type: new lexer_1.TokenType("raw.string"),
            value: matches[1]
        };
        lexer.tokens.push(token);
    });
    lexer.register(/([\S\s]{1})/m, (matches) => {
        lexer.source = lexer.source.substr(matches[0].length);
        let token = {
            type: new lexer_1.TokenType("raw.char"),
            value: matches[1]
        };
        lexer.tokens.push(token);
    });
};
//# sourceMappingURL=razor.js.map