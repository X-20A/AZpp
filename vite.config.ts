import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'), // '@'を'src'にマッピング
        },
    },
    build: {
        rollupOptions: {
            input: {
                main: '/src/main.ts', // content_scriptとして使用するエントリポイント
            },
            output: {
                entryFileNames: 'main.js', // 出力ファイル名を指定
            },
        },
    },
});
