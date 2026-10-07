import assemble from '@lc3/sim/lc3_as.js';
import LC3 from '@lc3/sim/lc3_core.js';
import { reset } from '@lc3/sim/world.js';
import { Code, Limits } from './constants';

export function runLC3(code: string, input = ''): string {
	// message limit - formatting - error message buffer
	const max_output_length = Limits.DiscordMessageMax - Code.Prefix.length - Code.Suffix.length - 50;

	const result = assemble(code);
	if (result.error) throw new Error(result.error.join('\n'));

	const lc3 = new LC3();

	lc3.loadAssembled(result);
	for (const byte of new TextEncoder().encode(input)) {
		lc3.sendKey(byte);
	}
	const decoder = new TextDecoder();
	let output = '';

	lc3.addListener((event: { type: string; value?: number | string }) => {
		if (output.length >= max_output_length) return;

		if (event.type === 'keyout') {
			output += decoder.decode(new Uint8Array([event.value as number]), { stream: true });
		} else if (event.type === 'print') {
			output += event.value as string;
		}

		output = output.slice(0, max_output_length);
	});

	reset();
	try {
		let steps = 0;
		let inputExhausted = false;

		while (lc3.isRunning() && steps < Limits.LC3MaxSteps && output.length < max_output_length) {
			const instruction = lc3.getMemory(lc3.pc);
			if (
				(instruction === 0xf020 || instruction === 0xf023) &&
				lc3.bufferedKeys.isEmpty() &&
				(lc3.getMemory(lc3.kbsr) & 0x8000) === 0
			) {
				inputExhausted = true;
				break;
			}
			lc3.nextInstruction();
			steps++;
		}

		output = (output + decoder.decode()).slice(0, max_output_length);
		if (output.length >= max_output_length) {
			output += '\n[Output limit reached]';
		} else if (inputExhausted) {
			output += '\n[Input exhausted. Run again with more input.]';
		} else if (lc3.isRunning()) {
			output += '\n[Instruction limit reached]';
		}

		return output;
	} finally {
		reset();
	}
}
