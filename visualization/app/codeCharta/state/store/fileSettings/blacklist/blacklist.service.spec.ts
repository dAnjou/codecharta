import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import * as FilesHelper from "../../../../model/files/files.helper"
import { BlacklistService } from "./blacklist.service"
import { BlacklistAction, BlacklistActions } from "./blacklist.actions"
import { BlacklistItem, BlacklistType } from "../../../../codeCharta.model"
import { PresentationModeActions } from "../../appSettings/isPresentationMode/isPresentationMode.actions"
import { FILE_STATES, withMockedEventMethods } from "../../../../util/dataMocks"
import { FilesService } from "../../files/files.service"

describe("BlacklistService", () => {
	let blacklistService: BlacklistService
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildService() {
		blacklistService = new BlacklistService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, blacklistService)
		})

		it("should subscribe to FilesService", () => {
			FilesService.subscribe = jest.fn()

			rebuildService()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, blacklistService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new blacklist", () => {
			const item: BlacklistItem = { type: BlacklistType.exclude, path: "foo/bar" }
			const action: BlacklistAction = { type: BlacklistActions.ADD_BLACKLIST_ITEM, payload: item }
			storeService["store"].dispatch(action)

			blacklistService.onStoreChanged(BlacklistActions.ADD_BLACKLIST_ITEM)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("blacklist-changed", { blacklist: [item] })
		})

		it("should not notify anything on non-blacklist-events", () => {
			blacklistService.onStoreChanged(PresentationModeActions.SET_PRESENTATION_MODE)

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})

	describe("resultsInEmptyMap", () => {
		it("should return true when all files are empty", () => {
			jest.spyOn(FilesHelper, "getVisibleFileStates").mockReturnValue(FILE_STATES)
			const blacklistItem: BlacklistItem[] = [{ path: "/root", type: BlacklistType.exclude }]

			expect(blacklistService.resultsInEmptyMap(blacklistItem)).toBe(true)
		})

		it("should return false when files are left", () => {
			blacklistService.isIncludedNode = jest.fn(() => true)
			jest.spyOn(FilesHelper, "getVisibleFileStates").mockReturnValue(FILE_STATES)
			const blacklistItem: BlacklistItem[] = [{ path: "/root/Parent Leaf", type: BlacklistType.exclude }]

			expect(blacklistService.resultsInEmptyMap(blacklistItem)).toBe(false)
		})
	})
})
