/* description: Parses end executes mathematical expressions. */

/* lexical grammar */
%lex

%x directive
%x command

%%

"#" {this.begin('directive');}
.   /* do nothing */

<*>\s+                   /* skip whitespace */
<directive>"contract"           {this.begin('command'); return 'CONTRACT';}
<directive>"example"            {this.begin('command'); return 'EXAMPLE';}
<command>[\+\-]?[0-9]*("."[0-9]+)("e"[\+\-]?[0-9]+)?\b  return 'FLOAT'
<command>[\+\-]?[0-9]+("e"[\+\-]?[0-9]+)\b  return 'FLOAT'
<command>[\+\-]?[0-9]+\b       return 'INTEGER'
<command>\"((\\.)|[^"])*\"     return 'STRING'
<command>\'((\\.)|[^'])*\'     return 'STRING'
<command>"if"                  return 'IF'
<command>"then"                return 'THEN'
<command>"else"                return 'ELSE'
<command>"and"                 return 'AND'
<command>"or"                  return 'OR'
<command>"not"                 return 'NOT'
<command>"is"                  return 'VERB'
<command>"are"                 return 'VERB'
<command>"in"                  return 'VERB'
<command>"pass"                return 'PASS'
<command>"fail"                return 'FAIL'
<command>[a-zA-Z_][a-zA-Z0-9_]* return 'ID'
<command>":"                   return ":"
<command>","                   return ","
<command>";"                   return ";"
<command>"("                   return '('
<command>")"                   return ')'
<command><<EOF>>               return 'EOF'
<command>.                     return 'INVALID'

/lex

/* operator associations and precedence */

%left ';'
%left OR
%left AND
%left NOT

%start directives

%% /* language grammar */

directives
    : CONTRACT ":" clause EOF
        {return {type: "contract", clause: $3};}
    | CONTRACT ":" ite EOF
        {return {type: "contract", clause: $3};}
    ;

ite
    : IF clause THEN clause ELSE clause
        {$$ = {type: "ite", cond: $2, true: $4, false: $6};}
    ;

clause
    : clause ";" clause
        {$$ = {type: "compound", operand1: $1, operand2: $3};}
    | subjects VERB descriptor
        {$$ = {type: "clause", subjects: $1, verb: $2, descriptor: $3};}
    | PASS
        {$$ = {type: "pass-lit"};}
    | FAIL
        {$$ = {type: "fail-lit"};}
    | '(' clause ')'
        {$$ = $2;}
    ;

subjects
    : subjects "," subject
        {$$ = $1.concat([$3]);}
    | subject
        {$$ = [$1];}
    ;

subject
    : ID ID
        {$$ = {type: "subject", qualifier: $1, name: $2};}
    | ID
        {$$ = {type: "subject", qualifier: null, name: $1};}
    ;

descriptor
    : descriptor AND descriptor
        {$$ = {type: "and", operand1: $1, operand2: $3};}
    | descriptor OR descriptor
        {$$ = {type: "or", operand1: $1, operand2: $3};}
    | NOT descriptor
        {$$ = {type: "not", operand1: $2};}
    | ID
        {$$ = {type: "adjective", name: $1};}
    | INTEGER
        {$$ = {type: "int-lit", value: parseInt($1)};}
    | FLOAT
        {$$ = {type: "float-lit", value: parseFloat($1)};}
    | STRING
        {$$ = {type: "string-lit", value: $1.slice(1,-1)};}
    | '(' descriptor ')'
        {$$ = $2;}
    ;
