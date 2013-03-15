var esprima = require('esprima');
var escodegen = require('escodegen');
var estraverse = require('estraverse');

var DEFAULT_ES_OPTIONS = {
    loc: true,
    range: true,
    comment: true
};

exports.instrument = function (script, options) {
    var isSource = typeof script === "string";
    var ast = isSource ? esprima.parse(script, DEFAULT_ES_OPTIONS) : script;
    var walker = new InstrumentingASTWalker(options);
    var inst_ast = estraverse.replace(ast, walker);
    return isSource ? escodegen.generate(inst_ast) : inst_ast;
};

function InstrumentingASTWalker(options) {
    this.options = options;
}


InstrumentingASTWalker.prototype.enter = function (node) {
    if (node) {
        var f = this["enter" + node.type];
        if (f) {
            return f.call(this, node);
        }
    }

    return node;
};

InstrumentingASTWalker.prototype.leave = function (node) {
    if (node) {
        var f = this["exit" + node.type];
        if (f) {
            return f.call(this, node);
        }
    }

    return node;
};

InstrumentingASTWalker.prototype.instrumentFunctionBody = function (node) {
    var fn = functionName(node);
    if (this.shouldInstrument("methodEntry")) {
        this.injectEntryCall(node.body, fn, node.loc);
    }

    if (this.shouldInstrument("methodExit")) {
        this.injectExitCall(node.body, fn, node.loc);
    }
    return node;
};

InstrumentingASTWalker.prototype.exitFunctionDeclaration = function (node) {
    return this.instrumentFunctionBody(node);
};

InstrumentingASTWalker.prototype.exitFunctionExpression = function (node) {
    return this.instrumentFunctionBody(node);
};

InstrumentingASTWalker.prototype.instrumentFunctionBody = function (node) {
    node.body = {
        type: "BlockStatement",
        body: [
            {
                "type": "TryStatement",
                "block": node.body,
                "handlers": [],
                "finalizer": {
                    "type": "BlockStatement",
                    "body": []
                }
            }
        ]
    };
    return node;
};