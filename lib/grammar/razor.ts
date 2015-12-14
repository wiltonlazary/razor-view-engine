import { Lexer, Token, TokenType } from "../lexer";

export default (lexer: Lexer) => {
    /**
     * Escaped `@` symbol
     */
    lexer.register(/\@\@/, (matches) => {
        lexer.source = lexer.source.substr(matches[0].length);
        
        let token: Token = {
            type: new TokenType("raw.char"),
            value: "@"
        };
        
        lexer.tokens.push(token);
    });
    
    /**
     * Add support for strings in a statement
     */
    lexer.register(/(['"])/, "statement", (matches) => {
        lexer.source = lexer.source.substr(matches[0].length);
        
        let token = lexer.tokens[lexer.tokens.length - 1];
        
        if (!token || !token.type.is("expr.body")) {
            token = new Token();
            token.type = new TokenType("expr.body");
            token.value = "";
            
            lexer.tokens.push(token);
        }
        
        token.value += matches[1];
        
        // Create string and add it to the expression
        for (var i = 0; i < lexer.source.length; i++) {
            // Escaped character
            if (lexer.source[i] === "\\" && (lexer.source[i + 1] === "'" || lexer.source[i + 1] === "\"")) {
                i++;
                token.value += lexer.source[i];
            } else if (lexer.source[i] === matches[1]) {
                token.value += matches[1];
                break;
            } else {
                token.value += lexer.source[i];
            }
        }
        
        lexer.source = lexer.source.substr(i + 1);
    });
    
    /**
     * Simple expression
     */
    lexer.register(/([^\}'"]+)[ ]*/m, "statement", (matches) => {
        lexer.source = lexer.source.substr(matches[0].length);
        
        let token = lexer.tokens[lexer.tokens.length - 1];
        
        if (!token || !token.type.is("expr.body")) {
            token = new Token();
            token.type = new TokenType("expr.body");
            token.value = "";
            
            lexer.tokens.push(token);
        }
        
        token.value += matches[1];
    });
    
    /**
     * Start an if statement
     */
    lexer.register(/\@if[ ]+/, (matches) => {
        lexer.source = lexer.source.substr(matches[0].length);
        lexer.state = "if_start";
        
        let token: Token = {
            type: new TokenType("statement.if"),
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
        
        let token_expr: Token = {
            type: new TokenType("expr.body"),
            value: matches[1]
        };
        
        let token_bracket: Token = {
            type: new TokenType("bracket.open"),
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
        
        let token: Token = {
            type: new TokenType("bracket.close"),
            value: null
        };
        
        lexer.tokens.push(token);
    });
    
    /**
     * Start an elseif statement
     */
    lexer.register(/else if[ ]+/, "if_start", (matches) => {
        lexer.source = lexer.source.substr(matches[0].length);
        lexer.state = "if_start";
        
        let token: Token = {
            type: new TokenType("statement.elseif"),
            value: null
        };
        
        lexer.tokens.push(token);
    });
    
    /**
     * Start an else statement
     */
    lexer.register(/else[ ]+\{/, "if_start", (matches) => {
        lexer.source = lexer.source.substr(matches[0].length);
        lexer.state = "if_body";
        
        let token_else: Token = {
            type: new TokenType("statement.else"),
            value: null
        };
        
        lexer.tokens.push(token_else);
        
        let token_bracket: Token = {
            type: new TokenType("bracket.open"),
            value: null
        };
        
        lexer.tokens.push(token_bracket);
    });
    
    /**
     * Start a statement
     */
    lexer.register(/\@\{[ ]*/m, (matches) => {
        lexer.source = lexer.source.substr(matches[0].length);
        lexer.state = "statement";
        
        let token: Token = {
            type: new TokenType("statement.start"),
            value: null
        };
        
        lexer.tokens.push(token);
    });
    
    /**
     * Write text
     */
    lexer.register(/\@([^< >]+)/, (matches) => {
        lexer.source = lexer.source.substr(matches[0].length);
        
        let token: Token = {
            type: new TokenType("fn.echo"),
            value: matches[1]
        };
        
        lexer.tokens.push(token);
    });
    
    /**
     * End a statement
     */
    lexer.register(/\}[ ]*/m, "statement", (matches) => {
        lexer.source = lexer.source.substr(matches[0].length);
        lexer.rewindState();
        
        let token: Token = {
            type: new TokenType("statement.end"),
            value: null
        };
        
        lexer.tokens.push(token);
    });
    
    /**
     * Everything else
     */
    lexer.register(/([\w]+)/m, (matches) => {
        lexer.source = lexer.source.substr(matches[0].length);
        
        let token: Token = {
            type: new TokenType("raw.string"),
            value: matches[1]
        };
        
        lexer.tokens.push(token);
    });
    
    lexer.register(/([\S\s]{1})/m, (matches) => {
        lexer.source = lexer.source.substr(matches[0].length);
        
        let token: Token = {
            type: new TokenType("raw.char"),
            value: matches[1]
        };
        
        lexer.tokens.push(token);
    });
};