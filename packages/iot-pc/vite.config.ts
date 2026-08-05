import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { presetIcons } from 'unocss'
import Unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'
import { injectHtml } from 'vite-plugin-html'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import loading from './sk/loading'
import CopyAfterBuild from '../plugin/vite-plugin-copy-after-build'
import { visualizer } from 'rollup-plugin-visualizer'

const OUTPUT = './output'
const ENV_DIR = './envs'

export default ({ mode }: any) => {
  process.env = { ...process.env, ...loadEnv(mode, path.resolve(process.cwd(), ENV_DIR)) }

  return defineConfig({
    base: '/' + (process.env.VITE_APP_WEB_PREFIX || ''),
    envDir: ENV_DIR,
    server: {
      host: '0.0.0.0',
      port: 8008,
      proxy: {
        '/api': {
          target: 'http://localhost:8899',
          secure: false,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        //  图片资源代理
        '/oss': {
          target: 'http://localhost:9000/',
          secure: false,
          changeOrigin: true,
          rewrite: (path) => {
            return path.replace(/^\/oss/, '')
          }
        }
      }
    },
    preview: {
      proxy: {
        '/iot-api': {
          target: 'http://localhost:9998',
          secure: false,
          changeOrigin: true
        }
      }
    },
    build: {
      emptyOutDir: true,
      outDir: '../../dist/pc'
    },
    esbuild: {
      drop: mode === 'dev' || mode === 'debug' ? [] : ['console', 'debugger']
    },
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util', '@ffmpeg/core']
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'legacy',
          silenceDeprecations: ['legacy-js-api']
        }
      }
    },
    plugins: [
      vue(),
      vueJsx(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/icons')],
        symbolId: 'icon-[name]'
      }),
      AutoImport({
        imports: ['vue', 'vue-router'],
        dts: path.resolve(__dirname, OUTPUT, 'dts/auto-import.d.ts')
      }),
      Components({
        dts: path.resolve(__dirname, OUTPUT, 'dts/components.d.ts'),
        resolvers: [
          IconsResolver({
            // prefix: false,
            enabledCollections: ['ep']
          }),
          ElementPlusResolver()
        ]
      }),
      injectHtml({
        injectData: {
          sk: loading(process.env.VITE_APP_THEME_COLOR),
          title: process.env.VITE_APP_TITLE,
          jessibuca: '<script src="/jessibuca/jessibuca.js"></script>'
        }
      }),
      Icons({ autoInstall: true }),
      Unocss({
        presets: [
          presetIcons({
            scale: 1.2,
            warn: true
          })
        ],
        //<i-ep-xx />
        variants: [
          {
            match: (s) => {
              if (s.startsWith('i-')) {
                return {
                  matcher: s,
                  selector: (s) => {
                    return s.startsWith('.') ? `${s.slice(1)},${s}` : s
                  }
                }
              }
            }
          }
        ]
      }),
      CopyAfterBuild({ mode }),
      visualizer({ filename: `${OUTPUT}/stats.html` })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        plugin: fileURLToPath(new URL('../plugin', import.meta.url))
      }
    },
    define: {
      __tools: 'window.__arc_pc_tools',
      __appType: JSON.stringify(process.env.VITE_APP_TYPE),
      __appTitle: JSON.stringify(process.env.VITE_APP_TITLE)
    }
  })
}
