/**
 * @file Provides the tokenization and parsing of the tag expression
 * @author Raj Kuchi <raj.kuchi@ge.com>
 * @author Dana Hata <dana.hata@ge.com>
 */
/**
 *
 * Create a Lexer Token
 * @param t	{LexerToken.TYPE}	- Type of the token
 * @param c {string}	- Token value
 * @param v {boolean}	- Whether the token is valid
 * @param m	{string}	- A message for the token (usually to set the error message for the token)
 * @constructor
 */
var LexerToken = function(t, c, v, m) {
	this.t = t;
	this.c = c;
	this.v = v;
	this.m = m;
};

/**
 * Create a Lexer Parser
 * @constructor
 */
var LexerParser = function() {
};

/**
 * Types of tokens
 * @namespace
 * @property	{string}	LPAREN	- Left Parentheses (
 * @property	{string}	RPAREN	- Right Parentheses )
 * @property	{string}	OPERATOR	- Operator + - * /
 * @property	{string}	TAG	- Tag in the format @abc#xyz
 * @property	{number}	NUMBER	- Number as integer or double
 * @property	{string}	WHITESPACE	- Whitespace
 * @property	{string}	INVALID	- Token is of no other valid type
 *
 */
LexerToken.TYPE = {
	LPAREN : 'LPAREN',
	RPAREN : 'RPAREN',
	OPERATOR: 'OPERATOR',
	TAG: 'TAG',
	NUMBER: 'NUMBER',
	WHITESPACE: 'WHITESPACE',
	COMMA: 'COMMA',
	FUNCTION: 'FUNCTION',
	EXPRESSION: 'EXPRESSION',
	INVALID: 'INVALID',
	CONDITIONAL_OPERATOR: 'CONDITIONAL_OPERATOR',
	CONDITIONAL_DELIMITER: 'CONDITIONAL_DELIMITER'
};

/*
* Holds the localized names of the different token types
* This is populated from outside the utility.
*/
LexerToken.TYPE_NAMES = {};

/**
 * Types of Operators
 * @namespace
 * @property	{string}	ADDITION	- Addition character +
 * @property	{string}	SUBTRACTION	- Subraction character -
 * @property	{string}	MULTIPLICATION	- Multiplication character *
 * @property	{string}	DIVISION	- Division character
 *
 */
LexerToken.OPERATORS = {
	ADDITION : '+',
	SUBTRACTION : '-',
	MULTIPLICATION: '*',
	DIVISION: '/',
	EXPONENT: '^',
	REMAINDER: '%'
};

LexerToken.CONDITIONAL_OPERATORS = {
	GT : '>',
	LT : '<',
	GTEQ: '>=',
	LTEQ: '<=',
	EQ: '==',
	NOTEQ: '!=',
	OR: 'OR',
	AND: 'AND'
};

/**
 * List of supported functions
 */
LexerToken.EXPRESSIONS = {};

/**
 * List of supported functions
 */
LexerToken.FUNCTIONS = {
	ABS: {
		name: 'ABS',
		help: '',
		rules: {
			minParams: 1,
			maxParams: 1
		}
	},
	MIN: {
		name: 'MIN',
		help: '',
		rules: {
			minParams: 2
		}
	},
	MAX: {
		name: 'MAX',
		help: '',
		rules: {
			minParams: 2
		}
	},
	MOD: {
		name: 'MOD',
		help: '',
		rules: {
			minParams: 2,
			maxParams: 2
		}
	},
	AVG: {
		name: 'AVG',
		help: '',
		rules: {
			minParams: 2
		}
	},
	SUM: {
		name: 'SUM',
		help: '',
		rules: {
			minParams: 2
		}
	},
	CEIL: {
		name: 'CEIL',
		help: '',
		rules: {
			minParams: 1,
			maxParams: 1
		}
	},
	FLOOR: {
		name: 'FLOOR',
		help: '',
		rules: {
			minParams: 1,
			maxParams: 1
		}
	},
	COS: {
		name: 'COS',
		help: '',
		rules: {
			minParams: 1,
			maxParams: 1
		}
	},
	SIN: {
		name: 'SIN',
		help: '',
		rules: {
			minParams: 1,
			maxParams: 1
		}
	},
	TAN: {
		name: 'TAN',
		help: '',
		rules: {
			minParams: 1,
			maxParams: 1
		}
	},
	SQRT: {
		name: 'SQRT',
		help: '',
		rules: {
			minParams: 1,
			maxParams: 1
		}
	},
	ROUND: {
		name: 'ROUND',
		help: '',
		rules: {
			minParams: 1,
			maxParams: 1
		}
	},
	LOG: {
		name: 'LOG',
		help: '',
		rules: {
			minParams: 1,
			maxParams: 1
		}
	},
	EXP: {
		name: 'EXP',
		help: '',
		rules: {
			minParams: 1,
			maxParams: 1
		}
	},
	POW: {
		name: 'POW',
		help: '',
		rules: {
			minParams: 2,
			maxParams: 2
		}
	},
	ACOS: {
		name: 'ACOS',
		help: '',
		rules: {
			minParams: 1,
			maxParams: 1
		}
	},
	ASIN: {
		name: 'ASIN',
		help: '',
		rules: {
			minParams: 1,
			maxParams: 1
		}
	},
	ATAN: {
		name: 'ATAN',
		help: '',
		rules: {
			minParams: 1,
			maxParams: 1
		}
	},
	ATAN2: {
		name: 'ATAN2',
		help: '',
		rules: {
			minParams: 2,
			maxParams: 2
		}
	},
	MAVG: {
		name: 'MAVG',
		help: '',
		rules: {
			minParams: 2,
			maxParams: 2,
			param: {
				0 : {
					'shouldBe' : LexerToken.TYPE.TAG
				},
				1 : {
					'shouldBe' : LexerToken.TYPE.NUMBER
				}
			}
		}
	},
	CSC: {
		name: 'CSC',
		help: '',
		rules: {
			minParams: 1,
			maxParams: 1
		}
	},
	SEC: {
		name: 'SEC',
		help: '',
		rules: {
			minParams: 1,
			maxParams: 1
		}
	},
	COT: {
		name: 'COT',
		help: '',
		rules: {
			minParams: 1,
			maxParams: 1
		}
	},
	MEDIAN: {
		name : 'MEDIAN',
		help: '',
		rules: {
			minParams: 2
		}
	},
	IF: {
		name: 'IF',
		help: '',
		rules: {
			minParams: 3,
			maxParams: 3
		}
	}
};

/**
 * Types of Special characters
 * @namespace
 * @property	{string}	ASSET	- $
 * @property	{string}	TAG	- |
 * @property	{string}	FUNCTION	- :
 * @property	{string}	EXPRESSION	- &
 *
 */

LexerToken.SPECIALCHAR = {
	ASSET : '$',
	TAG : '|',
	FUNCTION: ':',
	EXPRESSION: '&'
};


