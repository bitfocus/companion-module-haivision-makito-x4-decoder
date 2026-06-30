const { combineRgb } = require('@companion-module/base')

module.exports = function (self) {
	const presets = []
	const makeId = (value) =>
		String(value)
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '_')
			.replace(/^_+|_+$/g, '') || 'preset'

	// Decoder control presets
	presets.push({
		type: 'button',
		category: 'Decoder Control',
		name: 'Start Decoder',
		style: {
			text: 'DEC\\nSTART',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 100, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'decoder_start',
						options: {
							deviceNumber: '0',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'decoder_status',
				options: {
					deviceNumber: '0',
					status: '2',
				},
				style: {
					bgcolor: combineRgb(0, 255, 0),
					color: combineRgb(0, 0, 0),
				},
			},
		],
	})

	presets.push({
		type: 'button',
		category: 'Decoder Control',
		name: 'Stop Decoder',
		style: {
			text: 'DEC\\nSTOP',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(100, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'decoder_stop',
						options: {
							deviceNumber: '0',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'decoder_status',
				options: {
					deviceNumber: '0',
					status: '0',
				},
				style: {
					bgcolor: combineRgb(255, 0, 0),
					color: combineRgb(255, 255, 255),
				},
			},
		],
	})

	presets.push({
		type: 'button',
		category: 'Decoder Control',
		name: 'Toggle Decoder',
		style: {
			text: 'DEC\\nTOGGLE',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(50, 50, 50),
		},
		steps: [
			{
				down: [
					{
						actionId: 'decoder_toggle',
						options: {
							deviceNumber: '0',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'decoder_state_color',
				options: {
					deviceNumber: '0',
				},
			},
		],
	})

	presets.push({
		type: 'button',
		category: 'Decoder Control',
		name: 'Restart Decoder',
		style: {
			text: 'DEC\\nRESTART',
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(100, 100, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'decoder_restart',
						options: {
							deviceNumber: '0',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	})

	presets.push({
		type: 'button',
		category: 'Decoder Status',
		name: 'Signal Present',
		style: {
			text: 'SIGNAL\\n$(makitox4:decoder0_signal)',
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(50, 50, 50),
		},
		steps: [],
		feedbacks: [
			{
				feedbackId: 'decoder_signal_present',
				options: {
					deviceNumber: '0',
				},
				style: {
					bgcolor: combineRgb(0, 255, 0),
					color: combineRgb(0, 0, 0),
				},
			},
		],
	})

	// Add decoder thumbnail preset for each decoder (indices 0-3, shown as 1-4)
	for (let i = 0; i < 4; i++) {
		presets.push({
			type: 'button',
			category: 'Decoder Thumbnails',
			name: `Decoder ${i + 1} Thumbnail`,
			style: {
				text: `DEC ${i + 1}\\n$(makitox4:decoder${i}_state)`,
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'decoder_toggle',
							options: {
								deviceNumber: String(i),
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'decoder_thumbnail',
					options: {
						deviceNumber: String(i),
					},
				},
				{
					feedbackId: 'decoder_state_color',
					options: {
						deviceNumber: String(i),
					},
				},
			],
		})
	}

	// Common system presets
	presets.push({
		type: 'button',
		category: 'System',
		name: 'Connection Status',
		style: {
			text: 'CONN\\n$(makitox4:connection_status)',
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(50, 50, 50),
		},
		steps: [],
		feedbacks: [
			{
				feedbackId: 'connection_status',
				style: {
					bgcolor: combineRgb(0, 255, 0),
					color: combineRgb(0, 0, 0),
				},
			},
		],
	})

	presets.push({
		type: 'button',
		category: 'System',
		name: 'Device Info',
		style: {
			text: '$(makitox4:device_type)\\n$(makitox4:device_serial)',
			size: '7',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [],
		feedbacks: [],
	})

	presets.push({
		type: 'button',
		category: 'Status',
		name: 'Decoder Status',
		style: {
			text: 'DEC: $(makitox4:decoder0_state)\\n$(makitox4:decoder0_video_input_resolution)@$(makitox4:decoder0_video_framerate)fps',
			size: '7',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [],
		feedbacks: [
			{
				feedbackId: 'decoder_status',
				options: {
					deviceNumber: '0',
					status: '2',
				},
				style: {
					bgcolor: combineRgb(0, 100, 0),
				},
			},
			{
				feedbackId: 'decoder_status',
				options: {
					deviceNumber: '0',
					status: '-1',
				},
				style: {
					bgcolor: combineRgb(200, 0, 0),
				},
			},
		],
	})

	presets.push({
		type: 'button',
		category: 'Status',
		name: 'Latency Monitor',
		style: {
			text: 'LATENCY\\n$(makitox4:decoder0_video_latency) ms',
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [],
		feedbacks: [],
	})

	const sections = []
	const sectionsById = new Map()
	const presetDefinitions = {}

	for (const preset of presets) {
		const { category = 'General', type: _type, ...presetDefinition } = preset
		const sectionId = makeId(category)
		let section = sectionsById.get(sectionId)

		if (!section) {
			section = {
				id: sectionId,
				name: category,
				definitions: [],
			}
			sectionsById.set(sectionId, section)
			sections.push(section)
		}

		let presetId = makeId(`${sectionId}_${presetDefinition.name}`)
		let suffix = 2
		while (presetDefinitions[presetId]) {
			presetId = makeId(`${sectionId}_${presetDefinition.name}_${suffix}`)
			suffix++
		}

		presetDefinitions[presetId] = {
			...presetDefinition,
			type: 'simple',
		}
		section.definitions.push(presetId)
	}

	self.setPresetDefinitions(sections, presetDefinitions)
}
