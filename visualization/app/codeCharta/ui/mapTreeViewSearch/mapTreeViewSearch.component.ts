import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import { IRootScopeService } from "angular"
import "./mapTreeViewSearch.component.scss"
import { CodeMapUtilService } from "../codeMap/codeMap.util.service"
import {
	CodeMapNode,
	BlacklistType,
	Settings,
	FileState
} from "../../codeCharta.model"
import {FileStateService, FileStateServiceSubscriber} from "../../state/fileState.service";
import {CodeMapActionsService} from "../codeMap/codeMap.actions.service";
import {CodeMapRenderService} from "../codeMap/codeMap.render.service";
import * as d3 from "d3"

export class MapTreeViewSearchController implements SettingsServiceSubscriber, FileStateServiceSubscriber {

	private _viewModel: {
		searchPattern: string,
		fileCount: number,
		hideCount: number,
		excludeCount: number,
		isPatternExcluded: boolean,
		isPatternHidden: boolean
	} = {
		searchPattern: "",
		fileCount: 0,
		hideCount: 0,
		excludeCount: 0,
		isPatternExcluded: true,
		isPatternHidden: true
	}

	private searchedFiles: CodeMapNode[] = []

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		private codeMapActionsService: CodeMapActionsService,
		private codeMapRenderService: CodeMapRenderService
	) {
		SettingsService.subscribe(this.$rootScope, this)
		FileStateService.subscribe(this.$rootScope, this)
	}


	public onFileSelectionStatesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
		this._viewModel.searchPattern = ""
	}

	public onImportedFilesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
	}

	public onSettingsChanged(s: Settings) {
		this.updateViewModel()
	}

	public onSearchChange() {
		this.setSearchedNodePathNames()
		this.updateViewModel()
	}

	public onClickBlacklistPattern(blacklistType: BlacklistType) {
		this.codeMapActionsService.pushItemToBlacklist({ path: this._viewModel.searchPattern, type: blacklistType })
		this._viewModel.searchPattern = ""
		this.onSearchChange()
	}

	private updateViewModel() {
		const blacklist = this.settingsService.getSettings().fileSettings.blacklist
		this._viewModel.isPatternExcluded = this.isPatternBlacklisted(BlacklistType.exclude)
		this._viewModel.isPatternHidden = this.isPatternBlacklisted(BlacklistType.hide)

		this._viewModel.fileCount = this.searchedFiles.length
		this._viewModel.hideCount = this.searchedFiles.filter(node =>
			CodeMapUtilService.isBlacklisted(node, blacklist, BlacklistType.hide)
		).length
		this._viewModel.excludeCount = this.searchedFiles.filter(node =>
			CodeMapUtilService.isBlacklisted(node, blacklist, BlacklistType.exclude)
		).length
	}

	private isPatternBlacklisted(blacklistType: BlacklistType) {
		return (
			this.settingsService.getSettings().fileSettings.blacklist.filter(item => {
				return this._viewModel.searchPattern == item.path && blacklistType == item.type
			}).length != 0
		)
	}

	private setSearchedNodePathNames() {
		const nodes = d3
			.hierarchy(this.codeMapRenderService.getRenderFile().map)
			.descendants()
			.map(d => d.data)
		const searchedNodes = CodeMapUtilService.getNodesByGitignorePath(nodes, this._viewModel.searchPattern)

		this.searchedFiles = searchedNodes.filter(node => !(node.children && node.children.length > 0))

		this.settingsService.updateSettings({
			dynamicSettings: {
				searchedNodePaths: searchedNodes.map(n => n.path),
				searchPattern: this._viewModel.searchPattern
			}
		})
	}
}

export const mapTreeViewSearchComponent = {
	selector: "mapTreeViewSearchComponent",
	template: require("./mapTreeViewSearch.component.html"),
	controller: MapTreeViewSearchController
}
