
import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin';

export const tributestreamTheme01: CustomThemeConfig = {
    name: 'tributestream-theme-01',
    properties: {
		// =~= Theme Properties =~=
 

		"--theme-font-family-base": `'ABeeZee', sans-serif`,
		"--theme-font-family-heading": `'ABeeZee', sans-serif`,
		"--theme-font-color-base": "0 0 0",
		"--theme-font-color-dark": "255 255 255",
		"--theme-rounded-base": "9999px",
		"--theme-rounded-container": "8px",
		"--theme-border-base": "1px",
		// =~= Theme On-X Colors =~=
		"--on-primary": "0 0 0",
		"--on-secondary": "0 0 0",
		"--on-tertiary": "0 0 0",
		"--on-success": "0 0 0",
		"--on-warning": "0 0 0",
		"--on-error": "255 255 255",
		"--on-surface": "0 0 0",
		// =~= Theme Colors  =~=
		// primary | #d5ba7e 
		"--color-primary-50": "249 245 236", // #f9f5ec
		"--color-primary-100": "247 241 229", // #f7f1e5
		"--color-primary-200": "245 238 223", // #f5eedf
		"--color-primary-300": "238 227 203", // #eee3cb
		"--color-primary-400": "226 207 165", // #e2cfa5
		"--color-primary-500": "213 186 126", // #d5ba7e
		"--color-primary-600": "192 167 113", // #c0a771
		"--color-primary-700": "160 140 95", // #a08c5f
		"--color-primary-800": "128 112 76", // #80704c
		"--color-primary-900": "104 91 62", // #685b3e
		// secondary | #d5ba7e 
		"--color-secondary-50": "249 245 236", // #f9f5ec
		"--color-secondary-100": "247 241 229", // #f7f1e5
		"--color-secondary-200": "245 238 223", // #f5eedf
		"--color-secondary-300": "238 227 203", // #eee3cb
		"--color-secondary-400": "226 207 165", // #e2cfa5
		"--color-secondary-500": "213 186 126", // #d5ba7e
		"--color-secondary-600": "192 167 113", // #c0a771
		"--color-secondary-700": "160 140 95", // #a08c5f
		"--color-secondary-800": "128 112 76", // #80704c
		"--color-secondary-900": "104 91 62", // #685b3e
		// tertiary | #e8bdff 
		"--color-tertiary-50": "252 245 255", // #fcf5ff
		"--color-tertiary-100": "250 242 255", // #faf2ff
		"--color-tertiary-200": "249 239 255", // #f9efff
		"--color-tertiary-300": "246 229 255", // #f6e5ff
		"--color-tertiary-400": "239 209 255", // #efd1ff
		"--color-tertiary-500": "232 189 255", // #e8bdff
		"--color-tertiary-600": "209 170 230", // #d1aae6
		"--color-tertiary-700": "174 142 191", // #ae8ebf
		"--color-tertiary-800": "139 113 153", // #8b7199
		"--color-tertiary-900": "114 93 125", // #725d7d
		// success | #f9d585 
		"--color-success-50": "254 249 237", // #fef9ed
		"--color-success-100": "254 247 231", // #fef7e7
		"--color-success-200": "254 245 225", // #fef5e1
		"--color-success-300": "253 238 206", // #fdeece
		"--color-success-400": "251 226 170", // #fbe2aa
		"--color-success-500": "249 213 133", // #f9d585
		"--color-success-600": "224 192 120", // #e0c078
		"--color-success-700": "187 160 100", // #bba064
		"--color-success-800": "149 128 80", // #958050
		"--color-success-900": "122 104 65", // #7a6841
		// warning | #ffc9b3 
		"--color-warning-50": "255 247 244", // #fff7f4
		"--color-warning-100": "255 244 240", // #fff4f0
		"--color-warning-200": "255 242 236", // #fff2ec
		"--color-warning-300": "255 233 225", // #ffe9e1
		"--color-warning-400": "255 217 202", // #ffd9ca
		"--color-warning-500": "255 201 179", // #ffc9b3
		"--color-warning-600": "230 181 161", // #e6b5a1
		"--color-warning-700": "191 151 134", // #bf9786
		"--color-warning-800": "153 121 107", // #99796b
		"--color-warning-900": "125 98 88", // #7d6258
		// error | #f57e21 
		"--color-error-50": "254 236 222", // #feecde
		"--color-error-100": "253 229 211", // #fde5d3
		"--color-error-200": "253 223 200", // #fddfc8
		"--color-error-300": "251 203 166", // #fbcba6
		"--color-error-400": "248 165 100", // #f8a564
		"--color-error-500": "245 126 33", // #f57e21
		"--color-error-600": "221 113 30", // #dd711e
		"--color-error-700": "184 95 25", // #b85f19
		"--color-error-800": "147 76 20", // #934c14
		"--color-error-900": "120 62 16", // #783e10
		// surface | #d5ba7e 
		"--color-surface-50": "249 245 236", // #f9f5ec
		"--color-surface-100": "247 241 229", // #f7f1e5
		"--color-surface-200": "245 238 223", // #f5eedf
		"--color-surface-300": "238 227 203", // #eee3cb
		"--color-surface-400": "226 207 165", // #e2cfa5
		"--color-surface-500": "213 186 126", // #d5ba7e
		"--color-surface-600": "192 167 113", // #c0a771
		"--color-surface-700": "160 140 95", // #a08c5f
		"--color-surface-800": "128 112 76", // #80704c
		"--color-surface-900": "104 91 62", // #685b3e
		
	}
}