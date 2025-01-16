import type { Config } from 'tailwindcss';

import { skeleton, contentPath } from '@skeletonlabs/skeleton/plugin';
import * as themes from '@skeletonlabs/skeleton/themes';

export default {
    content: [
        './src/**/*.{html,js,svelte,ts}',
        contentPath(import.meta.url, 'svelte')
    ],
    theme: {
        extend: {},
    },
    plugins: [
        skeleton({
            // NOTE: each theme included will increase the size of your CSS bundle
            themes: [ themes.cerberus, themes.rose ]
        })
    ]
} satisfies Config

// import { join } from 'path'
// import { tributestreamTheme01 } from './tributestream-theme-01'
// import { tributestreamTheme01Dark } from './tributestream-theme-01-dark'

// import type { Config } from 'tailwindcss'
// import forms from '@tailwindcss/forms';
// import typography from '@tailwindcss/typography';
//import { skeleton } from '@skeletonlabs/tw-plugin'

// export default {
// 	darkMode: 'selector',
// 	content: ['./src/**/*.{html,js,svelte,ts}', join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')],
// 	theme: {
// 		extend: {},
// 	},
// 	plugins: [
// 		forms,
// 		typography,
// 		skeleton({
// 			themes: {
// 				custom: [
// 					tributestreamTheme01,
// 					tributestreamTheme01Dark
// 				],
// 				preset: [
// 					{
// 						name: 'skeleton',
// 						enhancements: true,
// 					},
// 				],
// 			},
// 		}),
// 	],
// } satisfies Config;
