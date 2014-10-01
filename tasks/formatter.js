/* jshint node:true, undef:true, unused:true */

var recast = require('recast');
var types = recast.types;
var b = types.builders;
var n = types.namedTypes;

var Replacement = require("es6-module-transpiler/lib/replacement");
var utils = require("./utils");
var IFFE = utils.IFFE;
var sort = require("es6-module-transpiler/lib/sorting").sort;


/**
 * The 'bundle' formatter aims to increase the compressibility of the generated
 * source, especially by tools such as Google Closure Compiler or UglifyJS.
 * For example, given these modules:
 *
 *   // a.js
 *   import { b } from './b';
 *   console.log(b);
 *
 *   // b.js
 *   export var b = 3;
 *   export var b2 = 6;
 *
 * The final output will be a single file looking something like this:
 *
 *   (function() {
 *     "use strict";
 *     // b.js
 *     var b$$b = 3;
 *     var b$$b2 = 6;
 *
 *     // a.js
 *     console.log(b$$b);
 *   }).call(this);
 *
 * @constructor
 */
function BundleFormatter() {}

/**
 * This hook is called by the container before it converts its modules. We use
 * it to ensure all of the imports are included because we need to know about
 * them at compile time.
 *
 * @param {Container} container
 */
BundleFormatter.prototype.beforeConvert = function(container) {
    container.findImportedModules();
};

/**
 * Returns an expression which globally references the export named by
 * `identifier` for the given module `mod`.
 *
 * @param {Module} mod
 * @param {ast-types.Identifier|string} identifier
 * @return {ast-types.MemberExpression}
 */
BundleFormatter.prototype.reference = function(/* mod, identifier */) {
    throw new Error('#reference must be implemented in subclasses');
};

/**
 * Process a variable declaration found at the top level of the module. We need
 * to ensure that exported variables are rewritten appropriately, so we may
 * need to rewrite some or all of this variable declaration. For example:
 *
 *   var a = 1, b, c = 3;
 *   ...
 *   export { a, b };
 *
 * We turn those being exported into assignments as needed, e.g.
 *
 *   var c = 3;
 *   mod$$a = 1;
 *
 * @param {Module} mod
 * @param {ast-types.NodePath} nodePath
 * @return {?Replacement}
 */
BundleFormatter.prototype.processVariableDeclaration = function(mod, nodePath) {
    var self = this;
    return Replacement.map(
        nodePath.get('declarations'),
        function(declaratorPath) {
            return Replacement.swaps(
                declaratorPath.get('id'),
                self.reference(mod, declaratorPath.get('id').node)
            );
        }
    );
};

/**
 * Rename the top-level function declaration to a unique name.
 *
 *   function foo() {}
 *
 * Becomes e.g.
 *
 *   function mod$$foo() {}
 *
 * @param {Module} mod
 * @param {ast-types.NodePath} nodePath
 * @return {?Replacement}
 */
BundleFormatter.prototype.processFunctionDeclaration = function(mod, nodePath) {
    return Replacement.swaps(
        nodePath.get('id'),
        this.reference(mod, nodePath.node.id)
    );
};

/**
 * Replaces non-default exports. Exported bindings do not need to be
 * replaced with actual statements since they only control how local references
 * are renamed within the module.
 *
 * @param {Module} mod
 * @param {ast-types.NodePath} nodePath
 * @return {?Replacement}
 */
BundleFormatter.prototype.processExportDeclaration = function(mod, nodePath) {
    var node = nodePath.node;
    if (n.FunctionDeclaration.check(node.declaration)) {
        return Replacement.swaps(
            // drop `export`
            nodePath, node.declaration
        ).and(
            // transform the function
            this.processFunctionDeclaration(mod, nodePath.get('declaration'))
        );
    } else if (n.VariableDeclaration.check(node.declaration)) {
        return Replacement.swaps(
            // drop `export`
            nodePath, node.declaration
        ).and(
            // transform the variables
            this.processVariableDeclaration(mod, nodePath.get('declaration'))
        );
    } else if (node.declaration) {
        throw new Error(
            'unexpected export style, found a declaration of type: ' +
            node.declaration.type
        );
    } else {
        /**
         * This node looks like this:
         *
         *   export { foo, bar };
         *
         * Which means that it has no value in the generated code as its only
         * function is to control how imports are rewritten.
         */
        return Replacement.removes(nodePath);
    }
};

/**
 * Since import declarations only control how we rewrite references we can just
 * remove them -- they don't turn into any actual statements.
 *
 * @param {Module} mod
 * @param {ast-types.NodePath} nodePath
 * @return {?Replacement}
 */
BundleFormatter.prototype.processImportDeclaration = function(mod, nodePath) {
    return Replacement.removes(nodePath);
};

