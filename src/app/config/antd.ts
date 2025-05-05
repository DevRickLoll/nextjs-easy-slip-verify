import {ConfigProviderProps} from 'antd'
import locale from 'antd/locale/th_TH'

export const antd: ConfigProviderProps = {
	locale,
	theme: {
		token: {
			fontFamily: 'var(--font-chakra)',
			colorPrimary: '#3d8d7a',
			colorInfo: '#3d8d7a',
			borderRadius: 8,
			fontSize: 16,
		},
		components: {
			Menu: {
				darkItemHoverBg: '#2d3d4f',
				darkItemHoverColor: '#FFF',
			},
		},
	},
}
