const esbuild = require('esbuild');

const watch = process.argv.includes('--watch');
const minify = process.argv.includes('--minify');

// Create the build configuration
const buildOptions = {
	entryPoints: ['./src/extension.ts'],
	bundle: true,
	outfile: 'dist/extension.js',
	external: ['vscode'],
	format: 'cjs',
	platform: 'node',
	target: 'node14',
	minify: minify,
};

// Handle watch mode separately
if (watch) {
	esbuild.context(buildOptions).then(context => {
		context.watch();
	});
} else {
	esbuild.build(buildOptions).catch(() => process.exit(1));
}
