import { stubDate } from "../../../mocks/dateMock.helper"
import { FileDownloader } from "./fileDownloader"
import { CCFile, ExportCCFile } from "../codeCharta.model"
import { TEST_FILE_DATA, TEST_FILE_DATA_DOWNLOADED } from "./dataMocks"
import { DownloadCheckboxNames } from "../ui/dialog/dialog.download.component"

describe("fileDownloader", () => {
	let file: CCFile
	let downloadedFile: ExportCCFile
	let fileName: string
	let fileNameWithExtension: string
	let downloadSettingsNames: string[]

	beforeEach(() => {
		file = TEST_FILE_DATA
		downloadedFile = TEST_FILE_DATA_DOWNLOADED
		fileName = "foo_2019-04-22_18-01"
		fileNameWithExtension = "foo_2019-04-22_18-01.cc.json"
		downloadSettingsNames = [DownloadCheckboxNames.edges, DownloadCheckboxNames.excludes, DownloadCheckboxNames.hides]

		stubDate(new Date("2018-12-14T09:39:59"))
		FileDownloader["downloadData"] = jest.fn()
	})

	describe("downloadCurrentMap", () => {
		it("should download a file and match snapshot", () => {
			const downloadedMap = FileDownloader.downloadCurrentMap(file, downloadSettingsNames, fileName)

			expect(FileDownloader["downloadData"]).toHaveBeenCalledTimes(1)
			expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(TEST_FILE_DATA_DOWNLOADED, fileNameWithExtension)
			expect(downloadedMap).toMatchSnapshot()
		})

		it("should download map correctly", () => {
			FileDownloader.downloadCurrentMap(file, downloadSettingsNames, fileName)

			expect(FileDownloader["downloadData"]).toHaveBeenCalledTimes(1)
			expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(downloadedFile, fileNameWithExtension)
		})
	})
})