/**
 * Rules for tokens
 * <pre>
 * They define:
 * 		Which other tokens can precede and succeed a token
 * 		if a token can be the first token in an expression
 * 		if a token can be the last token in an expression
 * </pre>
 * @namespace
 * @property	{LexerToken.TYPE[]}	LPAREN.preTokens	- Valid tokens preceding a {@link LexerToken.TYPE} LPAREN token
 * @property	{LexerToken.TYPE[]}	LPAREN.postTokens	- Valid tokens succeeding a {@link LexerToken.TYPE} LPAREN token
 * @property	{boolean}	LPAREN.canStart	- Can the expression start with {@link LexerToken.TYPE} LPAREN token
 * @property	{boolean}	LPAREN.canEnd	- Can the expression end with {@link LexerToken.TYPE} LPAREN token
 *
 * @property	{LexerToken.TYPE[]}	RPAREN.preTokens	- Valid tokens preceding a {@link LexerToken.TYPE} RPAREN token
 * @property	{LexerToken.TYPE[]}	RPAREN.postTokens	- Valid tokens succeeding a {@link LexerToken.TYPE} RPAREN token
 * @property	{boolean}	RPAREN.canStart	- Can the expression start with {@link LexerToken.TYPE} RPAREN token
 * @property	{boolean}	RPAREN.canEnd	- Can the expression end with {@link LexerToken.TYPE} RPAREN token
 *
 * @property	{LexerToken.TYPE[]}	OPERATOR.preTokens	- Valid tokens preceding a {@link LexerToken.TYPE} OPERATOR token
 * @property	{LexerToken.TYPE[]}	OPERATOR.postTokens	- Valid tokens succeeding a {@link LexerToken.TYPE} OPERATOR token
 * @property	{boolean}	OPERATOR.canStart	- Can the expression start with {@link LexerToken.TYPE} OPERATOR token
 * @property	{boolean}	OPERATOR.canEnd	- Can the expression end with {@link LexerToken.TYPE} OPERATOR token
 *
 * @property	{LexerToken.TYPE[]}	TAG.preTokens	- Valid tokens preceding a {@link LexerToken.TYPE} TAG token
 * @property	{LexerToken.TYPE[]}	TAG.postTokens	- Valid tokens succeeding a {@link LexerToken.TYPE} TAG token
 * @property	{boolean}	TAG.canStart	- Can the expression start with {@link LexerToken.TYPE} TAG token
 * @property	{boolean}	TAG.canEnd	- Can the expression end with {@link LexerToken.TYPE} TAG token
 *
 * @property	{LexerToken.TYPE[]}	NUMBER.preTokens	- Valid tokens preceding a {@link LexerToken.TYPE} NUMBER token
 * @property	{LexerToken.TYPE[]}	NUMBER.postTokens	- Valid tokens succeeding a {@link LexerToken.TYPE} NUMBER token
 * @property	{boolean}	NUMBER.canStart	- Can the expression start with {@link LexerToken.TYPE} NUMBER token
 * @property	{boolean}	NUMBER.canEnd	- Can the expression end with {@link LexerToken.TYPE} NUMBER token
 *
 * @property	{LexerToken.TYPE[]}	WHITESPACE.preTokens	- Valid tokens preceding a {@link LexerToken.TYPE} WHITESPACE token
 * @property	{LexerToken.TYPE[]}	WHITESPACE.postTokens	- Valid tokens succeeding a {@link LexerToken.TYPE} WHITESPACE token
 * @property	{boolean}	WHITESPACE.canStart	- Can the expression start with {@link LexerToken.TYPE} WHITESPACE token
 * @property	{boolean}	WHITESPACE.canEnd	- Can the expression end with {@link LexerToken.TYPE} WHITESPACE token
 *
 * @property	{LexerToken.TYPE[]}	INVALID.preTokens	- Valid tokens preceding a {@link LexerToken.TYPE} INVALID token
 * @property	{LexerToken.TYPE[]}	INVALID.postTokens	- Valid tokens succeeding a {@link LexerToken.TYPE} INVALID token
 * @property	{boolean}	INVALID.canStart	- Can the expression start with {@link LexerToken.TYPE} INVALID token
 * @property	{boolean}	INVALID.canEnd	- Can the expression end with {@link LexerToken.TYPE} INVALID token
 *
 */
LexerToken.RULES = {
	LPAREN : {
		preTokens: [LexerToken.TYPE.OPERATOR, LexerToken.TYPE.LPAREN, LexerToken.TYPE.FUNCTION, LexerToken.TYPE.EXPRESSION, LexerToken.TYPE.COMMA, LexerToken.TYPE.CONDITIONAL_OPERATOR],
		postTokens: [LexerToken.TYPE.TAG, LexerToken.TYPE.NUMBER, LexerToken.TYPE.LPAREN, LexerToken.TYPE.FUNCTION, LexerToken.TYPE.EXPRESSION],
		canStart: true, // can start an expression with this token?
		canEnd: false // can end an expression with this token?
	},
	RPAREN : {
		preTokens: [LexerToken.TYPE.TAG, LexerToken.TYPE.NUMBER, LexerToken.TYPE.RPAREN, LexerToken.TYPE.FUNCTION, LexerToken.TYPE.EXPRESSION],
		postTokens: [LexerToken.TYPE.OPERATOR, LexerToken.TYPE.RPAREN, LexerToken.TYPE.COMMA, LexerToken.TYPE.CONDITIONAL_OPERATOR],
		canStart: false,
		canEnd: true
	},
	OPERATOR: {
		preTokens: [LexerToken.TYPE.NUMBER, LexerToken.TYPE.RPAREN, LexerToken.TYPE.TAG, LexerToken.TYPE.FUNCTION, LexerToken.TYPE.EXPRESSION],
		postTokens: [LexerToken.TYPE.NUMBER, LexerToken.TYPE.TAG, LexerToken.TYPE.LPAREN, LexerToken.TYPE.FUNCTION, LexerToken.TYPE.EXPRESSION],
		canStart: false,
		canEnd: false
	},
	CONDITIONAL_OPERATOR: {
		preTokens: [LexerToken.TYPE.NUMBER, LexerToken.TYPE.RPAREN, LexerToken.TYPE.TAG, LexerToken.TYPE.FUNCTION, LexerToken.TYPE.EXPRESSION],
		postTokens: [LexerToken.TYPE.NUMBER, LexerToken.TYPE.TAG, LexerToken.TYPE.LPAREN, LexerToken.TYPE.FUNCTION, LexerToken.TYPE.EXPRESSION],
		canStart: false,
		canEnd: false
	},
	COMMA: {
		preTokens: [LexerToken.TYPE.NUMBER, LexerToken.TYPE.RPAREN, LexerToken.TYPE.TAG, LexerToken.TYPE.FUNCTION, LexerToken.TYPE.EXPRESSION],
		postTokens: [LexerToken.TYPE.NUMBER, LexerToken.TYPE.TAG, LexerToken.TYPE.LPAREN, LexerToken.TYPE.RPAREN, LexerToken.TYPE.FUNCTION, LexerToken.TYPE.EXPRESSION],
		canStart: false,
		canEnd: false
	},
	TAG: {
		preTokens: [LexerToken.TYPE.LPAREN, LexerToken.TYPE.OPERATOR, LexerToken.TYPE.COMMA, LexerToken.TYPE.CONDITIONAL_OPERATOR],
		postTokens: [LexerToken.TYPE.RPAREN, LexerToken.TYPE.OPERATOR, LexerToken.TYPE.COMMA, LexerToken.TYPE.CONDITIONAL_OPERATOR],
		canStart: true,
		canEnd: true
	},
	EXPRESSION: {
		preTokens: [LexerToken.TYPE.LPAREN, LexerToken.TYPE.OPERATOR, LexerToken.TYPE.COMMA, LexerToken.TYPE.CONDITIONAL_OPERATOR],
		postTokens: [LexerToken.TYPE.RPAREN, LexerToken.TYPE.OPERATOR, LexerToken.TYPE.COMMA, LexerToken.TYPE.CONDITIONAL_OPERATOR],
		canStart: true,
		canEnd: true
	},
	NUMBER: {
		preTokens: [LexerToken.TYPE.LPAREN, LexerToken.TYPE.OPERATOR, LexerToken.TYPE.COMMA, LexerToken.TYPE.CONDITIONAL_OPERATOR],
		postTokens: [LexerToken.TYPE.RPAREN, LexerToken.TYPE.OPERATOR, LexerToken.TYPE.COMMA, LexerToken.TYPE.CONDITIONAL_OPERATOR],
		canStart: true,
		canEnd: true
	},
	WHITESPACE: {
		preTokens: [LexerToken.TYPE.LPAREN, LexerToken.TYPE.RPAREN, LexerToken.TYPE.OPERATOR, LexerToken.TYPE.TAG, LexerToken.TYPE.NUMBER, LexerToken.TYPE.INVALID, LexerToken.TYPE.FUNCTION, LexerToken.TYPE.COMMA, LexerToken.TYPE.EXPRESSION, LexerToken.TYPE.CONDITIONAL_OPERATOR],
		postTokens: [LexerToken.TYPE.LPAREN, LexerToken.TYPE.RPAREN, LexerToken.TYPE.OPERATOR, LexerToken.TYPE.TAG, LexerToken.TYPE.NUMBER, LexerToken.TYPE.INVALID, LexerToken.TYPE.FUNCTION, LexerToken.TYPE.COMMA, LexerToken.TYPE.EXPRESSION, LexerToken.TYPE.CONDITIONAL_OPERATOR],
		canStart: true,
		canEnd: true
	},
	INVALID: {
		preTokens: [LexerToken.TYPE.LPAREN, LexerToken.TYPE.RPAREN, LexerToken.TYPE.OPERATOR, LexerToken.TYPE.TAG, LexerToken.TYPE.NUMBER, LexerToken.TYPE.INVALID, LexerToken.TYPE.FUNCTION, LexerToken.TYPE.COMMA, LexerToken.TYPE.EXPRESSION, LexerToken.TYPE.CONDITIONAL_OPERATOR],
		postTokens: [LexerToken.TYPE.LPAREN, LexerToken.TYPE.RPAREN, LexerToken.TYPE.OPERATOR, LexerToken.TYPE.TAG, LexerToken.TYPE.NUMBER, LexerToken.TYPE.INVALID, LexerToken.TYPE.FUNCTION, LexerToken.TYPE.COMMA, LexerToken.TYPE.EXPRESSION, LexerToken.TYPE.CONDITIONAL_OPERATOR],
		canStart: true,
		canEnd: true
	}
};

