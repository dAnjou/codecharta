import "./codeMap.module"
import "../../codeCharta.module"
import { CodeMapActionsService } from "./codeMap.actions.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { CodeMapNode, BlacklistType } from "../../codeCharta.model"
import { CodeChartaService } from "../../codeCharta.service"
import { VALID_NODE_WITH_PATH } from "../../util/dataMocks"
import { EdgeMetricDataService } from "../../state/edgeMetricData.service"
import { StoreService } from "../../state/store.service"
import _ from "lodash"
import { markPackage, setMarkedPackages } from "../../state/store/fileSettings/markedPackages/markedPackages.actions"
import { addBlacklistItem } from "../../state/store/fileSettings/blacklist/blacklist.actions"

describe("CodeMapActionService", () => {
	let codeMapActionsService: CodeMapActionsService
	let edgeMetricDataService: EdgeMetricDataService
	let storeService: StoreService

	let nodeA: CodeMapNode

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		edgeMetricDataService = getService<EdgeMetricDataService>("edgeMetricDataService")
		storeService = getService<StoreService>("storeService")

		nodeA = _.cloneDeep(VALID_NODE_WITH_PATH)
		storeService.dispatch(setMarkedPackages())
	}

	function rebuildService() {
		codeMapActionsService = new CodeMapActionsService(edgeMetricDataService, storeService)
	}

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	describe("toggleNodeVisibility", () => {
		beforeEach(() => {
			codeMapActionsService.showNode = jest.fn()
			codeMapActionsService.flattenNode = jest.fn()
		})

		it("should call flattenNode if node is visible", () => {
			nodeA.visible = true

			codeMapActionsService.toggleNodeVisibility(nodeA)

			expect(codeMapActionsService.flattenNode).toHaveBeenCalled()
		})

		it("should call showNode if node is not visible", () => {
			nodeA.visible = false

			codeMapActionsService.toggleNodeVisibility(nodeA)

			expect(codeMapActionsService.showNode).toHaveBeenCalled()
		})

		it("should call showNode if node.visible is undefined", () => {
			codeMapActionsService.toggleNodeVisibility(nodeA)

			expect(codeMapActionsService.showNode).toHaveBeenCalled()
		})
	})

	describe("markFolder", () => {
		it("should mark a folder that is not marked yet and has no marked children packages", () => {
			const expected = [{ attributes: {}, color: "0x000000", path: "/root" }]

			codeMapActionsService.markFolder(nodeA, "0x000000")

			expect(storeService.getState().fileSettings.markedPackages).toHaveLength(1)
			expect(storeService.getState().fileSettings.markedPackages).toEqual(expected)
		})

		it("should remove the children of a marked package if color is the same", () => {
			const expected = [{ attributes: {}, color: "0x000000", path: "/root" }]

			codeMapActionsService.markFolder(nodeA.children[0], "0x000000")
			codeMapActionsService.markFolder(nodeA, "0x000000")

			expect(storeService.getState().fileSettings.markedPackages).toHaveLength(1)
			expect(storeService.getState().fileSettings.markedPackages).toEqual(expected)
		})

		it("should not remove the children of a marked package if color is different", () => {
			const expected = [
				{ attributes: {}, color: "0x000000", path: "/root" },
				{ attributes: {}, color: "0x000001", path: "/root/big leaf" }
			]

			codeMapActionsService.markFolder(nodeA, "0x000000")
			codeMapActionsService.markFolder(nodeA.children[0], "0x000001")

			expect(storeService.getState().fileSettings.markedPackages).toHaveLength(2)
			expect(storeService.getState().fileSettings.markedPackages).toEqual(expected)
		})

		it("should not mark with a new color if sub-nodes are already marked", () => {
			const expected = [
				{ attributes: {}, color: "0x000001", path: "/root/big leaf" },
				{ attributes: {}, color: "0x000002", path: "/root/Parent Leaf" },
				{ attributes: {}, color: "0x000003", path: "/root" }
			]

			codeMapActionsService.markFolder(nodeA, "0x000000")
			codeMapActionsService.markFolder(nodeA.children[0], "0x000001")
			codeMapActionsService.markFolder(nodeA.children[1], "0x000002")

			codeMapActionsService.markFolder(nodeA, "0x000003")

			expect(storeService.getState().fileSettings.markedPackages).toHaveLength(3)
			expect(storeService.getState().fileSettings.markedPackages).toEqual(expected)
		})
	})

	describe("unmarkFolder", () => {
		it("should unmark a folder that is marked and has no marked children packages", () => {
			codeMapActionsService.markFolder(nodeA, "0x000000")

			codeMapActionsService.unmarkFolder(nodeA)

			expect(storeService.getState().fileSettings.markedPackages).toHaveLength(0)
			expect(storeService.getState().fileSettings.markedPackages).toEqual([])
		})

		it("should not unmark marked children nodes", () => {
			const expected = [
				{ attributes: {}, color: "0x000000", path: "/root/big leaf" },
				{ attributes: {}, color: "0x000000", path: "/root/Parent Leaf" }
			]

			codeMapActionsService.markFolder(nodeA.children[0], "0x000000")
			codeMapActionsService.markFolder(nodeA.children[1], "0x000000")

			codeMapActionsService.unmarkFolder(nodeA)

			expect(storeService.getState().fileSettings.markedPackages).toHaveLength(2)
			expect(storeService.getState().fileSettings.markedPackages).toEqual(expected)
		})
	})

	describe("flattenNode", () => {
		it("should call pushItemToBlacklist with built BlackListItem", () => {
			codeMapActionsService.pushItemToBlacklist = jest.fn()

			const expected = { path: nodeA.path, type: BlacklistType.flatten }

			codeMapActionsService.flattenNode(nodeA)

			expect(codeMapActionsService.pushItemToBlacklist).toHaveBeenCalledWith(expected)
		})
	})

	describe("showNode", () => {
		it("should call removeBlackListEntry with built BlackListItem", () => {
			codeMapActionsService.removeBlacklistEntry = jest.fn()

			const expected = { path: nodeA.path, type: BlacklistType.flatten }

			codeMapActionsService.showNode(nodeA)

			expect(codeMapActionsService.removeBlacklistEntry).toHaveBeenCalledWith(expected)
		})
	})

	describe("focusNode", () => {
		it("should call removeFocusedNode if node-path equals root-path", () => {
			codeMapActionsService.removeFocusedNode = jest.fn()

			CodeChartaService.ROOT_PATH = "/root"

			codeMapActionsService.focusNode(nodeA)

			expect(codeMapActionsService.removeFocusedNode).toHaveBeenCalled()
		})

		it("should call updateSettings if node-path does not equal root-path", () => {
			CodeChartaService.ROOT_PATH = "/not/root"

			codeMapActionsService.focusNode(nodeA)

			expect(storeService.getState().dynamicSettings.focusedNodePath).toEqual(nodeA.path)
		})
	})

	describe("removeFocusedNode", () => {
		it("should call updateSettings with focusedNodePath empty", () => {
			codeMapActionsService.removeFocusedNode()

			expect(storeService.getState().dynamicSettings.focusedNodePath).toEqual("")
		})
	})

	describe("excludeNode", () => {
		it("should call pushItemToBlacklist with BlacklistType exclude", () => {
			codeMapActionsService.pushItemToBlacklist = jest.fn()

			const expected = { path: nodeA.path, type: BlacklistType.exclude }

			codeMapActionsService.excludeNode(nodeA)

			expect(codeMapActionsService.pushItemToBlacklist).toHaveBeenCalledWith(expected)
		})
	})

	describe("removeBlacklistEntry", () => {
		it("should call pushItemToBlacklist with BlacklistType exclude", () => {
			storeService.dispatch(addBlacklistItem({ path: nodeA.path + "/leaf", type: BlacklistType.exclude }))
			const entry = { path: nodeA.path, type: BlacklistType.exclude }

			codeMapActionsService.removeBlacklistEntry(entry)

			expect(storeService.getState().fileSettings.blacklist).not.toContainEqual(entry)
		})
	})

	describe("pushItemToBlacklist", () => {
		it("should not update settings if item is already blacklisted", () => {
			const blacklistItem = { path: nodeA.path, type: BlacklistType.exclude }
			storeService.dispatch(addBlacklistItem(blacklistItem))

			codeMapActionsService.pushItemToBlacklist(blacklistItem)
			codeMapActionsService.pushItemToBlacklist(_.cloneDeep(blacklistItem))

			expect(
				storeService.getState().fileSettings.blacklist.filter(x => JSON.stringify(x) === JSON.stringify(blacklistItem))
			).toHaveLength(1)
		})

		it("should update settings if item is not blacklisted", () => {
			const blacklistItem = { path: nodeA.path, type: BlacklistType.exclude }

			codeMapActionsService.pushItemToBlacklist(blacklistItem)

			expect(
				storeService.getState().fileSettings.blacklist.find(x => JSON.stringify(x) === JSON.stringify(blacklistItem))
			).toBeDefined()
		})
	})

	describe("getParentMP", () => {
		it("should return null if there are no marked packages", () => {
			const result = codeMapActionsService.getParentMP(nodeA.path)

			expect(result).toBeNull()
		})

		it("should return null if node is a marked package", () => {
			storeService.dispatch(markPackage({ attributes: {}, color: "0x000000", path: "/root" }))

			const result = codeMapActionsService.getParentMP(nodeA.path)

			expect(result).toBeNull()
		})

		it("should return marked package of root", () => {
			const expected = { attributes: {}, color: "0x000000", path: "/root" }
			storeService.dispatch(markPackage(expected))

			const result = codeMapActionsService.getParentMP(nodeA.children[0].path)

			expect(result).toEqual(expected)
		})

		it("should return the first marked package found in sorted list", () => {
			const mp1 = { attributes: {}, color: "0x000000", path: "/root" }
			const mp2 = { attributes: {}, color: "0x000000", path: "/root/Parent Leaf" }
			storeService.dispatch(markPackage(mp1))
			storeService.dispatch(markPackage(mp2))

			const result = codeMapActionsService.getParentMP(nodeA.children[1].children[0].path)

			expect(result).toEqual({ attributes: {}, color: "0x000000", path: "/root/Parent Leaf" })
		})
	})
})
