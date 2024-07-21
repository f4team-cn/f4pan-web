/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_URL: string;
}

interface ImportMate {
	readonly env: ImportMetaEnv;
}