import "./artificialIntelligence.module"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"
import { ArtificialIntelligenceController } from "./artificialIntelligence.component"
import { FilesService } from "../../state/store/files/files.service"
import { CustomConfig } from "../../model/customConfig/customConfig.api.model"
import { CustomConfigHelper } from "../../util/customConfigHelper"
import { setFiles } from "../../state/store/files/files.actions"
import { FILE_STATES, FILE_STATES_JAVA, FILE_STATES_UNSELECTED } from "../../util/dataMocks"
import { setState } from "../../state/store/state.actions"
import { klona } from "klona"
import { BlacklistType } from "../../codeCharta.model"
import { BlacklistService } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { ExperimentalFeaturesEnabledService } from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.service"
import { setExperimentalFeaturesEnabled } from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"

describe("ArtificialIntelligenceController", () => {
	let artificialIntelligenceController: ArtificialIntelligenceController
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let threeOrbitControlsService: ThreeOrbitControlsService
	let threeCameraService: ThreeCameraService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.artificialIntelligence")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		threeOrbitControlsService = getService<ThreeOrbitControlsService>("storeService")
		threeCameraService = getService<ThreeCameraService>("storeService")

		storeService.dispatch(setFiles(FILE_STATES))
	}

	function rebuildController() {
		artificialIntelligenceController = new ArtificialIntelligenceController(
			$rootScope,
			storeService,
			threeOrbitControlsService,
			threeCameraService
		)

		// Overwrite debounce with original function, otherwise calculate() will not be called
		artificialIntelligenceController["debounceCalculation"] = artificialIntelligenceController["calculate"]
	}

	describe("constructor", () => {
		it("should subscribe to file service", () => {
			FilesService.subscribe = jest.fn()

			rebuildController()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, artificialIntelligenceController)
		})

		it("should subscribe to blacklist service", () => {
			BlacklistService.subscribe = jest.fn()

			rebuildController()

			expect(BlacklistService.subscribe).toHaveBeenCalledWith($rootScope, artificialIntelligenceController)
		})

		it("should subscribe to experimentalFeaturesEnabled service", () => {
			ExperimentalFeaturesEnabledService.subscribe = jest.fn()

			rebuildController()

			expect(ExperimentalFeaturesEnabledService.subscribe).toHaveBeenCalledWith($rootScope, artificialIntelligenceController)
		})
	})

	describe("calculations", () => {
		it("should not calculate suspicious metrics when experimental features are disabled", function () {
			artificialIntelligenceController["getMostFrequentLanguage"] = jest.fn()
			artificialIntelligenceController["clearRiskProfile"] = jest.fn()
			artificialIntelligenceController["calculateRiskProfile"] = jest.fn()
			artificialIntelligenceController["createCustomConfigSuggestions"] = jest.fn()
			artificialIntelligenceController["fileState"] = FILE_STATES_JAVA[0]

			storeService.dispatch(setExperimentalFeaturesEnabled(false))
			artificialIntelligenceController.onExperimentalFeaturesEnabledChanged(false)

			expect(artificialIntelligenceController["getMostFrequentLanguage"]).not.toHaveBeenCalled()
			expect(artificialIntelligenceController["clearRiskProfile"]).not.toHaveBeenCalled()
			expect(artificialIntelligenceController["calculateRiskProfile"]).not.toHaveBeenCalled()
			expect(artificialIntelligenceController["createCustomConfigSuggestions"]).not.toHaveBeenCalled()
		})

		it("should calculate suspicious metrics when experimental features are enabled", function () {
			artificialIntelligenceController["getMostFrequentLanguage"] = jest.fn().mockReturnValue("java")
			artificialIntelligenceController["clearRiskProfile"] = jest.fn()
			artificialIntelligenceController["calculateRiskProfile"] = jest.fn()
			artificialIntelligenceController["createCustomConfigSuggestions"] = jest.fn()
			artificialIntelligenceController["fileState"] = FILE_STATES_JAVA[0]

			storeService.dispatch(setExperimentalFeaturesEnabled(true))
			artificialIntelligenceController.onExperimentalFeaturesEnabledChanged(true)

			expect(artificialIntelligenceController["getMostFrequentLanguage"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["_viewModel"].analyzedProgrammingLanguage).toBe("java")
			expect(artificialIntelligenceController["clearRiskProfile"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["calculateRiskProfile"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["createCustomConfigSuggestions"]).toHaveBeenCalled()
		})
	})

	describe("apply custom Config", () => {
		it("should call store.dispatch", () => {
			const customConfigStub = {
				stateSettings: {
					dynamicSettings: {
						margin: 1,
						colorRange: { from: 1, to: 2 }
					}
				}
			} as CustomConfig

			CustomConfigHelper.getCustomConfigSettings = jest.fn().mockReturnValue(customConfigStub)
			storeService.dispatch = jest.fn()
			threeOrbitControlsService.setControlTarget = jest.fn()

			artificialIntelligenceController.applyCustomConfig("CustomConfig1")

			expect(storeService.dispatch).toHaveBeenCalledWith(setState(customConfigStub.stateSettings))
		})
	})

	describe("on files selection changed", () => {
		it("should do nothing if no file is selected", () => {
			artificialIntelligenceController["getMostFrequentLanguage"] = jest.fn()
			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES_UNSELECTED)
			expect(artificialIntelligenceController["getMostFrequentLanguage"]).not.toHaveBeenCalled()
		})

		it("should not calculate risk profile and suggest custom configs on empty main programming language", () => {
			artificialIntelligenceController["clearRiskProfile"] = jest.fn()
			artificialIntelligenceController["calculateRiskProfile"] = jest.fn()
			artificialIntelligenceController["createCustomConfigSuggestions"] = jest.fn()
			storeService.dispatch(setExperimentalFeaturesEnabled(true))
			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES)

			expect(artificialIntelligenceController["clearRiskProfile"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["calculateRiskProfile"]).not.toHaveBeenCalled()
			expect(artificialIntelligenceController["createCustomConfigSuggestions"]).not.toHaveBeenCalled()
		})

		it("should clear and calculate risk profile for Java map", () => {
			artificialIntelligenceController["clearRiskProfile"] = jest.fn()
			artificialIntelligenceController["createCustomConfigSuggestions"] = jest.fn()

			storeService.dispatch(setExperimentalFeaturesEnabled(true))
			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES_JAVA)

			expect(artificialIntelligenceController["_viewModel"].analyzedProgrammingLanguage).toBe("java")
			expect(artificialIntelligenceController["clearRiskProfile"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["_viewModel"].riskProfile).toMatchSnapshot()
			expect(artificialIntelligenceController["createCustomConfigSuggestions"]).toHaveBeenCalled()
		})

		it("should calculate risk profile and should not exceed 100 percent", () => {
			storeService.dispatch(setExperimentalFeaturesEnabled(true))
			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES_JAVA)
			const sumOfRiskPercentage = Object.values(artificialIntelligenceController["_viewModel"].riskProfile).reduce((a, b) => a + b)

			expect(artificialIntelligenceController["_viewModel"].riskProfile).toMatchSnapshot()
			expect(sumOfRiskPercentage).toEqual(99)
		})

		it("should create custom config suggestions sorted by outlierCustomConfigId", () => {
			artificialIntelligenceController["clearRiskProfile"] = jest.fn()
			artificialIntelligenceController["calculateRiskProfile"] = jest.fn()

			storeService.dispatch(setExperimentalFeaturesEnabled(true))
			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES_JAVA)

			expect(artificialIntelligenceController["_viewModel"].analyzedProgrammingLanguage).toBe("java")
			expect(artificialIntelligenceController["clearRiskProfile"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["calculateRiskProfile"]).toHaveBeenCalled()

			artificialIntelligenceController["_viewModel"].suspiciousMetricSuggestionLinks[0].generalCustomConfigId = "mocked"
			artificialIntelligenceController["_viewModel"].suspiciousMetricSuggestionLinks[0].outlierCustomConfigId = "mocked"
			artificialIntelligenceController["_viewModel"].suspiciousMetricSuggestionLinks[1].generalCustomConfigId = "mocked"
			artificialIntelligenceController["_viewModel"].suspiciousMetricSuggestionLinks[1].outlierCustomConfigId = "mocked"
			artificialIntelligenceController["_viewModel"].suspiciousMetricSuggestionLinks[2].generalCustomConfigId = "mocked"

			expect(artificialIntelligenceController["_viewModel"].suspiciousMetricSuggestionLinks).toMatchSnapshot()
			expect(artificialIntelligenceController["_viewModel"].unsuspiciousMetrics).toMatchSnapshot()
		})

		it("should calculate risk profile for not excluded files only", () => {
			artificialIntelligenceController["createCustomConfigSuggestions"] = jest.fn()

			const codeMapNodeToExclude = FILE_STATES_JAVA[0].file.map.children[0].children[0]

			artificialIntelligenceController["blacklist"] = [
				{
					path: codeMapNodeToExclude.path,
					type: BlacklistType.exclude
				}
			]

			storeService.dispatch(setExperimentalFeaturesEnabled(true))
			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES_JAVA)

			expect(artificialIntelligenceController["_viewModel"].analyzedProgrammingLanguage).toBe("java")
			expect(artificialIntelligenceController["_viewModel"].riskProfile).toMatchSnapshot()
			expect(artificialIntelligenceController["createCustomConfigSuggestions"]).toHaveBeenCalled()
		})

		it("should calculate risk profile but skip files with missing metrics", () => {
			artificialIntelligenceController["createCustomConfigSuggestions"] = jest.fn()

			const FILE_STATES_MISSING_METRICS = klona(FILE_STATES_JAVA)
			for (const codeMapNode of FILE_STATES_MISSING_METRICS[0].file.map.children) {
				codeMapNode.children.map(childCodeMapNode => {
					childCodeMapNode.attributes = {}
				})
			}

			storeService.dispatch(setExperimentalFeaturesEnabled(true))
			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES_MISSING_METRICS)

			expect(artificialIntelligenceController["_viewModel"].analyzedProgrammingLanguage).toBe("java")
			expect(artificialIntelligenceController["_viewModel"].riskProfile).toBeUndefined()
			expect(artificialIntelligenceController["createCustomConfigSuggestions"]).toHaveBeenCalled()
		})

		it("should calculate risk profile and add custom configs for maps with other programming languages", () => {
			artificialIntelligenceController["calculateRiskProfile"] = jest.fn()
			artificialIntelligenceController["createCustomConfigSuggestions"] = jest.fn()

			const FILE_STATES_OTHER = klona(FILE_STATES_JAVA)
			for (const codeMapNode of FILE_STATES_OTHER[0].file.map.children) {
				codeMapNode.children.map(childCodeMapNode => {
					childCodeMapNode.name = childCodeMapNode.name.replace(/\.java/, ".other")
				})
			}

			storeService.dispatch(setExperimentalFeaturesEnabled(true))
			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES_OTHER)

			expect(artificialIntelligenceController["_viewModel"].analyzedProgrammingLanguage).toBe("other")
			expect(artificialIntelligenceController["calculateRiskProfile"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["createCustomConfigSuggestions"]).toHaveBeenCalled()
		})
	})

	describe("on blacklist changed", () => {
		it("should do nothing on blacklist change if no file is selected", () => {
			storeService.dispatch(setFiles(FILE_STATES_UNSELECTED))
			artificialIntelligenceController["debounceCalculation"] = jest.fn()

			artificialIntelligenceController.onBlacklistChanged([])
			expect(artificialIntelligenceController["debounceCalculation"]).not.toHaveBeenCalled()
		})

		it("should calculate risk profile on blacklist changed", () => {
			storeService.dispatch(setFiles(FILE_STATES_JAVA))
			artificialIntelligenceController["debounceCalculation"] = jest.fn()

			artificialIntelligenceController.onBlacklistChanged([])
			expect(artificialIntelligenceController["debounceCalculation"]).toHaveBeenCalled()
		})
	})
})