/**
 * Determines if the input string is a valid and supported function.
 *
 * @param s	{String} - input string to check
 */
LexerParser.prototype.isValidFunction = function isValidFunction(s) {
	var found = false;

	if (!s) return false;

	Object.keys(LexerToken.FUNCTIONS).forEach(function(key) {
		if (s.toUpperCase() === LexerToken.FUNCTIONS[key].name.toUpperCase())	{
			found = true;
		}
	});

	return found;
};

/**
 * Determines if the input string is a valid expression.
 *
 * @param s	{String} - input string to check
 */
LexerParser.prototype.isValidExpression = function isValidExpression(s) {
	if (!s) return false;

	return LexerToken.EXPRESSIONS.some(function(expression) {
		return expression.name === s;
	});
};


/**
 * List representation of a {@link LexerToken.FUNCTIONS}
 * @returns {Array} of objects representing the functions
 */
LexerToken.getFunctions = function() {
	var functions = [];
	Object.keys(LexerToken.FUNCTIONS).forEach(function(key) {
		functions.push({name: LexerToken.FUNCTIONS[key].name, help: LexerToken.FUNCTIONS[key].help});
	});
	return functions;
};

/**
 * set the help text for {@link LexerToken.FUNCTIONS}
 *
 */
LexerToken.setFunctionsHelp = function(helpObj) {
	var functions = [];
	Object.keys(LexerToken.FUNCTIONS).forEach(function(key) {
		if (helpObj[key]) LexerToken.FUNCTIONS[key].help = helpObj[key];
	});
};

/**
 * set the names based on the locale for {@link LexerToken.TYPE}
 *
 */
LexerToken.setTokenNames = function(names) {
	LexerToken.TYPE_NAMES = {};
	Object.keys(LexerToken.TYPE).forEach(function(key) {
		LexerToken.TYPE_NAMES[LexerToken.TYPE[key]] = names[key];
	});
};


/**
 * set the expressions for {@link LexerToken.EXPRESSIONS}
 *
 */
LexerToken.setExpressions = function(expressions) {
	LexerToken.EXPRESSIONS = expressions;
};

/**
 * get the matching expression from {@link LexerToken.EXPRESSIONS}
 *
 */
LexerToken.getExpression = function(expression) {
	for (var j = 0; j < LexerToken.EXPRESSIONS.length; j++){
		if (LexerToken.EXPRESSIONS[j].name === expression) return LexerToken.EXPRESSIONS[j];
	}
	return undefined;
};

/**

/**
 * String representation of a {@link LexerToken} token
 * @returns {string} string representation of the token
 */
LexerToken.prototype.toString = function() {
	return 'TYPE<' + this.t + '> ' + 'VALUE<' + this.c + '> ' + 'VALID<' + this.v + '> ' + 'MESSAGE<' + this.m + '>';
};

/**
 * Checks if the character is a letter [a-zA-Z]
 * @param c {*}
 * @returns {boolean} true if the character is a letter, false if not a letter
 */
LexerParser.prototype.isLetter = function(c) {
	return c.toLowerCase() != c.toUpperCase();
};

/**
 * Checks if the character is a digit [0-9]
 * @param c {*}
 * @returns {boolean}
 */
LexerParser.prototype.isDigit = function(c) {
	return !isNaN(parseInt(c));
};

/**
 * Checks if part of the string starting from the index is a number
 * @param s {string} expression
 * @param i {number} index of the expression to check for a number
 * @returns {boolean} true if a valid number is found in the expression at the index, false if not found
 */
LexerParser.prototype.isNumber = function(s,i) {
	var j = i;
	var num;

	if(s.length == 1){
		num = s;
	} else {
		for (; j < s.length;) {
			if (this.isDigit(s.charAt(j)) || s.charAt(j) == '.') {
				j++;
			} else {
				break;
			}
		}

		if(i==j){
			num = s[i];
		}else{
			num = s.substring(i, j);
		}
	}

	if(isNaN(num)){
		return false;
	}else{
		return true;
	}
};

/**
 * Checks if a string is part of the expression
 * @param s {string} expression
 * @param c {string} substring to look in the expression
 * @returns {boolean} true if substring is present in the expression, false if not present
 */
LexerParser.prototype.contains = function(s, c) {
	return (s.indexOf(c) > -1);
};

/**
 * Checks if the character is a whitespace
 * @param c {string} character to check if it is a whitespace
 * @returns {boolean} true if whitespace, false if not a whitespace
 */
LexerParser.prototype.isWhitespace = function(c) {
	return c.replace(/^\s+|\s+$/g, '').length == 0;
};

/**
 * Gives a valid number from the expression at the index, throws an error otherwise
 * @param s {string} expression string
 * @param i {number} index in the expression to look for the number
 * @returns {number} number from the expression at the index i
 * @throws Throws an error if the number is not valid
 */
LexerParser.prototype.getNumber = function(s, i) {
	var j = i;
	var num;

	if(s.length == 1) num = s;
	else{
		for( ; j < s.length; )
			if(this.isDigit(s.charAt(j)) || s.charAt(j)=='.') j++;
			else break;

		if(i==j){
			num = s[i];
		}else{
			num = s.substring(i, j);
		}
	}

	if (this.contains(num, '.'))  {
		try {
			parseFloat(num);
		} catch (e) {
			throw Error("'" + num + "' is not a valid number.");
		}
	} else {
		try {
			parseInt(num);
		} catch (e) {
			throw Error("'" + num + "' is not a valid number.");
		}
	}
	return num;
};

/**
 * Given an input string and a start index, return the next function name
 * encountered. A left parenthesis is the signal to stop further iteration
 * through the input string.
 *
 * @param s	{String} - input string to check
 * @param i	{Integer} - start index
 */
LexerParser.prototype.getFunction = function getFunction(s, i) {

	var j = i;
	var fnLabel;
	var ret = {
		fnLabel: '',
		isValid : true,
		message : ''
	};

	var isValid = true;

	for (; j < s.length;)		{
		if (s.charAt(j) !== '(') j++;
		else break;
	}

	fnLabel = s.substring(i, j);
	fnLabel = fnLabel.trim();
	if (!this.isValidFunction(fnLabel.substring(1))) {
		isValid = false;
	}

	ret.fn = fnLabel;
	ret.isValid = isValid;
	if(!isValid){
		ret.message = {
			key: 'tag-expression-error-invalid_function_name',
			params: {
				functionName: fnLabel
			}
		};
	}

	return ret;
};

/**
 * Given an input string and a start index, return the next expression name
 * encountered. A left parenthesis is the signal to stop further iteration
 * through the input string.
 *
 * @param s	{String} - input string to check
 * @param i	{Integer} - start index
 */
LexerParser.prototype.getExpression = function getExpression(s, i) {

	var j = i;
	var exprLabel;
	var ret = {
		exprLabel: '',
		isValid : true,
		message : ''
	};

	var isValid = true;

	// End of expression is identified by |
	for (; j < s.length;) {
		if(s.charAt(j) === LexerToken.SPECIALCHAR.TAG){
			j++;
			break;
		} else{
			j++;
		}
	}

	exprLabel = s.substring(i, j);
	exprLabel = exprLabel.trim();
	if (!this.isValidExpression(exprLabel.slice(1, -1))) {
		isValid = false;
	}

	ret.expr = exprLabel;
	ret.isValid = isValid;
	if(!isValid){
		ret.message = {
			key: 'tag-expression-error-invalid_embedded_expression',
			params: {
				expressionName: exprLabel
			}
		};
	}

	return ret;
};

/**
 * Gives a tag from the expression at the specific index
 * @param s {string} expression string
 * @param i {number} index in the expression to look for the tag
 * @returns {string} tag in the expression at the index i
 * @throws Throws an error if the tag is not valid
 */
