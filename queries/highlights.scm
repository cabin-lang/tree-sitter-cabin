; Keywords
(declaration ["let"] @keyword)
(group ["group"] @keyword)
(either ["either"] @keyword)
(function ["action"] @keyword.function)
(object_constructor ["new"] @keyword)
(extend ["extend" "tobe"] @keyword)
(default_extend ["default"] @keyword)
(goto ["is"] @keyword)
(choice ["choice"] @keyword)

; Semantics
(group_parameter name: (identifier) @type)
(group_parameter type: (expression (literal (identifier))) @type)
(extend target: (expression (literal (identifier))) @type)
(extend tobe: (expression (literal (identifier))) @type )
(function return_type: (expression (literal (identifier))) @type)
(function_call callee: (expression (literal (identifier))) @function.call)
(function_call
	callee: (expression (binary operator: "." right: (identifier) @function.call))
	(#set! "priority" 110)
)
(binary operator: "." right: (identifier) @variable.member)
(parameter
	name: (identifier) @variable.parameter
	type: (expression (literal (identifier))) @type
)
(group_field name: (identifier) @variable.member)
(group_field type: (expression (literal (identifier))) @type)
(group_field
	name: (identifier) @function
	value: (expression (literal (function)))
)
(group_field
	name: (identifier) @function
	type: (expression (literal (function)))
)
(object_constructor type: (identifier) @type)
(object_value name: (identifier) @variable.member)
(object_value
	name: (identifier) @function
	value: (expression (literal (function)))
)
(declaration
	name: (identifier) @type
	value: (expression (literal (group)))
)
(declaration
	name: (identifier) @type
	value: (expression (literal (either)))
)
(declaration
	name: (identifier) @type
	value: (expression (literal (choice)))
)
(declaration
	name: (identifier) @type
	value: (expression (literal (extend)))
)
(declaration
	name: (identifier) @function
	value: (expression (literal (function)))
)
(choice_variant (expression (literal (identifier))) @type)

; Brackets
["(" ")" "[" "]" "{" "}" "<" ">"] @punctuation.bracket
[";" ":" "," "."] @punctuation.delimiter
["+" "-" "*" "/" "^" "==" "!=" "<=" ">=" "< " " >" "="] @operator
(tag ["#"] @punctuation.special)

; Tokens
(number) @number
(string) @string
(comment) @comment
(either_variant) @lsp.type.enumMember
