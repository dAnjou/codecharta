import "./artificialIntelligence.component.scss"
import debounce from "lodash.debounce"
import { FilesSelectionSubscriber, FilesService } from "../../state/store/files/files.service"
import { FileState } from "../../model/files/files"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { pushSorted } from "../../util/nodeDecorator"
import { BlacklistItem, BlacklistType, CodeMapNode, ColorRange, NodeType } from "../../codeCharta.model"
import { hierarchy } from "d3-hierarchy"
import { getVisibleFileStates } from "../../model/files/files.helper"
import { metricThresholds } from "./artificialIntelligence.metricThresholds"
import { defaultMapColors, setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { isPathBlacklisted } from "../../util/codeMapHelper"
import {
	ExperimentalFeaturesEnabledService,
	ExperimentalFeaturesEnabledSubscriber
} from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.service"
import { metricDescriptions } from "../../util/metric/metricDescriptions"
import percentRound from "percent-round"
import { setColorRange } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { setHeightMetric } from "../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { setColorMetric } from "../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { setAreaMetric } from "../../state/store/dynamicSettings/areaMetric/areaMetric.actions"

interface MetricValues {
	[metric: string]: number[]
}

interface MetricAssessmentResults {
	suspiciousMetrics: Map<string, ColorRange>
	unsuspiciousMetrics: string[]
	outliersThresholds: Map<string, number>
}

interface MetricSuggestionParameters {
	metric: string
	from: number
	to: number
	isOutlier?: boolean
}

interface RiskProfile {
	lowRisk: number
	moderateRisk: number
	highRisk: number
	veryHighRisk: number
}

export class ArtificialIntelligenceController
	implements FilesSelectionSubscriber, BlacklistSubscriber, ExperimentalFeaturesEnabledSubscriber
{
	private _viewModel: {
		analyzedProgrammingLanguages: string[]
		suspiciousMetricSuggestionLinks: MetricSuggestionParameters[][]
		unsuspiciousMetrics: string[][]
		riskProfile: RiskProfile[]
		overallSuspiciousMetricSuggestionLinks: string[]
	} = {
		analyzedProgrammingLanguages: undefined,
		suspiciousMetricSuggestionLinks: [],
		unsuspiciousMetrics: [],
		riskProfile: [],
		overallSuspiciousMetricSuggestionLinks: []
	}

	private debounceCalculation: () => void
	private fileState: FileState
	private blacklist: BlacklistItem[] = []

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		FilesService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
		ExperimentalFeaturesEnabledService.subscribe(this.$rootScope, this)

		this.debounceCalculation = debounce(() => {
			this.calculate()
		}, 10)
	}

	onExperimentalFeaturesEnabledChanged(experimentalFeaturesEnabled: boolean) {
		if (experimentalFeaturesEnabled) {
			this.debounceCalculation()
		}
	}

	applySuspiciousMetric(metric: MetricSuggestionParameters, programmingLanguageIndex: number, isOutlier: boolean) {
		if (this._viewModel.suspiciousMetricSuggestionLinks[programmingLanguageIndex].includes(metric)) {
			const mapColors = { ...this.storeService.getState().appSettings.mapColors }
			const colorRange: ColorRange = {
				from: metric.from,
				to: metric.to,
				max: 0,
				min: 0
			}

			if (metric.isOutlier === isOutlier) {
				mapColors.positive = "#ffffff"
				mapColors.neutral = "#ffffff"
				mapColors.negative = "#A900C0"
			} else {
				mapColors.positive = defaultMapColors.positive
				mapColors.neutral = defaultMapColors.neutral
				mapColors.negative = defaultMapColors.negative
			}

			this.storeService.dispatch(setAreaMetric("rloc"))
			this.storeService.dispatch(setHeightMetric(metric.metric))
			this.storeService.dispatch(setColorMetric(metric.metric))
			this.storeService.dispatch(setColorRange(colorRange))
			this.storeService.dispatch(setMapColors(mapColors))
		}
	}

	onBlacklistChanged(blacklist: BlacklistItem[]) {
		this.blacklist = blacklist
		this.fileState = getVisibleFileStates(this.storeService.getState().files)[0]

		if (this.fileState !== undefined) {
			this.debounceCalculation()
		}
	}

	onFilesSelectionChanged(files: FileState[]) {
		const fileState = getVisibleFileStates(files)[0]
		if (fileState === undefined) {
			return
		}

		this.fileState = fileState
		this.debounceCalculation()
	}

	private calculate() {
		const { experimentalFeaturesEnabled } = this.storeService.getState().appSettings
		if (!experimentalFeaturesEnabled) {
			return
		}

		const programmingLanguages = this.getProgrammingLanguages(this.fileState.file.map)
		this._viewModel.analyzedProgrammingLanguages = programmingLanguages

		this.clearRiskProfile()

		if (programmingLanguages.length > 0) {
			for (const language of programmingLanguages) {
				this.calculateRiskProfile(this.fileState, language, "mcc")
				this.calculateSuspiciousMetrics(this.fileState, language)
			}
			this.calculateOverallRiskProfile()
		}
	}

	private clearRiskProfile() {
		this._viewModel.riskProfile = []
	}

	private calculateOverallRiskProfile() {
		let totalLowRisk = 0
		let totalModerateRisk = 0
		let totalHighRisk = 0
		let totalVeryHighRisk = 0

		for (const riskProfil of this._viewModel.riskProfile) {
			totalLowRisk += riskProfil.lowRisk
			totalModerateRisk += riskProfil.moderateRisk
			totalHighRisk += riskProfil.highRisk
			totalVeryHighRisk += riskProfil.veryHighRisk
		}

		const numberOfRiskProfiles = this._viewModel.riskProfile.length

		const [lowRisk, moderateRisk, highRisk, veryHighRisk] = percentRound([
			totalLowRisk / numberOfRiskProfiles,
			totalModerateRisk / numberOfRiskProfiles,
			totalHighRisk / numberOfRiskProfiles,
			totalVeryHighRisk / numberOfRiskProfiles
		])

		this._viewModel.riskProfile.push({
			lowRisk,
			moderateRisk,
			highRisk,
			veryHighRisk
		})
	}

	private calculateRiskProfile(fileState: FileState, programmingLanguage, metricName) {
		let totalRloc = 0
		let numberOfRlocLowRisk = 0
		let numberOfRlocModerateRisk = 0
		let numberOfRlocHighRisk = 0
		let numberOfRlocVeryHighRisk = 0

		const languageSpecificThresholds = this.getAssociatedMetricThresholds(programmingLanguage)
		const thresholds = languageSpecificThresholds[metricName]

		for (const { data } of hierarchy(fileState.file.map)) {
			// TODO calculate risk profile only for focused or currently visible but not excluded files.
			if (
				data.type !== NodeType.FILE ||
				isPathBlacklisted(data.path, this.blacklist, BlacklistType.exclude) ||
				data.attributes[metricName] === undefined ||
				data.attributes["rloc"] === undefined ||
				this.getFileExtension(data.name) !== programmingLanguage
			) {
				continue
			}

			const nodeMetricValue = data.attributes[metricName]
			const nodeRlocValue = data.attributes["rloc"]

			totalRloc += nodeRlocValue

			// Idea: We could calculate risk profiles per directory in the future.
			if (nodeMetricValue <= thresholds.percentile70) {
				numberOfRlocLowRisk += nodeRlocValue
			} else if (nodeMetricValue <= thresholds.percentile80) {
				numberOfRlocModerateRisk += nodeRlocValue
			} else if (nodeMetricValue <= thresholds.percentile90) {
				numberOfRlocHighRisk += nodeRlocValue
			} else {
				numberOfRlocVeryHighRisk += nodeRlocValue
			}
		}

		if (totalRloc === 0) {
			return
		}

		const [lowRisk, moderateRisk, highRisk, veryHighRisk] = percentRound([
			numberOfRlocLowRisk,
			numberOfRlocModerateRisk,
			numberOfRlocHighRisk,
			numberOfRlocVeryHighRisk
		])

		this._viewModel.riskProfile.push({
			lowRisk,
			moderateRisk,
			highRisk,
			veryHighRisk
		})
	}

	private calculateSuspiciousMetrics(fileState: FileState, programmingLanguage) {
		const metricValues = this.getSortedMetricValues(fileState, programmingLanguage)
		const metricAssessmentResults = this.findGoodAndBadMetrics(metricValues, programmingLanguage)
		const noticeableMetricSuggestionLinks = new Map<string, MetricSuggestionParameters>()

		for (const [metricName, colorRange] of metricAssessmentResults.suspiciousMetrics) {
			noticeableMetricSuggestionLinks.set(metricName, {
				metric: metricName,
				...colorRange
			})

			const outlierThreshold = metricAssessmentResults.outliersThresholds.get(metricName)
			if (outlierThreshold > 0) {
				noticeableMetricSuggestionLinks.get(metricName).isOutlier = true
			}
			this.addOverallSuspiciousMetric(metricName)
		}

		this._viewModel.suspiciousMetricSuggestionLinks.push(
			[...noticeableMetricSuggestionLinks.values()].sort(this.compareSuspiciousMetricSuggestionLinks)
		)

		this._viewModel.unsuspiciousMetrics.push(metricAssessmentResults.unsuspiciousMetrics)
	}

	private compareSuspiciousMetricSuggestionLinks(a: MetricSuggestionParameters, b: MetricSuggestionParameters): number {
		if (a.isOutlier && !b.isOutlier) return -1
		if (!a.isOutlier && b.isOutlier) return 1
		return 0
	}

	private addOverallSuspiciousMetric(metric: string) {
		if (this._viewModel.overallSuspiciousMetricSuggestionLinks.includes(metric)) return
		this._viewModel.overallSuspiciousMetricSuggestionLinks.push(metric)
	}

	private findGoodAndBadMetrics(metricValues, programmingLanguage): MetricAssessmentResults {
		const metricAssessmentResults: MetricAssessmentResults = {
			suspiciousMetrics: new Map<string, ColorRange>(),
			unsuspiciousMetrics: [],
			outliersThresholds: new Map<string, number>()
		}

		const languageSpecificMetricThresholds = this.getAssociatedMetricThresholds(programmingLanguage)

		for (const metricName of Object.keys(languageSpecificMetricThresholds)) {
			const valuesOfMetric = metricValues[metricName]
			if (valuesOfMetric === undefined) {
				continue
			}

			const thresholdConfig = languageSpecificMetricThresholds[metricName]
			const maxMetricValue = Math.max(...valuesOfMetric)

			if (maxMetricValue <= thresholdConfig.percentile70) {
				metricAssessmentResults.unsuspiciousMetrics.push(`${metricName} (${metricDescriptions.get(metricName)})`)
			} else if (maxMetricValue > thresholdConfig.percentile70) {
				metricAssessmentResults.suspiciousMetrics.set(metricName, {
					from: thresholdConfig.percentile70,
					to: thresholdConfig.percentile80,
					max: 0,
					min: 0
				})

				if (maxMetricValue > thresholdConfig.percentile90) {
					metricAssessmentResults.outliersThresholds.set(metricName, thresholdConfig.percentile90)
				}
			}
		}

		return metricAssessmentResults
	}

	private getSortedMetricValues(fileState: FileState, programmingLanguage): MetricValues {
		const metricValues: MetricValues = {}

		for (const { data } of hierarchy(fileState.file.map)) {
			if (
				data.type !== NodeType.FILE ||
				isPathBlacklisted(data.path, this.blacklist, BlacklistType.exclude) ||
				this.getFileExtension(data.name) !== programmingLanguage
			) {
				continue
			}

			for (const metricIndex of Object.keys(data.attributes)) {
				const value = data.attributes[metricIndex]
				if (value > 0) {
					if (metricValues[metricIndex] === undefined) {
						metricValues[metricIndex] = []
					}
					pushSorted(metricValues[metricIndex], data.attributes[metricIndex])
				}
			}
		}

		return metricValues
	}

	private getFileExtension(fileName: string) {
		return fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".") + 1) : undefined
	}

	private getProgrammingLanguages(map: CodeMapNode) {
		const languages: string[] = []

		for (const { data } of hierarchy(map)) {
			if (!data.name.includes(".")) {
				continue
			}

			if (data.type === NodeType.FILE) {
				const fileExtension = data.name.slice(data.name.lastIndexOf(".") + 1)
				languages.push(fileExtension)
			}
		}

		if (languages.length === 0) {
			return
		}
		const uniqueChars = [...new Set(languages)]

		return uniqueChars
	}

	private getAssociatedMetricThresholds(programmingLanguage) {
		return programmingLanguage === "java" ? metricThresholds["java"] : metricThresholds["miscellaneous"]
	}
}

export const artificialIntelligenceComponent = {
	selector: "artificialIntelligenceComponent",
	template: require("./artificialIntelligence.component.html"),
	controller: ArtificialIntelligenceController
}
