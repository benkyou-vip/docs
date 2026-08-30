// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: '沉浸式语言学习指南',
			description:
				'用 Refold、Anki、Yomitan、mpv 与 mpvacious 在电脑上高效学习第二语言',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
			sidebar: [
				{
					label: '方法论',
					items: [{ label: 'Refold 沉浸式学习路线图', link: '/guides/refold-roadmap/' }],
				},
				{
					label: '工具链',
					items: [
						{ label: 'Anki 与 SRS', link: '/guides/anki-srs/' },
						{ label: 'Yomitan 划词词典', link: '/guides/yomitan/' },
						{ label: 'mpv 播放器与 mpvacious 制卡', link: '/guides/mpv/' },
					],
				},
				{
					label: '关于',
					items: [{ label: '鸣谢', link: '/acknowledgements/' }],
				},
			],
		}),
	],
});
