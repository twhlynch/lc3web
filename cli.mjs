// @ts-check

import { readFileSync, writeFileSync } from 'node:fs';
import { exit } from 'node:process';
import assemble from './src/lc3_as.js';
import LC3 from './src/lc3_core.js';

/** @param filePath {string} */
function loadObjectFile(filePath) {
	const raw = new Uint8Array(readFileSync(filePath));

	// endianness is reversed in object file
	const data = new Array(raw.length / 2);
	for (let i = 0; i < data.length; i++) {
		const lo = raw[2 * i + 1];
		const hi = raw[2 * i] << 8;
		data[i] = lo | hi;
	}

	// load into lc3 memory
	const lc3 = new LC3();
	const orig = data[0];
	for (let i = 1; i < data.length; i++) {
		lc3.setMemory(orig + i - 1, data[i]);
	}
	lc3.setRegister('pc', orig);

	return lc3;
}

/** @param lc3 {LC3} */
function simulateLC3(lc3) {
	const output = [];

	lc3.addListener(
		/** @param ev {{ type: string, value: number }} */
		(ev) => {
			if (ev.type === 'keyout') {
				output.push(String.fromCharCode(ev.value));
			} else if (ev.type === 'print') {
				output.push(ev.value);
			}
		},
	);

	let instructions = 0;
	while (lc3.isRunning()) {
		lc3.nextInstruction();
		instructions++;
	}

	process.stdout.write(output.join(''));
}

/** @param source {string} @param output {string} */
function assembleSourceToObjectFile(source, output) {
	const text = readFileSync(source, 'utf-8');
	const result = assemble(text);

	if (result.error) {
		throw new Error(`Assembly error:\n  ${result.error.join('\n  ')}`);
	}

	// build buffer big endian
	const words = [result.orig].concat(result.machineCode);
	const buf = Buffer.alloc(2 * words.length);
	for (let i = 0; i < words.length; i++) {
		buf.writeUInt16BE(words[i], 2 * i);
	}

	writeFileSync(output, buf);
}

/** @returns {1 | 0} */
function main() {
	const args = process.argv.slice(2);

	// assemble source to output
	if (args[0] === '--assemble') {
		const src = args[1];
		const out = args[2];

		if (src && out) {
			assembleSourceToObjectFile(src, out);
			return 0;
		}
	}

	// simulate object file
	else if (args[0] === '--simulate') {
		const file = args[1];

		if (file) {
			simulateLC3(loadObjectFile(file));
			return 0;
		}
	}

	console.error(`Usage:
    node cli.mjs --assemble <src> <out>    Assemble <src> to <out>
    node cli.mjs --simulate <file.obj>     Run an assembled object file`);

	return 1;
}

try {
	exit(main());
} catch (e) {
	console.error(e instanceof Error ? e.message : e);
	exit(1);
}
