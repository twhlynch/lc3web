// simulate a superflat minecraft world with consistent getb, setb, geth

const MAX_HEIGHT = 319;
const MIN_HEIGHT = -64;

const AIR = 0;
const GRASS = 2;
const DIRT = 3;
const BEDROCK = 7;

const blocks = new Map();

function key(x, y, z) {
	return `${x},${y},${z}`;
}

function fallback(_x, y, _z) {
	if (y == MIN_HEIGHT + 3) return GRASS;
	if (y == MIN_HEIGHT + 2) return DIRT;
	if (y == MIN_HEIGHT + 1) return DIRT;
	if (y == MIN_HEIGHT) return BEDROCK;

	return AIR;
}

export function reset() {
	blocks.clear();
}

export function setb(x, y, z, id) {
	if (y < MIN_HEIGHT || y > MAX_HEIGHT) return;
	blocks.set(key(x, y, z), id);
}

export function getb(x, y, z) {
	const block = blocks.get(key(x, y, z));

	if (block !== undefined) return block;

	return fallback(x, y, z);
}

export function geth(x, z) {
	for (let y = MAX_HEIGHT; y >= MIN_HEIGHT; y--) {
		const id = getb(x, y, z);
		if (id !== AIR) return y;
	}

	return MIN_HEIGHT;
}
