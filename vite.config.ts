import { defineConfig } from 'vite';

// // https://vitejs.dev/config/
// export default defineConfig({
//   build: {
//     lib: {
//       entry: "src/my-element.ts",
//       formats: ["es"],
//     },
//     rollupOptions: {
//       // external: /^lit/
//       input: {
//         main: "./index.html",
//       },
//     },
//   },
//   resolve: {
//     alias: {
//       "@deepstream/client": "@deepstream/client/dist/bundle/ds.min.js",
//     },
//   },
// });

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'deepstream.io-mobx',
      formats: ['es'],
      fileName: format => `deepstream.io-mobx.${format}.js`,
    },
    rollupOptions: {
      external: ['@deepstream/client', 'mobx', 'mobx-utils'],
      // output: {
      //   // Provide global variables to use in the UMD build
      //   // Add external deps here
      //   globals: {
      //     vue: 'Vue',
      //   },
      // },
    },
    sourcemap: true,
    minify: false,
  },
  resolve: {
    alias: {
      '@deepstream/client': '@deepstream/client/dist/bundle/ds.min.js',
    },
  },
});
