import { EditorState } from '@codemirror/state';
import {
	EditorView,
	keymap,
	lineNumbers,
	highlightActiveLine,
	highlightActiveLineGutter,
} from '@codemirror/view';
import {
	defaultKeymap,
	history,
	historyKeymap,
	indentMore,
	indentLess,
	toggleComment,
} from '@codemirror/commands';
import {
	bracketMatching,
	foldGutter,
	indentOnInput,
	indentUnit,
} from '@codemirror/language';
import {
	autocompletion,
	closeBrackets,
	closeBracketsKeymap,
	completionKeymap,
	acceptCompletion,
} from '@codemirror/autocomplete';

import { lc3 } from './lc3-language.js';

let assemblyEditor = null;

export function initAssemblyEditor() {
	if (assemblyEditor) return;

	const container = document.getElementById('assembly-input');
	if (!container) return;
	container.innerHTML = '';

	const state = EditorState.create({
		doc: '',
		extensions: [
			lineNumbers(),
			highlightActiveLine(),
			highlightActiveLineGutter(),
			history(),
			foldGutter(),
			indentOnInput(),
			indentUnit.of('    '),
			bracketMatching(),
			closeBrackets(),
			lc3(),
			keymap.of([
				{ key: 'Ctrl-/', run: toggleComment },
				{ key: 'Mod-/', run: toggleComment },
			]),
			autocompletion({
				activateOnTyping: true,
			}),
			keymap.of([
				{
					key: 'Tab',
					run: (view) => {
						if (acceptCompletion(view)) return true;
						return indentMore(view);
					},
				},
				{ key: 'Shift-Tab', run: indentLess },
				...defaultKeymap,
				...historyKeymap,
				...closeBracketsKeymap,
				...completionKeymap,
			]),
			EditorView.theme({
				'&': { height: '400px' },
				'.cm-scroller': { overflow: 'auto' },
				'&.cm-focused': { outline: 'none' },
			}),
		],
	});

	assemblyEditor = new EditorView({ state, parent: container });
}

export function getAssemblyCode() {
	if (!assemblyEditor) return '';
	return assemblyEditor.state.doc.toString();
}

export function setAssemblyCode(code) {
	if (!assemblyEditor) return;
	assemblyEditor.dispatch({
		changes: {
			from: 0,
			to: assemblyEditor.state.doc.length,
			insert: code,
		},
	});
}

export function destroyAssemblyEditor() {
	if (assemblyEditor) {
		assemblyEditor.destroy();
		assemblyEditor = null;
	}
}
