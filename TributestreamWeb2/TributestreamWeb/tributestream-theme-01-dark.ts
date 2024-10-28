
import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin';

export const tributestreamTheme01Dark: CustomThemeConfig = {
    name: 'tributestream-theme-01-dark',
    properties: {
		// =~= Theme Properties =~=
		"--theme-font-family-base": `ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif`,
		"--theme-font-family-heading": `ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif`,
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
		"--on-surface": "255 255 255",
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
		// secondary | #cdcece 
		"--color-secondary-50": "248 248 248", // #f8f8f8
		"--color-secondary-100": "245 245 245", // #f5f5f5
		"--color-secondary-200": "243 243 243", // #f3f3f3
		"--color-secondary-300": "235 235 235", // #ebebeb
		"--color-secondary-400": "220 221 221", // #dcdddd
		"--color-secondary-500": "205 206 206", // #cdcece
		"--color-secondary-600": "185 185 185", // #b9b9b9
		"--color-secondary-700": "154 155 155", // #9a9b9b
		"--color-secondary-800": "123 124 124", // #7b7c7c
		"--color-secondary-900": "100 101 101", // #646565
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
		// surface | #68308d 
		"--color-surface-50": "232 224 238", // #e8e0ee
		"--color-surface-100": "225 214 232", // #e1d6e8
		"--color-surface-200": "217 203 227", // #d9cbe3
		"--color-surface-300": "195 172 209", // #c3acd1
		"--color-surface-400": "149 110 175", // #956eaf
		"--color-surface-500": "104 48 141", // #68308d
		"--color-surface-600": "94 43 127", // #5e2b7f
		"--color-surface-700": "78 36 106", // #4e246a
		"--color-surface-800": "62 29 85", // #3e1d55
		"--color-surface-900": "51 24 69", // #331845
	}
}