import { CustomConfig, CustomConfigMapSelectionMode } from "../../../model/customConfig/customConfig.api.model"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { getCustomConfigItemGroups } from "./getCustomConfigItemGroups"
import { VisibleFilesBySelectionMode } from "../visibleFilesBySelectionMode.selector"

describe("getCustomConfigItemGroups", () => {
	const customConfigStub1 = {
		id: "1-invalid-md5-checksum",
		name: "config1",
		mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
		assignedMaps: new Map([
			["checksumMap1", "map1"],
			["checksumMap2", "map2"]
		])
	} as CustomConfig

	const customConfigStub2 = {
		id: "2-invalid-md5-checksum",
		name: "config2",
		mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
		assignedMaps: new Map([["checksumMap3", "map3"]])
	} as CustomConfig

	it("should set applicable-flags to true when current assigned map names, checksums and selection mode are matching a custom config", () => {
		CustomConfigHelper.loadCustomConfigsFromLocalStorage = jest
			.fn()
			.mockReturnValue(new Map([["customConfigKey_1", customConfigStub1]]))
		const visibleFilesBySelectionMode: VisibleFilesBySelectionMode = {
			mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
			assignedMaps: new Map([
				["checksumMap1", "map1"],
				["checksumMap2", "map2"]
			])
		}

		const actualCustomConfigItemGroups = getCustomConfigItemGroups(visibleFilesBySelectionMode)

		const applicableGroup = actualCustomConfigItemGroups.applicableItems.get("map1_map2_MULTIPLE")
		expect(applicableGroup.customConfigItems[0].name).toBe("config1")
		expect(applicableGroup.customConfigItems[0].isApplicable).toBe(true)
	})

	it("should set applicable-flags to false when current assigned map names, checksums and selection mode are not matching a custom config", () => {
		CustomConfigHelper.loadCustomConfigsFromLocalStorage = jest
			.fn()
			.mockReturnValue(new Map([["customConfigKey_2", customConfigStub2]]))
		const visibleFilesBySelectionMode: VisibleFilesBySelectionMode = {
			mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
			assignedMaps: new Map([
				["checksumMap1", "map1"],
				["checksumMap2", "map2"]
			])
		}

		const actualCustomConfigItemGroups = getCustomConfigItemGroups(visibleFilesBySelectionMode)

		const nonApplicableGroup = actualCustomConfigItemGroups.nonApplicableItems.get("map3_MULTIPLE")
		expect(nonApplicableGroup.customConfigItems[0].name).toBe("config2")
		expect(nonApplicableGroup.customConfigItems[0].isApplicable).toBe(false)
	})

	it("should set applicable-flags to true, if at least one checksum of selected map is present in a custom config", () => {
		CustomConfigHelper.loadCustomConfigsFromLocalStorage = jest
			.fn()
			.mockReturnValue(new Map([["customConfigKey_1", customConfigStub1]]))
		const visibleFilesBySelectionMode: VisibleFilesBySelectionMode = {
			mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
			assignedMaps: new Map([["checksumMap1", "map1"]])
		}

		const actualCustomConfigItemGroups = getCustomConfigItemGroups(visibleFilesBySelectionMode)

		const applicableGroup = actualCustomConfigItemGroups.applicableItems.get("map1_map2_MULTIPLE")
		expect(applicableGroup.customConfigItems[0].name).toBe("config1")
		expect(applicableGroup.customConfigItems[0].isApplicable).toBe(true)
	})

	it("should set applicable-flags to true, if selected CustomConfigMapSelectionMode does not match actual FileSelectionState but selected maps are present in a custom config", () => {
		CustomConfigHelper.loadCustomConfigsFromLocalStorage = jest
			.fn()
			.mockReturnValue(new Map([["customConfigKey_1", customConfigStub1]]))
		const visibleFilesBySelectionMode: VisibleFilesBySelectionMode = {
			mapSelectionMode: CustomConfigMapSelectionMode.DELTA,
			assignedMaps: new Map([
				["checksumMap1", "map1"],
				["checksumMap2", "map2"]
			])
		}

		const actualCustomConfigItemGroups = getCustomConfigItemGroups(visibleFilesBySelectionMode)

		const applicableGroup = actualCustomConfigItemGroups.applicableItems.get("map1_map2_MULTIPLE")
		expect(applicableGroup.customConfigItems[0].name).toBe("config1")
		expect(applicableGroup.customConfigItems[0].isApplicable).toBe(true)
	})
})
