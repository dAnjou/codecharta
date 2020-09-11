import { validate } from "./util/fileValidator"
import { CCFile, NameDataPair } from "./codeCharta.model"
import _ from "lodash"
import { NodeDecorator } from "./util/nodeDecorator"
import { ExportCCFile } from "./codeCharta.api.model"
import { StoreService } from "./state/store.service"
import { resetFiles, setFiles, setSingle } from "./state/store/files/files.actions"
import { getCCFiles } from "./model/files/files.helper"
import { DialogService } from "./ui/dialog/dialog.service"
import { setState } from "./state/store/state.actions"
import { ScenarioHelper } from "./util/scenarioHelper"
import { setIsLoadingFile } from "./state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { FileSelectionState, FileState } from "./model/files/files"
import { getCCFile } from "./util/fileHelper"

export class CodeChartaService {
	public static ROOT_NAME = "root"
	public static ROOT_PATH = "/" + CodeChartaService.ROOT_NAME
	public static readonly CC_FILE_EXTENSION = ".cc.json"
	private fileStates: FileState[] = []

	constructor(private storeService: StoreService, private dialogService: DialogService) {}

	public loadFiles(nameDataPairs: NameDataPair[]) {
		for (const nameDataPair of nameDataPairs) {
			try {
				validate(nameDataPair.content)
				this.addFile(nameDataPair.fileName, nameDataPair.content)
			} catch (e) {
				if (!_.isEmpty(e.error)) {
					this.fileStates = []
					this.storeService.dispatch(setIsLoadingFile(false))
					this.dialogService.showValidationErrorDialog(e)
					break
				}

				if (!_.isEmpty(e.warning)) {
					this.addFile(nameDataPair.fileName, nameDataPair.content)
					this.dialogService.showValidationWarningDialog(e)
				}
			}
		}

		if (this.fileStates.length !== 0) {
			this.storeService.dispatch(resetFiles())
			this.storeService.dispatch(setFiles(this.fileStates))
			this.fileStates = []
			this.storeService.dispatch(setSingle(getCCFiles(this.storeService.getState().files)[0]))
			this.setDefaultScenario()
		}
	}

	private addFile(fileName: string, migratedFile: ExportCCFile) {
		const ccFile: CCFile = getCCFile(fileName, migratedFile)
		NodeDecorator.decorateMapWithPathAttribute(ccFile)
		this.fileStates.push({ file: ccFile, selectedAs: FileSelectionState.None })
	}

	private setDefaultScenario() {
		const { areaMetric, heightMetric, colorMetric } = ScenarioHelper.getDefaultScenarioSetting().dynamicSettings
		const names = [areaMetric, heightMetric, colorMetric]
		const metricNames = new Set(this.storeService.getState().metricData.nodeMetricData.map(x => x.name))

		const existsInMetricData = (metric: string) => metricNames.has(metric)

		if (names.every(existsInMetricData)) {
			this.storeService.dispatch(setState(ScenarioHelper.getDefaultScenarioSetting()))
		}
	}
}
