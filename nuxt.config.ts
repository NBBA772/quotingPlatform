export default defineNuxtConfig({
  devtools: false,
  // Keep build artifacts out of the dev file watcher — chokidar 4 uses one
  // file descriptor per watched file on macOS, and .output alone has ~4k files
  ignore: ['.output/**', 'uploads/**'],
  watchers: {
    chokidar: {
      ignored: ['**/.output/**', '**/uploads/**', '**/node_modules/**', '**/.git/**'],
    },
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  components: {
    dirs: [
      {
        path: '~/components',
        global: true,
        pathPrefix: false,
        preload: true,
      },
    ],
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxt/content',
    'nuxt-icon',
    '@nuxt/image',
    '@nuxt/test-utils/module',
  ],
  css: [
    '~/assets/css/swagger.css',   
  ],
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    injectPosition: 0,
    viewer: true,
  },
  colorMode: {
    classSuffix: '',
  },
  content: {
    highlight: {
      theme: 'github-dark',
      preload: ['vue'],
    },
    navigation: {
      fields: ['author', 'subject', 'position'],
    },
  },
  runtimeConfig: {
    private: {
      stripeSecretKey: process.env.STRIPE_SECRET_KEY,
      db: process.env.DATABASE_URL,
    },
    public: {
      uploadsPath: '/uploads',
      GHL_API_KEY: process.env.GHL_API_KEY,
      appDomain: process.env.APP_DOMAIN,
      gitHash: process.env.GITHUB_SHA,
      releaseVersion: process.env.RELEASE_VERSION,
    },
  },
  experimental: {
    writeEarlyHints: false,
  },
  compatibility: {
    date: '2025-04-08',
  },
  nitro: {
    serveStatic: true,
    publicAssets: [
      {
        baseURL: '/uploads', // URL path to access the files. not needed
        dir: './uploads',    // Directory relative to the root of the project
      },
    ],
  },
  
vite: {
  server: {
    allowedHosts: [
      'businessbenefitalliance.com',
      'localhost',
      'e62561302452.ngrok-free.app',
    ],
    hmr: {
      protocol: "http",
      host: true,
      port: 3000,
      clientPort: 3000,
    },
  },
},
});
