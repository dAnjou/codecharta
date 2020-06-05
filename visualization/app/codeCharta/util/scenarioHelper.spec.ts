import { ScenarioHelper } from "./scenarioHelper"
import { RecursivePartial, ScenarioAsSettings, Scenario, Settings } from "../codeCharta.model"
import { PARTIAL_SETTINGS, SCENARIO, SCENARIO_WITH_ONLY_HEIGHT } from "./dataMocks"
import { Vector3 } from "three"
import { ScenarioMetricType } from "../ui/dialog/dialog.addScenarioSettings.component"
import { ScenarioItem } from "../ui/scenarioDropDown/scenarioDropDown.component"

describe("scenarioHelper", () => {
	const scenarios: ScenarioAsSettings[] = require("../assets/scenarios.json")

	afterEach(() => {
		jest.resetAllMocks()
	})

	beforeEach(() => {
		ScenarioHelper["scenarioList"].set("Scenario1", SCENARIO)
		ScenarioHelper["scenarioList"].set("Scenario2", SCENARIO_WITH_ONLY_HEIGHT)
	})

	describe("importScenarios", () => {
		it("should convert vectors when importing scenarios", () => {
			scenarios[0].settings.appSettings.camera = { x: 0, y: 1, z: 2 } as any
			expect(scenarios[0].settings.appSettings.camera.clone).toBeUndefined()

			const result = ScenarioHelper.importScenarios(scenarios)

			expect(result[0].settings.appSettings.camera.clone).not.toBeUndefined()
		})

		it("should assume 0 as default value if only one dimension is given", () => {
			scenarios[0].settings.appSettings.camera = { y: 24 } as any
			expect(scenarios[0].settings.appSettings.camera.clone).toBeUndefined()

			const result = ScenarioHelper.importScenarios(scenarios)

			expect(result[0].settings.appSettings.camera.clone).not.toBeUndefined()
			expect(result[0].settings.appSettings.camera.x).toBe(1)
			expect(result[0].settings.appSettings.camera.y).toBe(24)
			expect(result[0].settings.appSettings.camera.z).toBe(1)
		})
	})
	describe("getScenarioSettingsByName", () => {
		it("should return Settings for Scenario1", () => {
			const result = ScenarioHelper.getScenarioSettingsByName("Scenario1")

			expect(result).toEqual(PARTIAL_SETTINGS)
		})
		it("should return Settings for Scenario2", () => {
			const result = ScenarioHelper.getScenarioSettingsByName("Scenario2")
			const expected = {
				dynamicSettings: { heightMetric: "mcc" },
				appSettings: { amountOfTopLabels: 31, scaling: new Vector3(1, 1.8, 1) }
			}

			expect(result).toEqual(expected)
		})
		it("should return an settingsobject with empty dynamic- and appSettings if the list don't contain the scenario", () => {
			const result = ScenarioHelper.getScenarioSettingsByName("someScenario")
			const expected: RecursivePartial<Settings> = { dynamicSettings: {}, appSettings: {} }

			expect(result).toEqual(expected)
		})
	})

	describe("getScenarioItems", () => {
		beforeEach(() => {
			ScenarioHelper["scenarioList"].clear()
		})
		it("should get all the items with its visibility", () => {
			ScenarioHelper["scenarioList"].set("Scenario1", SCENARIO)

			const expected: ScenarioItem[] = [
				{
					scenarioName: "Scenario1",
					isScenarioAppliable: false,
					icons: [
						{ faIconClass: "fa-video-camera", isSaved: true },
						{ faIconClass: "fa-arrows-alt", isSaved: true },
						{ faIconClass: "fa-paint-brush", isSaved: true },
						{ faIconClass: "fa-arrows-v", isSaved: true },
						{ faIconClass: "fa-exchange", isSaved: true }
					]
				}
			]

			const result = ScenarioHelper.getScenarioItems([])

			expect(result).toEqual(expected)
		})

		it("should set isScenarioAppliable to true when metric is in metricData", () => {
			ScenarioHelper["scenarioList"].set("Scenario2", SCENARIO_WITH_ONLY_HEIGHT)

			const expected: ScenarioItem[] = [
				{
					scenarioName: "Scenario2",
					isScenarioAppliable: true,
					icons: [
						{ faIconClass: "fa-video-camera", isSaved: false },
						{ faIconClass: "fa-arrows-alt", isSaved: false },
						{ faIconClass: "fa-paint-brush", isSaved: false },
						{ faIconClass: "fa-arrows-v", isSaved: true },
						{ faIconClass: "fa-exchange", isSaved: false }
					]
				}
			]

			const result = ScenarioHelper.getScenarioItems([{ name: "mcc", maxValue: 56 }])

			expect(result).toEqual(expected)
		})
	})

	describe("getDefaultScenario", () => {
		it("should return Complexity ScenarioAsSettings", () => {
			ScenarioHelper.getScenarioSettingsByName = jest.fn()

			ScenarioHelper.getDefaultScenarioSetting()

			expect(ScenarioHelper.getScenarioSettingsByName).toHaveBeenCalledWith("Complexity")
		})
	})

	describe("addScenario", () => {
		beforeEach(() => {
			ScenarioHelper["scenarioList"].clear()
		})
		it("should add the new Scenario into the scenarioList", () => {
			ScenarioHelper.addScenario(SCENARIO)
			const lastScenarioOfScenarioList: RecursivePartial<Scenario> = Array.from(ScenarioHelper["scenarioList"].values()).pop()

			expect(lastScenarioOfScenarioList).toEqual(SCENARIO)
		})
		it("should call setScenariosToLocalStorage with scenarioList", () => {
			ScenarioHelper["setScenariosToLocalStorage"] = jest.fn()

			ScenarioHelper.addScenario(SCENARIO)

			expect(ScenarioHelper["setScenariosToLocalStorage"]).toHaveBeenCalledWith(ScenarioHelper["scenarioList"])
		})
	})

	describe("createNewScenario", () => {
		const scenarioAttributeContent = [
			{
				metricType: ScenarioMetricType.CAMERA_POSITION,
				metricName: null,
				savedValues: { camera: new Vector3(0, 300, 1000), cameraTarget: new Vector3(1, 1, 1) },
				isSelected: true,
				isDisabled: false
			},
			{
				metricType: ScenarioMetricType.AREA_METRIC,
				metricName: "rloc",
				savedValues: 48,
				isSelected: true,
				isDisabled: false
			},
			{
				metricType: ScenarioMetricType.COLOR_METRIC,
				metricName: "mcc",
				savedValues: { from: 19, to: 67 },
				isSelected: true,
				isDisabled: false
			},
			{
				metricType: ScenarioMetricType.HEIGHT_METRIC,
				metricName: "mcc",
				savedValues: { heightSlider: new Vector3(1, 1.8, 1), labelSlider: 31 },
				isSelected: true,
				isDisabled: false
			},
			{
				metricType: ScenarioMetricType.EDGE_METRIC,
				metricName: "pairingRate",
				savedValues: { edgePreview: 5, edgeHeight: 4 },
				isSelected: true,
				isDisabled: false
			}
		]

		it("should create a Scenario according to the given scenarioAttributeContent ", () => {
			const result: RecursivePartial<Scenario> = ScenarioHelper.createNewScenario("Scenario1", scenarioAttributeContent)
			const expected: RecursivePartial<Scenario> = SCENARIO

			expect(result).toEqual(expected)
		})

		it("should create a Scenario only with height attributes", () => {
			const scenarioAttributeContentWithOnlyHeight = [
				{
					metricType: ScenarioMetricType.HEIGHT_METRIC,
					metricName: "mcc",
					savedValues: { heightSlider: new Vector3(1, 1.8, 1), labelSlider: 31 },
					isSelected: true,
					isDisabled: false
				}
			]

			const result: RecursivePartial<Scenario> = ScenarioHelper.createNewScenario("Scenario2", scenarioAttributeContentWithOnlyHeight)

			expect(result).toEqual(SCENARIO_WITH_ONLY_HEIGHT)
		})
	})

	describe("deleteScenario", () => {
		beforeEach(() => {
			ScenarioHelper["scenarioList"].clear()
		})
		it("should remove the Scenario from ScenarioList ", () => {
			ScenarioHelper["scenarioList"].set("Scenario", { name: "Scenario", area: { areaMetric: "mcc", margin: 48 } })
			ScenarioHelper.deleteScenario("Scenario")

			expect(ScenarioHelper["scenarioList"]).toEqual(new Map<String, RecursivePartial<Scenario>>())
		})

		it("should not delete an Element when it doesn't exist ", () => {
			ScenarioHelper["scenarioList"].set("Scenario", { name: "Scenario", area: { areaMetric: "mcc", margin: 48 } })

			ScenarioHelper.deleteScenario("UnknownScenario")
			const expected = new Map<String, RecursivePartial<Scenario>>()
			expected.set("Scenario", { name: "Scenario", area: { areaMetric: "mcc", margin: 48 } })

			expect(ScenarioHelper["scenarioList"]).toEqual(expected)
		})

		it("should find the specific Scenario and delete it ", () => {
			ScenarioHelper["scenarioList"].set("Scenario1", { name: "Scenario1", area: { areaMetric: "rloc", margin: 48 } })
			ScenarioHelper["scenarioList"].set("Scenario2", { name: "Scenario2", height: { heightMetric: "mcc", labelSlider: 2 } })
			ScenarioHelper["scenarioList"].set("Scenario3", { name: "Scenario3", color: { colorMetric: "mcc" } })

			ScenarioHelper.deleteScenario("Scenario2")
			const expected = new Map<String, RecursivePartial<Scenario>>()
			expected.set("Scenario1", { name: "Scenario1", area: { areaMetric: "rloc", margin: 48 } })
			expected.set("Scenario3", { name: "Scenario3", color: { colorMetric: "mcc" } })

			expect(ScenarioHelper["scenarioList"]).toEqual(expected)
		})

		it("should call setScenariosToLocalStorage", () => {
			ScenarioHelper["setScenariosToLocalStorage"] = jest.fn()

			ScenarioHelper.deleteScenario("Complexity")

			expect(ScenarioHelper["setScenariosToLocalStorage"]).toHaveBeenCalled()
		})
	})

	describe("isScenarioExisting ", () => {
		it("should return true if Scenario is existing", () => {
			expect(ScenarioHelper.isScenarioExisting("Scenario2")).toBeTruthy()
		})

		it("should return true if Scenario is existing", () => {
			expect(ScenarioHelper.isScenarioExisting("someScenario")).toBeFalsy()
		})
	})
})
