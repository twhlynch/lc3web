import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import fetch from 'node-fetch';
import { commands } from './commands.js';

const path = fileURLToPath(new URL('../../.env', import.meta.url));
if (existsSync(path)) process.loadEnvFile(path);

const { DISCORD_TOKEN, DISCORD_APPLICATION_ID } = process.env;
if (!DISCORD_TOKEN || !DISCORD_APPLICATION_ID) {
	throw new Error('DISCORD_TOKEN and DISCORD_APPLICATION_ID are required.');
}

const application_url = `https://discord.com/api/v10/applications/${DISCORD_APPLICATION_ID}/commands`;

const response = await fetch(application_url, {
	method: 'PUT',
	headers: {
		'Content-Type': 'application/json',
		Authorization: `Bot ${DISCORD_TOKEN}`,
	},
	body: JSON.stringify(commands),
});

if (!response.ok) throw new Error(await response.text());
