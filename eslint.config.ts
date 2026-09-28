import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'src-tauri/target/**', 'src-tauri/gen/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{ts,vue}'],
    languageOptions: { globals: globals.browser, parserOptions: { parser: tseslint.parser } },
    rules: { 'vue/multi-word-component-names': 'off' },
  },
  skipFormatting,
)
