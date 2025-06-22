import { defineConfig } from 'eslint/config'
import js from '@eslint/js'

export default defineConfig([
	{ 
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: { js },
    extends: ['js/recommended'],
    rules: {
			'no-unused-vars': 'warn',
			'no-undef': 'warn',
      'quotes': ['warn', 'single'],
      'semi': ['warn', 'never'],
      'comma-dangle': ['warn', 'never']
		}
  }
])