/**
 * Since named export reassignment is just a local variable, we can ignore it.
 * e.g.
 *
 * export var foo = 1;
 * foo = 2;
 *
 * @param {Module} mod
 * @param {ast-types.NodePath} nodePath
 * @return {?Replacement}
 */
BundleFormatter.prototype.processExportReassignment = function (mod, nodePath) {
    return null;
};

/**
 * Get a reference to the original exported value referenced in `mod` at
 * `referencePath`. If the given reference path does not correspond to an
 * export, we do not need to rewrite the reference. For example, since `value`
 * is not exported it does not need to be rewritten:
 *
 *   // a.js
 *   var value = 99;
 *   console.log(value);
 *
 * If `value` was exported then we would need to rewrite it:
 *
 *   // a.js
 *   export var value = 3;
 *   console.log(value);
 *
 * In this case we re-write both `value` references to something like
 * `a$$value`. The tricky part happens when we re-export an imported binding:
 *
 *   // a.js
 *   export var value = 11;
 *
 *   // b.js
 *   import { value } from './a';
 *   export { value };
 *
 *   // c.js
 *   import { value } from './b';
 *   console.log(value);
 *
 * The `value` reference in a.js will be rewritten as something like `a$$value`
 * as expected. The `value` reference in c.js will not be rewritten as
 * `b$$value` despite the fact that it is imported from b.js. This is because
 * we must follow the binding through to its import from a.js. Thus, our
 * `value` references will both be rewritten to `a$$value` to ensure they
 * match.
 *
 * @param {Module} mod
 * @param {ast-types.NodePath} referencePath
 * @return {ast-types.Expression}
 */
BundleFormatter.prototype.exportedReference = function(mod, referencePath) {
    var specifier = mod.exports.findSpecifierForReference(referencePath);
    if (specifier) {
        specifier = specifier.terminalExportSpecifier;
        return this.reference(specifier.module, specifier.name);
    } else {
        return null;
    }
};

/**
 * Get a reference to the original exported value referenced in `mod` at
 * `referencePath`. This is very similar to {#exportedReference} in its
 * approach.
 *
 * @param {Module} mod
 * @param {ast-types.NodePath} referencePath
 * @return {ast-types.Expression}
 * @see {#exportedReference}
 */
BundleFormatter.prototype.importedReference = function(mod, referencePath) {
    var specifier = mod.imports.findSpecifierForReference(referencePath);
    if (specifier) {
        specifier = specifier.terminalExportSpecifier;
        return this.reference(specifier.module, specifier.name);
    } else {
        return null;
    }
};

/**
 * If the given reference has a local declaration at the top-level then we must
 * rewrite that reference to have a module-scoped name.
 *
 * @param {Module} mod
 * @param {ast-types.NodePath} referencePath
 * @returns {?ast-types.Node}
 */
BundleFormatter.prototype.localReference = function(mod, referencePath) {
    var scope = referencePath.scope.lookup(referencePath.node.name);
    if (scope && scope.isGlobal) {
        return this.reference(mod, referencePath.node);
    } else {
        return null;
    }
};

/**
 * Convert a list of ordered modules into a list of files.
 *
 * @param {Array.<Module>} modules Modules in execution order.
 * @return {Array.<ast-types.File}
 */
BundleFormatter.prototype.build = function(modules) {
    modules = sort(modules);
    return [b.file(b.program([b.expressionStatement(IFFE(
        b.expressionStatement(b.literal('use strict')),
        modules.length === 1 ?
            modules[0].ast.program.body :
            modules.reduce(function(statements, mod) {
                return statements.concat(mod.ast.program.body);
            }, [])
    ))]))];
};

/**
 * @param {Module} mod
 * @param {ast-types.Expression} declaration
 * @return {ast-types.Statement}
 */
BundleFormatter.prototype.defaultExport = function(mod, declaration) {
    return b.variableDeclaration(
        'var',
        [b.variableDeclarator(
            this.reference(mod, 'default'),
            declaration
        )]
    );
};

/**
 * Returns an expression which globally references the export named by
 * `identifier` for the given module `mod`. For example:
 *
 *   // rsvp/defer.js, export default
 *   rsvp$defer$$default
 *
 *   // rsvp/utils.js, export function isFunction
 *   rsvp$utils$$isFunction
 *
 * @param {Module} mod
 * @param {ast-types.Identifier|string} identifier
 * @return {ast-types.Identifier}
 */
BundleFormatter.prototype.reference = function(mod, identifier) {
    return b.identifier(
        mod.id + (n.Identifier.check(identifier) ? identifier.name : identifier)
    );
};

module.exports = BundleFormatter;