LexerParser.prototype.getTag = function(s, i) {
	var ret = {
		tag: '',
		isValid : true,
		message : ''
	};
	var isValid = true;
	var msg = '';
	var j = i;
	var tag;

	for( ; j < s.length; ) {
		if(s.charAt(j) === LexerToken.SPECIALCHAR.TAG){
			j++;
			break;
		} else{
			j++;
		}
	}

	for( ; j < s.length; ) {
		if (!this.isEndOfTag(s.charAt(j))){
			j++;
		} else{
			j++;
			break;
		}
	}


	tag = s.substring(i, j);

	// must contain LexerToken.SPECIALCHAR.ASSET
	if (this.contains(tag, LexerToken.SPECIALCHAR.ASSET) && !this.contains(tag, LexerToken.SPECIALCHAR.TAG)) {
		msg = 'tag-expression-error-invalid_asset_name';
		isValid = false;
	}

	// last character must be LexerToken.SPECIALCHAR.TAG
	if (isValid && tag.slice(-1) !== LexerToken.SPECIALCHAR.TAG) {
		msg = 'tag-expression-error-invalid_tag_name';
		isValid = false;
	}

	// must contain only one LexerToken.SPECIALCHAR.ASSET
	if (isValid && tag.indexOf(LexerToken.SPECIALCHAR.ASSET) !== tag.lastIndexOf(LexerToken.SPECIALCHAR.ASSET)) {
		msg = 'tag-expression-error-invalid_asset_name';
		isValid = false;
	}

	// must contain only two LexerToken.SPECIALCHAR.TAG
	var regex = new RegExp('\\' + LexerToken.SPECIALCHAR.TAG, 'g');
	var count = (tag.match(regex) || []).length;
	if (isValid && count !== 2) {
		msg = 'tag-expression-error-invalid_tag_name';
		isValid = false;
	}

	// must have content between the LexerToken.SPECIALCHAR.ASSET and the LexerToken.SPECIALCHAR.TAG
	if (isValid && tag.substring(tag.indexOf(LexerToken.SPECIALCHAR.ASSET) + 1,
			tag.indexOf(LexerToken.SPECIALCHAR.TAG)).length < 1) {
		msg = 'tag-expression-error-invalid_expression';
		isValid = false;
	}

	// must have content after the LexerToken.SPECIALCHAR.TAG
	if (isValid && tag.substring(tag.indexOf(LexerToken.SPECIALCHAR.TAG) + 1, tag.length).length < 1) {
		msg = 'tag-expression-error-invalid_expression';
		isValid = false;
	}

	// must not contain special characters
	if (!this.isValidTag(tag)) {
		msg = 'tag-expression-error-invalid_tag_name';
		isValid = false;
	}

	ret.tag = tag;
	ret.isValid = isValid;
	if (!isValid) {
		ret.message = {
			key: msg,
			params: {
				tagOrAssetName: tag
			}
		};
	}

	return ret;
};

/**
 * Gives the asset and tag portion from the tag token {@link LexerToken.TYPE} TAG.
 * @param token {string} The token value for a tag to split
 * @returns {object} The object contains the 'asset' prefixed with @ and 'tag' prefixed with # anchor characters
 */
LexerParser.prototype.getTagTokens = function(token) {

	if(!token) {
		return;
	}
	var tag = token.split(LexerToken.SPECIALCHAR.TAG);

	return {
		asset: tag.shift(),
		tag: LexerToken.SPECIALCHAR.TAG + tag.join(LexerToken.SPECIALCHAR.TAG)
	};

};

/**
 * Check if the character defines end of tag.
 * @param c {string} character to check if it is a delimiter for a tag and defines the end of tag
 * @returns {boolean} true if this character defines end of tag as a delimiter, false otherwise
 */
LexerParser.prototype.isEndOfTag = function(c){
	return c == LexerToken.SPECIALCHAR.TAG;
};

/**
 * Check if the tag has any invalid characters
 * @param tag {string} tag value to check if it does not contain invalid characters
 * @returns {boolean} true if the tag does not contain invalid characters, false otherwise
 */
LexerParser.prototype.isValidTag = function(tag){
	return !/[<>!,?&\\]/g.test(tag);
};

/**
 * Converts the expression into tokens and applies the rules to determine the validity of each token
 * @param s {string} the expression string to tokenize
 * @returns {LexerToken[]} An array of {@link LexerToken} tokens
 */
LexerParser.prototype.lex = function(s) {
	var result = [];
	var lastToken = null;
	var isValidExpr = false;
	for(var i = 0; i < s.length; ) {
		switch(s.charAt(i)) {
			case '(':
				result.push(new LexerToken(LexerToken.TYPE.LPAREN, "("));
				i++;
				break;
			case ')':
				result.push(new LexerToken(LexerToken.TYPE.RPAREN, ")"));
				i++;
				break;
			case ',':
				result.push(new LexerToken(LexerToken.TYPE.COMMA, ','));
				i++;
				break;
			case LexerToken.SPECIALCHAR.ASSET:
				isValidExpr = true;
				var tagObj = this.getTag(s, i);
				var tag = tagObj.tag;
				i += tag.length;
				result.push(new LexerToken(LexerToken.TYPE.TAG, tag, tagObj.isValid, tagObj.message));
				break;
			case LexerToken.SPECIALCHAR.FUNCTION:
				var fnObj = this.getFunction(s, i);
				var fn = fnObj.fn;
				i += fn.length;
				result.push(new LexerToken(LexerToken.TYPE.FUNCTION, fn, fnObj.isValid, fnObj.message));
				break;
			case LexerToken.SPECIALCHAR.EXPRESSION:
				isValidExpr = true;
				var exprObj = this.getExpression(s, i);
				var expr = exprObj.expr;
				i += expr.length;
				result.push(new LexerToken(LexerToken.TYPE.EXPRESSION, expr, exprObj.isValid, exprObj.message));
				break;
			case '+':
				result.push(new LexerToken(LexerToken.TYPE.OPERATOR, "+"));
				i++;
				break;
			case '*':
				result.push(new LexerToken(LexerToken.TYPE.OPERATOR, "*"));
				i++;
				break;
			case '/':
				result.push(new LexerToken(LexerToken.TYPE.OPERATOR, "/"));
				i++;
				break;
			case '^':
				result.push(new LexerToken(LexerToken.TYPE.OPERATOR, "^"));
				i++;
				break;
			case '%':
				result.push(new LexerToken(LexerToken.TYPE.OPERATOR, "%"));
				i++;
				break;
			case '>':
				if(s.length > i+1 && s.charAt(i+1) === '=') {
					result.push(new LexerToken(LexerToken.TYPE.CONDITIONAL_OPERATOR, LexerToken.CONDITIONAL_OPERATORS.GTEQ));
					i++;
				} else {
					result.push(new LexerToken(LexerToken.TYPE.CONDITIONAL_OPERATOR, LexerToken.CONDITIONAL_OPERATORS.GT));
				}
				i++;
				break;
			case '<':
				if(s.length > i+1 && s.charAt(i+1) === '=') {
					result.push(new LexerToken(LexerToken.TYPE.CONDITIONAL_OPERATOR, LexerToken.CONDITIONAL_OPERATORS.LTEQ));
					i++;
				} else {
					result.push(new LexerToken(LexerToken.TYPE.CONDITIONAL_OPERATOR, LexerToken.CONDITIONAL_OPERATORS.LT));
				}
				i++;
				break;
			case '=':
				if(s.length > i+1 && s.charAt(i+1) === '=') {
					result.push(new LexerToken(LexerToken.TYPE.CONDITIONAL_OPERATOR, LexerToken.CONDITIONAL_OPERATORS.EQ));
					i++;
				} else {
					result.push(new LexerToken(LexerToken.TYPE.INVALID, s.charAt(i), false, "Invalid character"));
				}
				i++;
				break;
			case '!':
				if(s.length > i+1 && s.charAt(i+1) === '=') {
					result.push(new LexerToken(LexerToken.TYPE.CONDITIONAL_OPERATOR, LexerToken.CONDITIONAL_OPERATORS.NOTEQ));
					i++;
				} else {
					result.push(new LexerToken(LexerToken.TYPE.INVALID, s.charAt(i), false, "Invalid character"));
				}
				i++;
				break;
			case 'O':
			case 'o':
				if(i-1 > 0 && s.charAt(i-1).replace(/\u00A0/g, ' ') === ' ' && s.length > i+1 && s.charAt(i+1).toUpperCase() === 'R' &&
					s.length > i+2 && s.charAt(i+2).replace(/\u00A0/g, ' ') === ' ') {
					result.push(new LexerToken(LexerToken.TYPE.CONDITIONAL_OPERATOR, LexerToken.CONDITIONAL_OPERATORS.OR));
					i++;
				} else {
					result.push(new LexerToken(LexerToken.TYPE.INVALID, s.charAt(i), false, "Invalid character"));
				}
				i++;
				break;
			case 'A':
			case 'a':
				if(i-1 > 0 && s.length > i+3 && s.charAt(i-1).replace(/\u00A0/g, ' ') === ' ' && s.charAt(i+1).toUpperCase() === 'N' &&
					s.charAt(i+2).toUpperCase() === 'D' && s.charAt(i+3).replace(/\u00A0/g, ' ') === ' ') {
					result.push(new LexerToken(LexerToken.TYPE.CONDITIONAL_OPERATOR, LexerToken.CONDITIONAL_OPERATORS.AND));
					i=i+2;
				} else {
					result.push(new LexerToken(LexerToken.TYPE.INVALID, s.charAt(i), false, "Invalid character"));
				}
				i++;
				break;
			case '-':
				if (lastToken == null ||
					LexerToken.TYPE.LPAREN == lastToken.t ||
					LexerToken.TYPE.COMMA == lastToken.t ||
					LexerToken.TYPE.OPERATOR == lastToken.t) {
					//then this '-' must be the start of a number constant, i.e. a negative sign
					//continue to default case
				} else {
					//otherwise we consider it an subtraction operator
					result.push(new LexerToken(LexerToken.TYPE.OPERATOR, "-"));
					i++;
					break;
				}
			default:
				if(this.isWhitespace(s.charAt(i))) {
					result.push(new LexerToken(LexerToken.TYPE.WHITESPACE, " "));
					i++;
				} else {
					//determine is number constant or word
					if(this.isNumber(s, i)){
						//must be a number constant
						var num = this.getNumber(s, i);
						i += num.length;
						result.push(new LexerToken(LexerToken.TYPE.NUMBER, num));
					} else {
						result.push(new LexerToken(LexerToken.TYPE.INVALID, s.charAt(i), false, "Invalid character"));
						i++;
					}
				}
				break;
		}
		lastToken = result[result.length-1];
	}

	try {
		this.applyRules(result);

		// if the expression is valid, perform additional delimiters addition for any conditional statements present
		var isExprValid = true;
		var isConditionalPresent = false;
		for (var k = 0; k < result.length; k++) {
			if (result[k].v == false) {
				isExprValid = false;
				break;
			}
			if (result[k].t === LexerToken.TYPE.FUNCTION && LexerToken.FUNCTIONS[(result[k].c).substring(1)].name === 'IF') {
				isConditionalPresent = true;
			}
		}
		// If the expression is valid and has at least one IF function, add the [] to the non-logical operands
		// eg. (a + b) > (c + d) -> [(a + b)] > [(c + d)]
		// eg. (a > b) AND (c <d ) -> ([a] > [b]) AND ([c] < [d])
		// This is required by the service layer to interpret the conditional operands correctly
		if (isExprValid && isConditionalPresent) {
			result = this.applyConditionalDelimiters(result);
		}
	}catch(e){
		// in case of error, set the last token as invalid by setting the validity of the expression to false
		isValidExpr = false;
	}

	// mark the last non-whitespace token as invalid when there are no tokens of type tag or expression
	if (!isValidExpr) {
		for (var j = result.length-1; j >= 0; j--) {
			if (result[j].t !== LexerToken.TYPE.WHITESPACE) {
				result[j].v = false;
				result[j].m = { key: 'tag-expression-error-incomplete_expression'};
				break;
			}
		}
	}

	return result;
};

