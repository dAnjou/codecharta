import { setupFiles, TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../../util/dataMocks"
import {
	fileStatesAvailable,
	getCCFiles,
	getFileByFileName,
	getVisibleFiles,
	getVisibleFileStates,
	haveEqualRootNames,
	isDeltaState,
	isPartialState
} from "./files.helper"
import { FileSelectionState, FileState } from "./files"
import { CCFile, NodeType } from "../../codeCharta.model"

describe("files", () => {
	let files: FileState[]

	beforeEach(() => {
		files = setupFiles()
	})

	describe("getVisibleFiles", () => {
		it("should return an empty array when no files are selected", () => {
			const result = getVisibleFiles(files)

			expect(result).toEqual([])
			expect(result.length).toBe(0)
		})

		it("should return an array when all files are selected", () => {
			files[0].selectedAs = FileSelectionState.Partial
			files[1].selectedAs = FileSelectionState.Partial

			const result = getVisibleFiles(files)

			expect(result[0]).toEqual(TEST_DELTA_MAP_A)
			expect(result[1]).toEqual(TEST_DELTA_MAP_B)
			expect(result.length).toBe(2)
		})

		it("should return an array when only some files are selected", () => {
			files[0].selectedAs = FileSelectionState.Partial

			const result = getVisibleFiles(files)

			expect(result[0]).toEqual(TEST_DELTA_MAP_A)
			expect(result.length).toBe(1)
		})
	})

	describe("getVisibleFileStates", () => {
		it("should return an empty array when no files are selected", () => {
			const result = getVisibleFileStates(files)

			expect(result).toEqual([])
			expect(result.length).toBe(0)
		})

		it("should return an array when all files are selected", () => {
			files[0].selectedAs = FileSelectionState.Partial
			files[1].selectedAs = FileSelectionState.Partial

			const result = getVisibleFileStates(files)

			expect(result[0]).toEqual(files[0])
			expect(result[1]).toEqual(files[1])
			expect(result.length).toBe(2)
		})

		it("should return an array when only some files are selected", () => {
			files[0].selectedAs = FileSelectionState.Partial

			const result = getVisibleFileStates(files)

			expect(result[0]).toEqual(files[0])
			expect(result.length).toBe(1)
		})
	})

	describe("getFileByFileName", () => {
		it("should return undefined if no files match the fileName", () => {
			const result = getFileByFileName(files, "fileC")

			expect(result).not.toBeDefined()
		})

		it("should return the fileState if a file matches the fileName", () => {
			const result = getFileByFileName(files, TEST_DELTA_MAP_A.fileMeta.fileName)

			expect(result).toEqual(TEST_DELTA_MAP_A)
		})

		it("should return the first fileState found if multiple files match the fileName", () => {
			const expectedFiles = [...files, { file: TEST_DELTA_MAP_A, selectedAs: FileSelectionState.None }]

			const result = getFileByFileName(expectedFiles, TEST_DELTA_MAP_A.fileMeta.fileName)

			expect(result).toEqual(TEST_DELTA_MAP_A)
		})
	})

	describe("isDeltaState", () => {
		it("should return true if fileStates contains COMPARISON and REFERENCE", () => {
			files[0].selectedAs = FileSelectionState.Reference
			files[1].selectedAs = FileSelectionState.Comparison

			const result = isDeltaState(files)

			expect(result).toBeTruthy()
		})

		it("should return false if the filerStates does not contain COMPARISON or REFERENCE", () => {
			const result = isDeltaState(files)

			expect(result).toBeFalsy()
		})

		it("should reset the previous selection", () => {
			files[0].selectedAs = FileSelectionState.Partial
			files[0].selectedAs = FileSelectionState.Reference
			files[1].selectedAs = FileSelectionState.Comparison

			expect(isDeltaState(files)).toBeTruthy()
			expect(isPartialState(files)).toBeFalsy()
		})
	})

	describe("isPartialState", () => {
		it("should return true if fileStates contains PARTIAL", () => {
			files[0].selectedAs = FileSelectionState.Partial
			files[1].selectedAs = FileSelectionState.Partial

			const result = isPartialState(files)

			expect(result).toBeTruthy()
		})

		it("should return false if the first fileSelectionState is not PARTIAL or undefined", () => {
			const result = isPartialState(files)

			expect(result).toBeFalsy()
		})

		it("should reset the previous selection", () => {
			files[0].selectedAs = FileSelectionState.Reference
			files[1].selectedAs = FileSelectionState.Comparison
			files[0].selectedAs = FileSelectionState.Partial
			files[1].selectedAs = FileSelectionState.Partial

			expect(isPartialState(files)).toBeTruthy()
			expect(isDeltaState(files)).toBeFalsy()
		})
	})

	describe("getCCFiles", () => {
		it("should return all added files from fileStates", () => {
			const expected = [TEST_DELTA_MAP_A, TEST_DELTA_MAP_B]

			const result = getCCFiles(files)

			expect(result).toEqual(expected)
			expect(result.length).toBe(2)
		})

		it("should return an empty array if no files are added to fileStates", () => {
			files = []

			const result = getCCFiles(files)

			expect(result).toEqual([])
			expect(result.length).toBe(0)
		})
	})

	describe("fileStatesAvailable", () => {
		it("should be false if no file states available", () => {
			files[0].selectedAs = FileSelectionState.None
			files[1].selectedAs = FileSelectionState.None

			expect(fileStatesAvailable(files)).toBeFalsy()
		})

		it("should be false if file states are available, but non are visible", () => {
			expect(fileStatesAvailable(files)).toBeFalsy()
		})

		it("should be true if visible file states are available", () => {
			files[0].selectedAs = FileSelectionState.Partial

			expect(fileStatesAvailable(files)).toBeTruthy()
		})
	})

	describe("haveEqualRootNames", () => {
		it("should return false if root names are different", () => {
			const reference = { map: { name: "rootA", type: NodeType.FOLDER } } as CCFile
			const comp = { map: { name: "rootB", type: NodeType.FOLDER } } as CCFile

			expect(haveEqualRootNames(reference, comp)).toBeFalsy()
		})

		it("should return true if we compare root/app/index.ts and root/myApp.ts", () => {
			const reference = {
				map: {
					name: "root",
					type: NodeType.FOLDER,
					children: [{ name: "myApp.ts", type: NodeType.FILE }]
				}
			} as CCFile
			const comp = {
				map: {
					name: "root",
					type: NodeType.FOLDER,
					children: [
						{
							name: "app",
							type: NodeType.FOLDER,
							children: [{ name: "index.ts", type: NodeType.FILE }]
						}
					]
				}
			} as CCFile

			expect(haveEqualRootNames(reference, comp)).toBeTruthy()
		})
	})
})
