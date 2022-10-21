import { Inject, Injectable } from "@angular/core"
import { CodeMapMesh } from "./rendering/codeMapMesh"
import { createTreemapNodes } from "../../util/algorithm/treeMapLayout/treeMapGenerator"
import { CodeMapLabelService } from "./codeMap.label.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { CodeMapNode, LayoutAlgorithm, Node } from "../../codeCharta.model"
import { isDeltaState } from "../../model/files/files.helper"
import { StreetLayoutGenerator } from "../../util/algorithm/streetLayout/streetLayoutGenerator"
import { ThreeStatsService } from "./threeViewer/threeStats.service"
import { nodeMetricDataSelector } from "../../state/selectors/accumulatedData/metricData/nodeMetricData.selector"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { Store } from "../../state/angular-redux/store"
import { isLoadingFileSelector } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.selector"
import { tap } from "rxjs"
import { State } from "../../state/angular-redux/state"

@Injectable({ providedIn: "root" })
export class CodeMapRenderService {
	private nodesByColor = {
		positive: [],
		neutral: [],
		negative: []
	}
	private unflattenedNodes

	constructor(
		@Inject(Store) private store: Store,
		@Inject(State) private state: State,
		@Inject(ThreeSceneService) private threeSceneService: ThreeSceneService,
		@Inject(CodeMapLabelService) private codeMapLabelService: CodeMapLabelService,
		@Inject(CodeMapArrowService) private codeMapArrowService: CodeMapArrowService,
		@Inject(ThreeStatsService) private threeStatsService: ThreeStatsService,
		@Inject(CodeMapMouseEventService) private codeMapMouseEventService: CodeMapMouseEventService
	) {
		this.store.select(isLoadingFileSelector).pipe(tap(this.onIsLoadingFileChanged)).subscribe()
	}

	onIsLoadingFileChanged = (isLoadingFile: boolean) => {
		if (isLoadingFile) {
			this.threeSceneService?.dispose()
		} else {
			this.threeStatsService?.resetPanels()
		}
	}

	render(map: CodeMapNode) {
		const nodes = this.getNodes(map)
		const visibleSortedNodes = nodes
			.filter(node => node.visible && node.length > 0 && node.width > 0)
			.sort((a, b) => b.height - a.height)
		this.unflattenedNodes = visibleSortedNodes.filter(({ flat }) => !flat)

		this.setNewMapMesh(nodes, visibleSortedNodes)
		this.getNodesMatchingColorSelector(this.unflattenedNodes)
		this.setLabels(this.unflattenedNodes)
		this.setArrows(visibleSortedNodes)
		this.scaleMap()
	}

	private setNewMapMesh(allMeshNodes, visibleSortedNodes) {
		const state = this.state.getValue()
		const mapMesh = new CodeMapMesh(visibleSortedNodes, state, isDeltaState(state.files))
		this.threeSceneService.setMapMesh(allMeshNodes, mapMesh)
	}

	scaleMap() {
		this.codeMapMouseEventService.unhoverNode()
		this.codeMapLabelService.scale()
		this.codeMapArrowService.scale()
		this.threeSceneService.scaleHeight()
		this.codeMapLabelService.clearLabels()
		this.setLabels(this.unflattenedNodes)
	}

	private getNodes(map: CodeMapNode) {
		const state = this.state.getValue()
		const nodeMetricData = nodeMetricDataSelector(state)
		const {
			appSettings: { layoutAlgorithm },
			files
		} = state
		const deltaState = isDeltaState(files)
		switch (layoutAlgorithm) {
			case LayoutAlgorithm.StreetMap:
			case LayoutAlgorithm.TreeMapStreet:
				return StreetLayoutGenerator.createStreetLayoutNodes(map, state, nodeMetricData, deltaState)
			case LayoutAlgorithm.SquarifiedTreeMap:
				return createTreemapNodes(map, state, nodeMetricData, deltaState)
			default:
				return []
		}
	}

	private getNodesMatchingColorSelector(sortedNodes: Node[]) {
		const dynamicSettings = this.state.getValue().dynamicSettings

		this.nodesByColor = {
			positive: [],
			negative: [],
			neutral: []
		}

		for (const node of sortedNodes) {
			if (node.isLeaf) {
				const metric = node.attributes[dynamicSettings.colorMetric]
				if (metric != null) {
					if (metric < dynamicSettings.colorRange.from) {
						this.nodesByColor.positive.push(node)
					} else if (metric < dynamicSettings.colorRange.to) {
						this.nodesByColor.neutral.push(node)
					} else {
						this.nodesByColor.negative.push(node)
					}
				}
			}
		}
	}

	private setBuildingLabel(nodes: Node[], highestNodeInSet: number) {
		for (const node of nodes) {
			this.codeMapLabelService.addLeafLabel(node, highestNodeInSet)
		}
	}

	private setLabels(sortedNodes: Node[]) {
		this.codeMapLabelService.clearLabels()

		if (sortedNodes === undefined || sortedNodes.length === 0) {
			return
		}

		const {
			showMetricLabelNodeName,
			showMetricLabelNameValue,
			colorLabels: colorLabelOptions,
			amountOfTopLabels
		} = this.state.getValue().appSettings

		if (showMetricLabelNodeName || showMetricLabelNameValue) {
			const highestNodeInSet = sortedNodes[0].height

			for (const colorType of ["positive", "neutral", "negative"]) {
				if (colorLabelOptions[colorType]) {
					this.setBuildingLabel(this.nodesByColor[colorType], highestNodeInSet)
				}
			}

			if (!(colorLabelOptions.negative || colorLabelOptions.neutral || colorLabelOptions.positive)) {
				const nodes = sortedNodes.filter(node => node.isLeaf).slice(0, amountOfTopLabels)
				this.setBuildingLabel(nodes, highestNodeInSet)
			}
		}
	}

	private setArrows(sortedNodes: Node[]) {
		this.codeMapArrowService.clearArrows()
		this.codeMapArrowService.addEdgePreview(sortedNodes)
	}
}
