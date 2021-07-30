import { goto } from "../../../puppeteer.helper"
import { NodeContextMenuPageObject } from "./nodeContextMenu.po"
import { SearchPanelModeSelectorPageObject } from "../searchPanelModeSelector/searchPanelModeSelector.po"
import { MapTreeViewLevelPageObject } from "../mapTreeView/mapTreeView.level.po"
import { CodeMapPageObject } from "../codeMap/codeMap.po"
import { ERROR_MESSAGES } from "../../util/fileValidator"
import { DialogErrorPageObject } from "../dialog/dialog.error.po"
import pti from "puppeteer-to-istanbul"

describe("NodeContextMenu", () => {
	let contextMenu: NodeContextMenuPageObject
	let searchPanelModeSelector: SearchPanelModeSelectorPageObject
	let mapTreeViewLevel: MapTreeViewLevelPageObject
	let codeMap: CodeMapPageObject
	let dialogError: DialogErrorPageObject

	beforeEach(async () => {
		contextMenu = new NodeContextMenuPageObject()
		searchPanelModeSelector = new SearchPanelModeSelectorPageObject()
		mapTreeViewLevel = new MapTreeViewLevelPageObject()
		codeMap = new CodeMapPageObject()
		dialogError = new DialogErrorPageObject()
		await Promise.all([page.coverage.startJSCoverage(), page.coverage.startCSSCoverage()])

		await goto()
	})

	afterEach(async () => {
		const [jsCoverage, cssCoverage] = await Promise.all([page.coverage.stopJSCoverage(), page.coverage.stopCSSCoverage()])
		pti.write([...jsCoverage, ...cssCoverage], { includeHostname: true, storagePath: "./dist/e2eCoverage" })
	})

	it("should show error message when user excludes all files", async () => {
		await searchPanelModeSelector.toggleTreeView()
		await mapTreeViewLevel.openContextMenu("/root")
		await contextMenu.clickOnExclude()

		expect(await dialogError.getMessage()).toEqual(`${ERROR_MESSAGES.blacklistError}`)
	})

	it("right clicking a folder should open a context menu with color options", async () => {
		await searchPanelModeSelector.toggleTreeView()
		await mapTreeViewLevel.openContextMenu("/root")

		const result = await contextMenu.hasColorButtons()
		expect(await result.isIntersectingViewport()).toBe(true)
	})

	it("clicking the map should close open node context menu", async () => {
		await searchPanelModeSelector.toggleTreeView()
		await mapTreeViewLevel.openContextMenu("/root")

		await contextMenu.isOpened()

		await codeMap.clickMap()
		await contextMenu.isClosed()
	})

	it("right clicking the map should close open node context menu already on mousedown", async () => {
		await searchPanelModeSelector.toggleTreeView()
		await mapTreeViewLevel.openContextMenu("/root")

		await contextMenu.isOpened()

		await codeMap.rightClickMouseDownOnMap()
		await contextMenu.isClosed()
	}, 60000)

	it("zoom in and out or using mouse wheel on the map should close open node context menu", async () => {
		await searchPanelModeSelector.toggleTreeView()
		await mapTreeViewLevel.openContextMenu("/root")

		await contextMenu.isOpened()

		await codeMap.mouseWheelWithinMap()
		await contextMenu.isClosed()
	})
})
