import { HierarchyNode } from "d3-hierarchy"
import {
	DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_0,
	DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_1,
	FOLDER_LABEL_TOO_SMALL_PARENT,
	getAreaValue,
	PADDING_APPROX_FOR_DEPTH_ONE,
	PADDING_APPROX_FOR_DEPTH_ZERO
} from "./treeMapGenerator"
import { CodeMapNode, State } from "../../../codeCharta.model"
import { getParent } from "../../nodePathHelper"
import { isLeaf } from "../../codeMapHelper"

const BIG_MAP = 40_000

export function calculateTotalNodeArea(
	buildingAreas: number[],
	enableFloorLabels: boolean,
	hierarchyNode: HierarchyNode<CodeMapNode>,
	padding: number,
	state: State
) {
	/**
	 * Step 1:
	 */

	if (buildingAreas.length === 0) {
		return {
			rootWidth: 0,
			rootHeight: 0,
			metricSum: hierarchyNode.sum(() => {
				return 0
			})
		}
	}

	let totalNodeArea = buildingAreas.reduce((intermediate, current) => intermediate + current + addPaddingToArea(current, padding))

	/**
	 * Step 2: Map(node_path: (node, 0))
	 */
	const nodeKeyMap = new Map()
	const nodeAreaMap = new Map()
	hierarchyNode.each(node => {
		nodeKeyMap.set(node.data.path, node)
		// TODO: Refactor to JSON object in one map
		nodeAreaMap.set(node.data.path, 0)
	})

	/**
	 * Step 3:
	 */
	for (const [nodeKey, nodeValue] of nodeKeyMap) {
		const totalChildrenArea =
			nodeValue.data.type === "Folder"
				? nodeValue.data.children.reduce((sum, node) => getAreaValue(node, state) + sum, 0)
				: getAreaValue(nodeValue.data, state)
		nodeAreaMap.set(nodeKey, totalChildrenArea)
	}

	/**
	 * Step 4:
	 */
	const paths = [...nodeKeyMap.keys()].reverse()

	/**
	 * Step 5:
	 */
	for (const nodePath of paths) {
		if (nodeKeyMap.get(nodePath)?.data.type === "Folder") {
			// TODO: skip root folder
			const parent = getParent(nodeKeyMap, nodePath)
			const parentPath = parent?.data.path

			nodeAreaMap.set(parentPath, nodeAreaMap.get(parentPath) + nodeAreaMap.get(nodePath))
		}
	}

	/**
	 * Step 6:
	 */

	// TODO Fix padding, imagine the case you have a folder that contains subfolders and leafs/nodes
	for (const nodePath of paths) {
		const parent = getParent(nodeKeyMap, nodePath)
		const parentPath = parent?.data.path
		if (nodeKeyMap.get(nodePath)?.data.type === "File") {
			if (nodeAreaMap.get(parentPath) > 0) {
				const parentArea = addPaddingToArea(nodeAreaMap.get(parentPath), padding)
				const proportion = parentArea / nodeAreaMap.get(parentPath)
				nodeAreaMap.set(nodePath, nodeAreaMap.get(nodePath) * proportion)
			}
		} else {
			nodeAreaMap.set(nodePath, 0)
		}
	}

	/**
	 * Step 7:
	 */
	hierarchyNode.sum(node => {
		return nodeAreaMap.get(node.path)
	})

	/**
	 * Step 8:
	 */
	let factor = 1
	for (const node of hierarchyNode) {
		if (!isLeaf(node.data) && node.value !== undefined) {
			const folderAreaValue = node.value

			if (enableFloorLabels && node.depth === 0) {
				if (DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_0 > Math.sqrt(folderAreaValue)) {
					factor = DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_0 / Math.sqrt(folderAreaValue)
				}

				totalNodeArea += Math.max(
					DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_0,
					Math.sqrt(folderAreaValue) * PADDING_APPROX_FOR_DEPTH_ZERO
				)
			}
			if (
				enableFloorLabels &&
				node.depth >= 1 &&
				node.depth <= 2 &&
				folderAreaValue / node.parent.value > FOLDER_LABEL_TOO_SMALL_PARENT
			) {
				if (DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_1 > Math.sqrt(folderAreaValue)) {
					factor = Math.max(factor, DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_1 / Math.sqrt(folderAreaValue))
				}

				totalNodeArea += Math.max(
					DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_1,
					Math.sqrt(folderAreaValue) * PADDING_APPROX_FOR_DEPTH_ONE
				)
			}
			totalNodeArea += (folderAreaValue + folderAreaValue * 0.001 + padding * 2) ** 2 - folderAreaValue ** 2
		}
	}

	/**
	 * Step 9:
	 */
	let rootSide = Math.max(Math.sqrt(totalNodeArea))

	/**
	 * Step 10:
	 */
	if (rootSide > BIG_MAP) {
		factor = BIG_MAP / rootSide
	}

	rootSide = rootSide * factor

	/**
	 * Step 11:
	 */
	const rootHeight = Math.ceil(rootSide)
	const rootWidth = Math.ceil(rootSide)

	const metricSum = hierarchyNode.sum(node => {
		return nodeAreaMap.get(node.path) * factor
	})

	//TODO: Implement invert area here

	return { rootWidth, rootHeight, metricSum }
}

function addPaddingToArea(area: number, padding: number) {
	return (Math.sqrt(area) + padding) ** 2
}
