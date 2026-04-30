import { defineConfig } from 'vite';
import { resolve } from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
	root: '.',
	plugins: [
		createHtmlPlugin({
			minify: {
				collapseWhitespace: true,
				conservativeCollapse: true,
				removeComments: true,
			},
		}),
	],
	build: {
		outDir: 'dist',
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html'),
			},
		},
	},
	optimizeDeps: {
		include: ['jquery', 'bootstrap'],
	},
});