/**
 * Converts the array of {LexerToken} tokens to a string by replacing tag values with a number 1.
 * This can then be used to evaluate as a Math expression to check validity of the expression
 * @param t {LexerToken[]} An array of the {LexerToken} tokens
 * @returns {string} expression string after replacing tag values with number 1
 */
LexerParser.prototype.evaluate = function(t) {
	var expr = '';
	for(var i = 0; i < t.length; ) {
		switch (t[i].t) {
			case LexerToken.TYPE.NUMBER:
				expr+=t[i].c;
				i++;
				break;
			case LexerToken.TYPE.OPERATOR:
				expr+=t[i].c;
				i++;
				break;
			case LexerToken.TYPE.LPAREN:
				expr+=t[i].c;
				i++;
				break;
			case LexerToken.TYPE.RPAREN:
				expr+=t[i].c;
				i++;
				break;
			case LexerToken.TYPE.TAG:
				expr+=1;
				i++;
				break;
			case LexerToken.TYPE.WHITESPACE:
				expr+=' ';
				i++;
				break;
			default:
				throw Error('invalid character.');
				break;
		}
	}

	return expr;
};

/**
 * Applies the {@link LexerToken.RULES} to each token in the array of tokens passed
 * @param t {LexerToken[]} An array of the {@link LexerToken} tokens
 */
LexerParser.prototype.applyRules = function(t) {
	for(var i = 0; i < t.length; i++) {
		if(t[i].t === LexerToken.TYPE.INVALID){
			t[i].v = false;
			t[i].m = { key: 'tag-expression-error-invalid_expression' };
		}else if(t[i].t !== LexerToken.TYPE.WHITESPACE){
			this.checkValidity(t, t[i].t, i);
		}else{
			t[i].v = true;
		}
	}
};

/**
 * Applies the conditional delimiters [] to the operands in the conditional expression
 * Get the LHS and RHS operands and encloses the non-conditional items with []
 * by adding the new tokens for [ and ] in the array of tokens
 * @param t {LexerToken[]} An array of the {@link LexerToken} tokens. These are all the tokens of the expression
 */
LexerParser.prototype.applyConditionalDelimiters = function(t) {

	// keep the current length of the tokens. This will be used later to update the tokens array
	var curLength = t.length;
	for(var index = 0; index < t.length; index++) {

		// proceed only for FUNCTIONS and of value 'IF'
		if(t[index].t !== LexerToken.TYPE.FUNCTION ||
			LexerToken.FUNCTIONS[(t[index].c).substring(1)].name !== 'IF')
			continue;

		// Following is performed when the token is an IF function
		var stack = [];

		// holds the number of arguments to the function
		var numParams = 0;

		// holds the arguments to the function
		var params = [];
		var j = index+1;

		// iterate till the first token that is not a whitespace
		for (; j < t.length; j++) {
			if (t[j].t === LexerToken.TYPE.WHITESPACE) {
				continue;
			}
			// if first non-whitespace token is not an opening parentheses, return false
			if (t[j].t !== LexerToken.TYPE.LPAREN){
				t[j].v = false;
				throw Error('Invalid token');
			}

			// push the first opening parentheses to the stack of parentheses for balance check
			if (t[j].t === LexerToken.TYPE.LPAREN){
				stack.push(t[j].c);
			}
			break;
		}

		// If the function does not have an opening parentheses following the name
		if(stack.length == 0) break;


		// iterate throught the rest of the tokens to check validity of the function
		var param = [];
		// keep the first index of the first parameter. This will be used to replace the new tokens later
		var sIndex = j+1;
		for (var i = j+1; i < t.length; i++) {

			// push all opening parentheses
			if (t[i].t === LexerToken.TYPE.LPAREN){
				stack.push(t[i].c);
			}

			// pop the stack when a closing parentheses is encountered. return false if they are not balanced.
			if (t[i].t === LexerToken.TYPE.RPAREN){
				if(stack.length == 0) {
					t[i].v = false;
					throw Error('Invalid token');
				}

				// closing parentheses for the function encountered. Exit the handling for this function.
				if(stack.length == 1){
					if(param.length > 0) {
						params.push(param);
						param = [];
						numParams++;
					}
					break;
				}

				stack.pop();
			}

			// for any non-comma token push the tokens. When a comma is encountered, reset and expect another parameter in the function.
			if (t[i].t !== LexerToken.TYPE.COMMA) {
				param.push(t[i]);
			}else if (t[i].t === LexerToken.TYPE.COMMA){
				// if the comma is part of the parameter, check if this comma is between
				// another parentheses other than the opening parentheses
				if (stack.length > 1) {
					param.push(t[i]);
				}else if (param.length > 0) {
					params.push(param);
					// break after getting the first parameter
					break;
				}
			}
		}

		// remove the existing earlier tokens for the first param
		t.splice(sIndex, params[0].length);
		// replace with the new tokens received from formatConditionalStatement
		t.splice.apply(t, [sIndex, 0].concat(this.formatConditionalStatement(params[0])));
		index = index + (t.length - curLength);
		curLength = t.length;
	}

	return t;
};

/**
 * Check validity of function at the index in the list of tokens
 * @param tokens {LexerToken[]} An array of all the tokens from the tag expression
 * @param type {LexerToken.TYPE} Type of the token to validate
 * @param index {number} index of the token in the list of tokens
 * @returns {boolean} true if the function is valid and follows the rules, false otherwise
 */
