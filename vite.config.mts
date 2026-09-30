import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ mode }) => {
  // Cloudflare Pages injects env vars directly into process.env
  // Also support loadEnv for local development
  const chatApiUrl = (process.env.VITE_CHAT_API_URL || loadEnv(mode, root).VITE_CHAT_API_URL || "https://chat-app-production-79fb.up.railway.app").replace(/\/+$/, "");
  const remoteDemosUrl = process.env.VITE_REMOTE_DEMOS_URL || loadEnv(mode, root).VITE_REMOTE_DEMOS_URL || "http://localhost:3001/remoteEntry.js";

  return {
    plugins: [
      react(),
      federation({
        name: "main_app",
        filename: "remoteEntry.js",
        remotes: {
          demos: {
            name: "demos",
            type: "module",
            entry: remoteDemosUrl,
          },
        },
        shared: {
          react: { singleton: true, requiredVersion: "^18.3.1" },
          "react-dom": { singleton: true, requiredVersion: "^18.3.1" },
          "react-router-dom": { singleton: true, requiredVersion: "^7.18.2" },
        },
        dts: false,
      }),
    ],
    resolve: {
      alias: [
        {
          find: /^@\/src\//,
          replacement: fileURLToPath(new URL("./src/", import.meta.url)),
        },
        {
          find: /^@\//,
          replacement: fileURLToPath(new URL("./src/", import.meta.url)),
        },
      ],
    },
    server: {
      port: 3000,
      proxy: {
        "/api": "http://localhost:4001",
        // Chat backend REST, proxied in dev to sidestep its CORS allow-list.
        "/chat-api": {
          target: chatApiUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/chat-api/, "/api"),
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 900,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: "three",
                test: /node_modules[\\/](three|@react-three)[\\/]/,
                priority: 20,
              },
              {
                name: "code-highlight",
                test: /node_modules[\\/](react-syntax-highlighter|refractor|prismjs|highlight\.js|lowlight)[\\/]/,
                priority: 20,
              },
            ],
          },
        },
      },
    },
  };
});
