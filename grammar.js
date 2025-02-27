/**
 * @file Cabin grammar for tree-sitter
 * @author Violet
 * @license LGPL
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
	name: "cabin",

	rules: {
		source_file: $ => repeat($.statement),

		expression: $ => choice(
			$.binary,
			seq("(", $.expression, ")"),
			$.postfix,
			$.literal,
		),

		postfix: $ => prec.left(6, choice(
			$.function_call,
			seq($.expression, "?"),
			seq($.expression, "!"),
		)),

		function_call: $ => prec.left(5, choice(
			seq(
				field("callee", $.expression),
				"<", field("compile_time_arguments", list($.compile_time_argument)), ">",
				optional(seq("(", field("arguments", list($.expression)), ")"))
			),
			seq(
				field("callee", $.expression),
				seq("(", field("arguments", list($.expression)), ")")
			),
		)),

		binary: $ => choice(
			prec.left(5, seq(field("left", $.expression), field("operator", "."), field("right", $.identifier))),
			prec.right(4, seq(field("left", $.expression), "^", field("right", $.expression))),
			prec.left(3, seq(field("left", $.expression), choice("*", "/"), field("right", $.expression))),
			prec.left(2, seq(field("left", $.expression), choice("+", "-"), field("right", $.expression))),
			prec.left(1, seq(field("left", $.expression), choice("==", "!=", "<=", ">=", "< ", " >"), field("right", $.expression)))
		),

		literal: $ => choice(
			$.function,
			$.string,
			$.number,
			$.list,
			$.group,
			$.either,
			$.object_constructor,
			$.extend,
			$.choice,
			$.identifier,
		),

		object_constructor: $ => seq(
			"new",
			field("type", $.identifier),
			"{",
			list($.object_value),
			"}"
		),

		object_value: $ => seq(
			optional(field("tags", $.tag)),
			field("name", $.identifier),
			"=",
			field("value", $.expression)
		),

		extend: $ => seq(
			"extensionof",
			optional(seq("<", field("compile_time_parameters", list($.group_parameter)), ">")),
			field("target", $.expression),
			optional(seq("tobe", field("tobe", $.expression))),
			"{",
			list($.object_value),
			"}"
		),

		block: $ => seq("{", repeat($.statement), "}"),
		list: $ => seq("[", list($.expression), "]"),
		tag: $ => seq("#", "[", list($.expression), "]"),

		group: $ => seq(
			"group",
			optional(field("compile_time_parameters", seq("<", list($.group_parameter), ">"))),
			"{",
			field("fields", list($.group_field)),
			"}"
		),

		group_parameter: $ => seq(
			field("name", $.identifier),
			optional(seq(":", field("type", $.expression)))
		),

		group_field: $ => seq(
			optional(field("tags", $.tag)),
			field("name", $.identifier),
			optional(seq(":", field("type", $.expression))),
			optional(seq("=", field("value", $.expression))),
		),

		either: $ => seq(
			"either",
			"{",
			field("variants", list($.either_variant)),
			"}"
		),

		choice: $ => seq(
			"choice",
			optional(seq("<", field("compile_time_parameters", list($.group_parameter)), ">")),
			"{",
			field("choices", list($.choice_variant)),
			"}"
		),

		choice_variant: $ => $.expression,
		either_variant: $ => $.identifier,

		function: $ => prec.left(seq(
			"action",
			optional(field("compile_time_parameters", seq("<", list($.group_parameter), ">"))),
			optional(field("parameters", seq("(", list($.parameter), ")"))),
			seq(":", field("return_type", $.expression)),
			optional(field("body", $.block))
		)),

		statement: $ => seq(choice(
			$.declaration,
			$.goto,
			$.expression,
		), ";"),

		declaration: $ => seq(
			optional(field("tags", $.tag)),
			"let",
			field("name", $.identifier),
			"=",
			field("value", $.expression)
		),

		goto: $ => seq(
			field("label", $.identifier),
			"is",
			choice(
				"done",
				field("value", $.expression),
			),
		),

		// Tokens

		identifier: _$ => /[a-zA-Z_]\w*/,
		string: _$ => /"[^"]*"/,
		number: _$ => /-?\d+(\.\d+)?/,

		// Utilities

		parameter: $ => seq(
			field("name", $.identifier),
			":",
			field("type", $.expression),
		),

		compile_time_argument: $ => $.expression,

		// Extra

		comment: _$ => seq('# ', /[^\r\n\u2028\u2029]*/),

	},

	extras: $ => [
		$.comment,
		/[\s\p{Zs}\uFEFF\u2028\u2029\u2060\u200B]/u, // whitespace
	],
});

/**
 * A comma separated, possibly empty list, allowing trailing commas.
 *
 * @param {RuleOrLiteral} rule
 */
function list(rule) {
	return optional(seq(rule, repeat(seq(",", rule)), optional(",")));
}