LexerParser.prototype.validateFunction = function(tokens, type, index){

	var self = this;
	// false if the index is less than the length of the tokens
	if(index > tokens.length-1) return false;

	//false if there is no corresponding function defined
	if(!LexerToken.FUNCTIONS[(tokens[index].c).substring(1)]) {
		tokens[index].v = false;
		tokens[index].m = {
			key: 'tag-expression-error-invalid_function_name',
			params: {
				functionName: (tokens[index].c).substring(1)
			}
		};
		return false;
	}

	// check if the function is of type IF
	var isIF = (tokens[index].c).substring(1) === LexerToken.FUNCTIONS.IF.name;
	var stack = [];

	// holds the number of arguments to the function
	var numParams = 0;

	// holds the arguments to the function
	var params = [];
	// move to the token after the function name :IF
	var j = index+1;

	// iterate till the first token that is not a whitespace
	for (; j < tokens.length; j++) {
		if (tokens[j].t === LexerToken.TYPE.WHITESPACE) {
			continue;
		}
		// if first non-whitespace token is not an opening parentheses, return false
		if (tokens[j].t !== LexerToken.TYPE.LPAREN){
			tokens[j].v = false;
			tokens[j].m = {
				key: 'tag-expression-error-invalid_function_no_parentheses',
				params: {
					functionName: (tokens[index].c).substring(1)
				}
			};
			return false;
		}

		// push the first opening parentheses to the stack of parentheses for balance check
		if (tokens[j].t === LexerToken.TYPE.LPAREN){
			stack.push(tokens[j].c);
		}
		break;
	}

	// If the function does not have an opening parentheses following the name
	if(stack.length == 0) {
		tokens[index].v = false;
		tokens[index].m = {
			key: 'tag-expression-error-invalid_function_no_parentheses',
			params: {
				functionName: (tokens[index].c).substring(1)
			}
		};
		return false;
	}


	// iterate throught the rest of the tokens to check validity of the function
	var param = [];
	var paramIndex = j+1;
	for (var i = j+1; i < tokens.length; i++) {

		// push all opening parentheses
		if (tokens[i].t === LexerToken.TYPE.LPAREN){
			stack.push(tokens[i].c);
		}

		// Conditional IF is not allowed inside another IF
		if(isIF && tokens[i].t === LexerToken.TYPE.FUNCTION &&
			LexerToken.FUNCTIONS[(tokens[i].c).substring(1)].name === 'IF') {
			tokens[i].v = false;
			tokens[i].m = {
				key: 'tag-expression-error-invalid_function_if',
				params: {
					functionChild: (tokens[i].c).substring(1),
					functionParent: (tokens[index].c).substring(1)
				}
			};
			return false;
		}

		// pop the stack when a closing parentheses is encountered. return false if they are not balanced.
		if (tokens[i].t === LexerToken.TYPE.RPAREN){
			if(stack.length == 0) {
				tokens[i].v = false;
				tokens[i].m = {
					key: 'tag-expression-error-invalid_function_unbalanced_parentheses',
					params: {
						functionName: (tokens[index].c).substring(1)
					}
				};
				return false;
			}

			// closing parentheses for the function encountered. Exit the handling for this function.
			if(stack.length == 1){
				if(param.length > 0) {
					params.push({index: paramIndex, param: param});
					paramIndex = i;
					param = [];
					numParams++;
				}
				break;
			}

			stack.pop();
		}

		// for any non-comma token push the tokens. When a comma is encountered, reset and expect another parameter in the function.
		if (tokens[i].t !== LexerToken.TYPE.COMMA) {
			param.push(tokens[i]);
		}else if (tokens[i].t === LexerToken.TYPE.COMMA){
			// if the comma is part of the parameter, check if this comma is between
			// another parentheses other than the opening parentheses
			if (stack.length > 1) {
				param.push(tokens[i]);
			}else if (param.length > 0) {
				params.push({index: paramIndex, param: param});
				paramIndex = i+1;
				param = [];
				numParams++;
			}
		}
	}

	// if any rules are defined on the function then apply those.
	var rules = LexerToken.FUNCTIONS[(tokens[index].c).substring(1)].rules;
	if(rules) {
		if(rules.minParams && numParams < rules.minParams) {
			tokens[index].v = false;
			tokens[index].m = {
				key: 'tag-expression-error-invalid_function_min_params',
				params: {
					functionName: (tokens[index].c).substring(1),
					params: rules.minParams
				}
			};
			return false;
		}
		if(rules.maxParams && numParams > rules.maxParams) {
			tokens[index].v = false;
			tokens[index].m = {
				key: 'tag-expression-error-invalid_function_max_params',
				params: {
					functionName: (tokens[index].c).substring(1),
					params: rules.maxParams
				}
			};
			return false;
		}
		if(rules.param) {
			// apply any argument specific rules to the function. For e.g., first argument of MAVG should be a tag
			var BreakException = {};
			//try{
				Object.keys(rules.param).forEach(function(key,ind) {
					if (rules.param[key].shouldBe && params.length-1 >= key) {
						var p = params[key].param;
						for (var k=0; k < p.length; k++) {
							if (p[k].t === LexerToken.TYPE.WHITESPACE) {
								continue;
							}
							if (p[k].t !== rules.param[key].shouldBe){
								tokens[params[key].index].v = false;
								self.markFirstTokenInvalid(params[key].index, tokens, {
									key: 'tag-expression-error-invalid_function_param_type',
									params: {
										functionName: (tokens[index].c).substring(1),
										paramNum: parseInt(key)+1,
										paramType: LexerToken.TYPE_NAMES[rules.param[key].shouldBe]
									}
								});
							}
						}
					}
				});

		}
	}

	// special handling for conditional operator in IF function
	if(LexerToken.FUNCTIONS[(tokens[index].c).substring(1)].name === 'IF' && params.length > 0) {
		var isIfValid = this.isValidConditionalStatement(params[0].index, params[0].param, tokens);
		if (params.length > 1) {
			if (!this.isTagPresent(params[1].param)) {
				isIfValid = false;
				this.markFirstTokenInvalid(params[1].index, tokens, {
					key: 'tag-expression-error-invalid_function_if_param',
					params: {
						functionName: (tokens[index].c).substring(1),
						paramNum: 2
					}
				});
			}
		}
		if (params.length > 2) {
			if (!this.isTagPresent(params[2].param)) {
				isIfValid = false;
				this.markFirstTokenInvalid(params[2].index, tokens, {
					key: 'tag-expression-error-invalid_function_if_param',
					params: {
						functionName: (tokens[index].c).substring(1),
						paramNum: 3
					}
				});
			}
		}
		return isIfValid;
	}
	return true;
};

/**
 * Mark the first non-whitespace token as invalid with the message
 * @param paramIndex {Number} Index of the parameter start in the complete expression token list
 * @param tokens {LexerToken[]} An array of all the tokens in the expression
 * @param msg {object} A message object with the key and value when applicable
 */
LexerParser.prototype.markFirstTokenInvalid = function(paramIndex, tokens, msg){
	for (var m = paramIndex; m <= tokens.length; m++) {
		if (tokens[m].t !== LexerToken.TYPE.WHITESPACE) {
			tokens[m].v = false;
			tokens[m].m = msg;
			break;
		}
	}
};


/**
 * Check if a token of type TAG is present in the list of tokens
 * @param tokens {LexerToken[]} An array of tokens
 * @returns {Boolean} true if a TAG token is present in the tokens, false otherwise
 */
LexerParser.prototype.isTagPresent = function(tokens){
	for (var i = 0; i < tokens.length; i++) {
		// check if the token is of type TAG
		if (tokens[i].t === LexerToken.TYPE.TAG || tokens[i].t === LexerToken.TYPE.EXPRESSION) {
			return true;
		}
	}
	return false;
};

/**
 * Formats the conditional parameter tokens by adding the conditional delimiters [ ] in the tokens
 * @param tokens {LexerToken[]} An array of all the tokens from the tag expression
 * @returns {Array} tokens with added {@link LexerToken.TYPE.CONDITIONAL_DELIMITER}
 */
LexerParser.prototype.formatConditionalStatement = function(tokens){
	var curLength = tokens.length;
	for (var i = 0; i < tokens.length; i++) {
		// add tokens for only conditional operators skipping AND and OR
		if (tokens[i].t === LexerToken.TYPE.CONDITIONAL_OPERATOR && tokens[i].c !== 'AND' && tokens[i].c !== 'OR') {

			//insert the [] if not already present. Increment the current iterator by 2 if added.
			tokens = this.insertConditionalDelimiters(this.getLHS(i-1, tokens), tokens);
			if (tokens.length > curLength) {
				curLength = tokens.length;
				i=i+2;
			}

			//insert the [] if not already present. Increment the current iterator by 2 if added.
			tokens = this.insertConditionalDelimiters(this.getRHS(i+1, tokens), tokens);
			if (tokens.length > curLength) {
				curLength = tokens.length;
				i=i+2;
			}
		}
	}
	return tokens;
};

