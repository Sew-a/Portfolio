declare module '*.scss' {
  const content: undefined;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_REMOTE_DEMOS_URL?: string;
  readonly VITE_CHAT_API_URL?: string;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.css' {
  const content: undefined;
  export default content;
}
