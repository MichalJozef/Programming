import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';

export default {
    input: 'src/main.js',
    output: {
        file: 'public/bundle.js',
        format: 'iife',
        name: 'MyApp'
    },
    plugins: [resolve(), svelte({})]
};