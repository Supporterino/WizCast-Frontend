import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import {tanstackConfig} from '@tanstack/eslint-config';
import pluginQuery from '@tanstack/eslint-plugin-query';

export default tseslint.config(eslint.configs.recommended, ...pluginQuery.configs['flat/recommended'], ...tanstackConfig, {
    rules: {
        '@tanstack/query/exhaustive-deps': 'off',
    },
}, {
    ignores: ['**/node_modules/', '**/dist/', '**/env.d.ts', '**/src-tauri/', '**/vite.config.ts', '**/postcss.config.cjs', '**/eslint.config.mjs',],
});