/**
 * Inserts the conditional delimiter tokens for [ ] in the conditional parameter tokens
 * @param indexes {Object} An object containing sIndex and lIndex for the start and end indexes of the parameter
 * @param tokens {LexerToken[]} An array of all the tokens from the tag expression
 * @returns {LexerToken[]} tokens with added {@link LexerToken.TYPE.CONDITIONAL_DELIMITER}
 */
LexerParser.prototype.insertConditionalDelimiters = function(indexes, tokens){
	var isDelimPresent = false;
	// check if the delimiters are already present anywhere in these tokens
	for (var i = indexes.sIndex; i <= indexes.lIndex; i++) {
		if (tokens[i].t === LexerToken.TYPE.CONDITIONAL_DELIMITER) {
			isDelimPresent = true;
			break;
		}
	}
	// if not already present, add the delimiters
	if (!isDelimPresent) {
		// insert the closing ] first so that the start index doesn't need to be incremented
		tokens.splice(indexes.lIndex+1, 0, new LexerToken(LexerToken.TYPE.CONDITIONAL_DELIMITER, "]", true));
		tokens.splice(indexes.sIndex, 0, new LexerToken(LexerToken.TYPE.CONDITIONAL_DELIMITER, "[", true));
	}
	return tokens;
};

/**
 * Check if the tokens representing the first parameter of conditional statement forms a valid conditional statement
 * @param paramIndex {Integer} Index of the start of this parameter within the complete expression
 * @param tokens {LexerToken[]} An array of all the tokens from the first parameter of the IF function
 * @param allTokens {LexerToken[]} An array of all the tokens from the complete expression
 * @returns {boolean} true if the expression represented by the tokens is a valid conditional statement, false otherwise
 */
LexerParser.prototype.isValidConditionalStatement = function(paramIndex, tokens, allTokens){
	// checks if there is at least one conditional operator
	var conditionalOpFound = false;
	// check if LHS and RHS of each conditional operator are expressions (non-conditional)
	for (var i = 0; i < tokens.length; i++) {
		if (tokens[i].t === LexerToken.TYPE.CONDITIONAL_OPERATOR) {
			conditionalOpFound = true;
			// check if the conditional operator is directly inside the IF function
			// and not inside another function within IF
			if (!this.validateConditionalOperator(i, tokens)) return false;
		}

		// check for all kinds of operators whether the LHS and RHS are non-conditional normal expressions
		if (tokens[i].t === LexerToken.TYPE.OPERATOR ||
			(tokens[i].t === LexerToken.TYPE.CONDITIONAL_OPERATOR && tokens[i].c !== 'AND' && tokens[i].c !== 'OR')) {
			if (this.isConditionalExpression(this.getLHS(i-1, tokens), tokens)) {
				allTokens[paramIndex+i].v = false;
				allTokens[paramIndex+i].m = {
					key: 'tag-expression-error-invalid_non_conditional_lhs_operand',
					params: {
						operator: allTokens[paramIndex+i].c
					}
				};
				return false;
			}
			if (this.isConditionalExpression(this.getRHS(i+1, tokens), tokens)) {
				allTokens[paramIndex+i].v = false;
				allTokens[paramIndex+i].m = {
					key: 'tag-expression-error-invalid_non_conditional_rhs_operand',
					params: {
						operator: allTokens[paramIndex+i].c
					}
				};
				return false;
			}
		} else if (tokens[i].t === LexerToken.TYPE.CONDITIONAL_OPERATOR){
			// for all conditional operators other than 'AND' and 'OR'
			// LHS and RHS should be conditional expressions
			if (!this.isConditionalExpression(this.getLHS(i-1, tokens), tokens)) {
				allTokens[paramIndex+i].v = false;
				allTokens[paramIndex+i].m = {
					key: 'tag-expression-error-invalid_conditional_lhs_operand',
					params: {
						operator: allTokens[paramIndex+i].c
					}
				};
				return false;
			}
			if (!this.isConditionalExpression(this.getRHS(i+1, tokens), tokens)) {
				allTokens[paramIndex+i].v = false;
				allTokens[paramIndex+i].m = {
					key: 'tag-expression-error-invalid_conditional_rhs_operand',
					params: {
						operator: allTokens[paramIndex+i].c
					}
				};
				return false;
			}
		}

	}
	// When the statement is not conditional, set it as false with the message
	if (!conditionalOpFound) {
		allTokens[paramIndex].v = false;
		allTokens[paramIndex].m = {	key: 'tag-expression-error-invalid_conditional' };
	}
	return conditionalOpFound;
};

/**
 * Check if the conditional operator is inside a Function. They are not allowed outside a function and only allowed
 * in the first parameter of IF() function.
 * @param i {Number[]} Index of the conditional operator in the array of tokens
 * @param tokens {LexerToken[]} An array of all the tokens from the first parameter of the IF function
 * @returns {boolean} true if the conditional operator is directly within an IF function, false otherwise
 */
LexerParser.prototype.validateConditionalOperator = function(i, tokens){
	var stack = [];
	for (var j = i; j >=0; j--) {
		// go back until the stack is empty and an un-closed opening parentheses is found
		if (stack.length == 0 && (tokens[j].t === LexerToken.TYPE.LPAREN)) {
			//go further back to find the first non-whitespace token.
			// this should be a function
			for (var k = j-1; k >=0; k--) {
				if (tokens[k].t === LexerToken.TYPE.WHITESPACE) {
					continue;
				}
				// if first non-whitespace token is not a function, return true, else return false
				return tokens[k].t !== LexerToken.TYPE.FUNCTION;
			}
			return true;
		}

		// pop the last closing parentheses
		if (tokens[j].t === LexerToken.TYPE.LPAREN && stack.length > 0) stack.pop();

		// push closing parentheses
		if (tokens[j].t === LexerToken.TYPE.RPAREN) stack.push(tokens[j].c);
	}
	// no unclosed opening parentheses found, hence the conditional operator is directly inside the IF function
	return true;
};

/**
 * Check if the comma is inside a Function. Commas are only allowed inside functions
 * @param i {Number[]} Index of the comma in the array of tokens
 * @param tokens {LexerToken[]} An array of all the tokens from the first parameter of the IF function
 * @returns {boolean} true if the comma is within a function, false otherwise
 */
LexerParser.prototype.validateComma = function(i, tokens){
	var stack = [];
	for (var j = i; j >=0; j--) {
		// go back until the stack is empty and an un-closed opening parentheses is found
		if (stack.length == 0 && (tokens[j].t === LexerToken.TYPE.LPAREN)) {
			//go further back to find the first non-whitespace token.
			// this should be a function
			for (var k = j-1; k >=0; k--) {
				if (tokens[k].t === LexerToken.TYPE.WHITESPACE) {
					continue;
				}
				// if first non-whitespace token is not a function, return false, else return true
				return tokens[k].t === LexerToken.TYPE.FUNCTION;
			}
			return false;
		}

		// pop the last closing parentheses
		if (tokens[j].t === LexerToken.TYPE.LPAREN && stack.length > 0) stack.pop();

		// push closing parentheses
		if (tokens[j].t === LexerToken.TYPE.RPAREN) stack.push(tokens[j].c);
	}
	// no unclosed opening parentheses found
	return false;
};


/**
 * Get the start and end indexes of the LHS expression for a given conditional operator
 * @param i {number} index of the first token to the left of the conditional operator
 * @param tokens {LexerToken[]} An array of all the tokens from the tag expression
 * @returns {object} sIndex is the start index and lIndex is the last index of the LHS param
 */
LexerParser.prototype.getLHS = function(i, tokens){
	var stack = [];
	for (var j = i; j >=0; j--) {
		// go back until the stack is empty and either:
		// an un-closed opening parentheses is found or any operator is found
		// eg. (a<b)>=(c<d)
		// eg. a < b >= c < d
		if (stack.length == 0 && (tokens[j].t === LexerToken.TYPE.LPAREN
			|| tokens[j].t === LexerToken.TYPE.OPERATOR || tokens[j].t === LexerToken.TYPE.CONDITIONAL_OPERATOR)) return { sIndex: j+1, lIndex: i };

		// pop the last closing parentheses
		if (tokens[j].t === LexerToken.TYPE.LPAREN && stack.length > 0) stack.pop();

		// push closing parentheses
		if (tokens[j].t === LexerToken.TYPE.RPAREN) stack.push(tokens[j].c);
	}
	// no unclosed opening parentheses found, so LHS begins from the first index
	return { sIndex: 0, lIndex: i };
};

