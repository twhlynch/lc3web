// @ts-check

import { readFileSync, writeFileSync } from 'node:fs';
import { exit } from 'node:process';
import assemble from './src/lc3_as.js';
import LC3 from './src/lc3_core.js';

/** @param lc3 {LC3} */
async function simulateLC3(lc3) {
	let input = '';
	let inputIndex = 0;

	if (process.stdin.isTTY) {
		// setup terminal raw mode
		process.stdin.setRawMode(true);
		process.stdin.resume(); // stind starts paused
		process.stdin.setEncoding('utf-8');
		process.stdin.on(
			'data',
			/** @param chunk {string} */
			(chunk) => {
				for (const ch of chunk) {
					const code = ch.charCodeAt(0);
					if (code === 3) process.exit(130); // SIGINT
					lc3.sendKey(code);
				}
			},
		);
	} else {
		const chunks = [];
		for await (const chunk of process.stdin) {
			chunks.push(chunk);
		}
		input = chunks.join('');
	}

	const utf8 = new TextDecoder();

	lc3.addListener(
		/** @param ev {{ type: 'keyout', value: number } | { type: 'print', value: string }} */
		(ev) => {
			if (ev.type === 'keyout') {
				const result = utf8.decode(new Uint8Array([ev.value]), {
					stream: true,
				});
				if (result) process.stdout.write(result);
			} else if (ev.type === 'print') {
				process.stdout.write(ev.value);
			}
		},
	);

	while (lc3.isRunning()) {
		lc3.nextInstruction();

		if (process.stdin.isTTY) {
			if (lc3.bufferedKeys.isEmpty()) {
				// yield to event loop for io
				await new Promise((resolve) => setTimeout(resolve, 0));
			}
		} else {
			if (lc3.bufferedKeys.isEmpty() && inputIndex < input.length) {
				lc3.sendKey(input.charCodeAt(inputIndex++));
			}
		}
	}

	// restore terminal
	if (process.stdin.isTTY) {
		process.stdin.setRawMode(false);
	}
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

/** @returns {Promise<1 | 0>} */
async function main() {
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
			await simulateLC3(loadObjectFile(file));
			return 0;
		}
	}

	console.error(`Usage:
    node cli.mjs --assemble <src> <out>    Assemble <src> to <out>
    node cli.mjs --simulate <file.obj>     Run an assembled object file`);

	return 1;
}

main()
	.then((code) => exit(code))
	.catch((e) => {
		console.error(e instanceof Error ? e.message : e);
		exit(1);
	});
