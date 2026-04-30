import {
	LanguageSupport,
	syntaxHighlighting,
	HighlightStyle,
} from '@codemirror/language';
import { StreamLanguage } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { completeFromList } from '@codemirror/autocomplete';

const REGISTERS = /^[rR][0-7]\b/;

const BRANCH_OPS = /^(?:brn?z?p?|brnzp|brnz|brnp|brzp|brn|brz|brp|br)\b/i;

const CONTROL_OPS = /^(?:jmp|ret|jsr|jsrr|rti|push|pop|call|rets)\b/i;

const TRAP_OPS =
	/^(?:trap|getc|out|puts|in|halt|putn|reg|chat|getp|setp|getb|setb|geth|putsp)\b/i;

const LOGIC_OPS = /^(?:not|and|add)\b/i;

const DATAMV_OPS = /^(?:ldr?i?|str?i?|lea)\b/i;

const PSEUDO_OPS = /^\.(orig|fill|blkw|stringz|end)\b/i;

const HEX_NUM = /^(?:0?x[0-9a-f]{1,4})\b/i;

const DEC_NUM = /^#-?[0-9]+/;

const tokeniser = {
	token(stream, _) {
		// whitespace
		if (stream.eatSpace()) return null;

		// line comment
		if (stream.eat(';')) {
			stream.skipToEnd();
			return 'comment';
		}

		// string literals
		if (stream.eat('"')) {
			while (!stream.eol()) {
				if (stream.eat('\\')) {
					stream.next();
					continue;
				}
				if (stream.eat('"')) break;
				stream.next();
			}
			return 'string';
		}

		// numbers
		if (stream.match(HEX_NUM)) return 'number';
		if (stream.match(DEC_NUM)) return 'number';

		// registers
		if (stream.match(REGISTERS)) return 'variableName';

		// pseudo-ops
		if (stream.peek() === '.') {
			if (stream.match(PSEUDO_OPS)) return 'keyword';
		}

		// opcodes
		if (stream.match(BRANCH_OPS)) return 'controlKeyword';
		if (stream.match(CONTROL_OPS)) return 'controlKeyword';
		if (stream.match(TRAP_OPS)) return 'operatorKeyword';
		if (stream.match(LOGIC_OPS)) return 'logicOperator';
		if (stream.match(DATAMV_OPS)) return 'definitionKeyword';

		// labels / identifiers
		if (stream.match(/^[A-Za-z_][A-Za-z0-9_]*/)) {
			if (stream.peek() === ':') {
				stream.eat(':');
				return 'labelName';
			}
			return 'name';
		}

		// punctuation
		if (stream.eat(',')) return 'punctuation';
		if (stream.eat(':')) return 'punctuation';

		// unknown
		stream.next();
		return null;
	},
	startState() {
		return {};
	},
	copyState(s) {
		return { ...s };
	},
	languageData: {
		commentTokens: { line: ';' },
		closeBrackets: { brackets: ['"'] },
		autocomplete,
	},
};

const highlighter = HighlightStyle.define([
	// branch
	{ tag: t.controlKeyword, color: '#8772fd' },
	// traps
	{ tag: t.operatorKeyword, color: '#4275FF' },
	// arithmetic
	{ tag: t.logicOperator, color: '#4275FF' },
	// memory
	{ tag: t.definitionKeyword, color: '#4275FF' },
	// pseudo-ops
	{ tag: t.keyword, color: '#fd7287' },
	// registers
	{ tag: t.variableName, color: '#7287fd' },
	// numbers
	{ tag: t.number, color: '#fd8772' },
	// strings
	{ tag: t.string, color: '#fd8772', fontStyle: 'italic' },
	// comments
	{ tag: t.comment, color: '#B0B0B0', fontStyle: 'italic' },
	// labels
	{ tag: t.labelName, color: '#333333' },
	{ tag: t.name, color: '#333333' },
	// punctuation
	{ tag: t.punctuation, color: '#333333' },
]);

// prettier-ignore
const tokens = [
	// logic
	'add', 'and', 'not',
	// load
	'ld', 'ldi', 'ldr', 'lea',
	// store
	'st', 'sti', 'str',
	// branch
	'br', 'brn', 'brz', 'brp', 'brnz', 'brnp', 'brzp', 'brnzp',
	// jump
	'jmp', 'ret', 'jsr', 'jsrr', 'rti',
	// traps
	'trap', 'getc', 'out', 'puts', 'in', 'putsp', 'halt',
	// pseudo-ops
	'.ORIG', '.END', '.FILL', '.BLKW', '.STRINGZ',
	// minecraft
	'chat', 'getp', 'setp', 'getb', 'setb', 'geth',
	// debug
	'reg', 'putn',
	// registers
	'r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7',
];

const language = StreamLanguage.define(tokeniser);

function autocomplete(context) {
	const word = context.matchBefore(/[\w.#]*/);
	if (!word || (word.from === word.to && !context.explicit)) return null;
	const snippets = tokens.map((snippet) => ({
		label: snippet,
		apply: snippet,
		boost: 1,
	}));
	return completeFromList(snippets)(context);
}

export function lc3() {
	return new LanguageSupport(language, [
		syntaxHighlighting(highlighter),
		language.data.of({ autocomplete }),
	]);
}