/**
 * Get the start and end indexes of the RHS expression for a given conditional operator
 * @param i {number} index of the first token to the right of the conditional operator
 * @param tokens {LexerToken[]} An array of all the tokens from the tag expression
 * @returns {object} sIndex is the start index and lIndex is the last index of the RHS param
 */
LexerParser.prototype.getRHS = function(i, tokens){
	var stack = [];
	for (var j = i; j <=tokens.length-1; j++) {
		// go forward until the stack is empty and either:
		// an un-closed closing parentheses is found or an operator is found
		// eg. (a<b)>=(c<d)
		// eg. a < b >= c < d
		if (stack.length == 0 && (tokens[j].t === LexerToken.TYPE.RPAREN
			|| tokens[j].t === LexerToken.TYPE.OPERATOR || tokens[j].t === LexerToken.TYPE.CONDITIONAL_OPERATOR)) return { sIndex: i, lIndex: j-1 };

		// pop the last closing parentheses
		if (tokens[j].t === LexerToken.TYPE.RPAREN && stack.length > 0) stack.pop();

		// push opening parentheses
		if (tokens[j].t === LexerToken.TYPE.LPAREN) stack.push(tokens[j].c);
	}
	// no unclosed closing parentheses found, so RHS ends till the last index
	return { sIndex: i, lIndex: tokens.length-1 };
};

/**
 * Check if the given tokens confirm to a conditional expression
 * @param indexes {object} An object with the sIndex and lIndex for start and end indexes
 * @param tokens {LexerToken[]} An array of all the tokens from the tag expression
 * @returns {boolean} true if the tokens have a conditional operator, false if there are no conditional
 * operators
 */
LexerParser.prototype.isConditionalExpression = function(indexes, tokens){
	if(!indexes) return false;

	// if there is any conditional operator in the range, this is a conditional expression
	for (var i = indexes.sIndex; i <= indexes.lIndex; i++) {
		if (tokens[i].t === LexerToken.TYPE.CONDITIONAL_OPERATOR) return true;
	}
	return false;
};

/**
 * Check if the conditional operator is in the right place
 * Looks backwards in the expression to see if it is preceded by an IF function
 * Looks forward in the expression to see if it is followed by a comma (should be only in the first param of IF)
 * @param i {number} index of the conditional operator token
 * @param tokens {LexerToken[]} An array of all the tokens from the tag expression
 * @returns {boolean} true if the conditional operator is in a valid place in the expression, false otherwise
 * operators
 */
LexerParser.prototype.isConditionalOpValid = function (i, tokens) {
	var ifFnFound = false;
	var stack = [];
	for (var j = i; j >=0; j--) {
		if (stack.length == 0 && tokens[j].t === LexerToken.TYPE.FUNCTION && tokens[j].c === ':IF') {
			ifFnFound = true;
			break;
		}
		// comma found outside any embedded expression, which means this is not in the first param
		if (stack.length == 0 && tokens[j].t === LexerToken.TYPE.COMMA) break;

		// pop the last opening parentheses
		if (tokens[j].t === LexerToken.TYPE.LPAREN && stack.length > 0) stack.pop();

		// push opening parentheses
		if (tokens[j].t === LexerToken.TYPE.RPAREN) stack.push(tokens[j].c);
	}

	if (ifFnFound) {
		stack = [];
		for (var k = i; k <tokens.length-1; k++) {
			// go forward until the stack is empty and an un-closed closing parentheses is found
			if (stack.length == 0 && tokens[k].t === LexerToken.TYPE.COMMA) return true;

			// pop the last closing parentheses
			if (tokens[k].t === LexerToken.TYPE.RPAREN && stack.length > 0) stack.pop();

			// push closing parentheses
			if (tokens[k].t === LexerToken.TYPE.LPAREN) stack.push(tokens[k].c);
		}
	}
	return false;
};

/**
 * Check validity of token at the index in the list of tokens
 * @param tokens {LexerToken[]} An array of all the tokens from the tag expression
 * @param type {LexerToken.TYPE} Type of the token to validate
 * @param index {number} index of the token in the list of tokens
 * @returns {boolean} true if the token is valid and follows the rules {@link LexerToken.RULES}, false otherwise
 */
LexerParser.prototype.checkValidity = function(tokens, type, index){


	//In case of Tag if it is not a valid tag do not perform additional checks
	if(type === LexerToken.TYPE.TAG && tokens[index].v == false) {
		if(!tokens[index].m) tokens[index].m = { key: 'tags_tag-expression-error-tag' };
		return false;
	}

	//In case of Expression if it is not a valid expression do not perform additional checks
	if(type === LexerToken.TYPE.EXPRESSION && tokens[index].v == false) {
		if(!tokens[index].m) tokens[index].m = { key: 'tags_tag-expression-error-expression' };
		return false;
	}

	// for functions, handle the validation separately
	if(type === LexerToken.TYPE.FUNCTION) return this.validateFunction(tokens, type, index);

	// for conditional operators, handle the validation separately
	// return if the operator is in an invalid location
	if(type === LexerToken.TYPE.CONDITIONAL_OPERATOR && !this.isConditionalOpValid(index, tokens)) {
		tokens[index].v = false;
		if(!tokens[index].m)
			tokens[index].m = {
				key: 'tag-expression-error-invalid_conditional_operator_location',
				params: {
					operator: tokens[index].c
				}
			};
		return false;
	}

	if(type === LexerToken.TYPE.COMMA && !this.validateComma(index, tokens)) {
		tokens[index].v = false;
		if(!tokens[index].m) tokens[index].m = { key: 'tag-expression-error-invalid_comma_location' };
		return false;
	}

	var rules = LexerToken.RULES[type];

	// If no rules are defined, return true
	if(!rules) {
		return true;
	}

	var validPre = false; // validate if there is a valid character preceding this token
	var allLeadingSpaces = true; // check if all characters preceding this token are whitespaces
	//look at tokens before the current token
	for (var k = index-1; k >= 0; k--) {
		if (tokens[k].t === LexerToken.TYPE.WHITESPACE) {
			continue;
		}
		allLeadingSpaces = false;
		if (rules.preTokens.indexOf(tokens[k].t) > -1) {
			validPre = true;
			break;
		} else{
			validPre = false;
			tokens[index].v = false;
			if(!tokens[index].m)
				tokens[index].m = {
					key: 'tag-expression-error-invalid_token_before',
					params: {
						beforeToken: LexerToken.TYPE_NAMES[tokens[k].t],
						currentToken: LexerToken.TYPE_NAMES[tokens[index].t],
						tokenValue: tokens[index].c
					}
				};
			break;
		}
	}
	if(rules.canStart && allLeadingSpaces){
		validPre = true;
	}

	var validPost = false;
	var allTrailingSpaces = true;
	//look at tokens after the current token
	for (var i = index+1; i < tokens.length; i++) {
		if (tokens[i].t === LexerToken.TYPE.WHITESPACE){
			continue;
		}
		allTrailingSpaces = false;
		if (rules.postTokens.indexOf(tokens[i].t) > -1) {
			validPost = true;
			break;
		}else{
			validPost = false;
			tokens[index].v = false;
			if(!tokens[index].m)
				tokens[index].m = {
					key: 'tag-expression-error-invalid_token_after',
					params: {
						afterToken: LexerToken.TYPE_NAMES[tokens[i].t],
						currentToken: LexerToken.TYPE_NAMES[tokens[index].t],
						tokenValue: tokens[index].c
					}
				};
			break;
		}
	}

	if(rules.canEnd && allTrailingSpaces){
		validPost = true;
	}

	if ((!validPre || !validPost) && !tokens[index].m) {
		tokens[index].v = false;
		tokens[index].m = { key: 'tag-expression-error-invalid_expression' };
	} else if (validPre && validPost && tokens[index].v !== false) {
		tokens[index].v = true;
	}
	return validPre && validPost;
};

LexerParser.prototype.getValidAsset = function(s, p){

	var j = p;

	for (var k = p-1; k >= 0; k--) {
		if(s.charAt(k) === LexerToken.SPECIALCHAR.ASSET){
			break;
		} else{
			j--;
		}
	}

	var n = s.indexOf(LexerToken.SPECIALCHAR.TAG, j);
	if(n == -1){
		n = p;
	}

	return s.substring(j, n);
};

LexerParser.prototype.getValidAsset = function(s, p){

	var j = p;

	for (var k = p-1; k >= 0; k--) {
		if(s.charAt(k) === LexerToken.SPECIALCHAR.ASSET){
			break;
		} else{
			j--;
		}
	}

	var n = s.indexOf(LexerToken.SPECIALCHAR.TAG, j);
	if(n == -1){
		n = p;
	}

	return s.substring(j, n);
};


module.exports = {
	LexerParser,
	LexerToken
};
