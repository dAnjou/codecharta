import { Component, Inject, Input, OnInit } from "@angular/core"
import { Observable } from "rxjs"

import { MapColors, CodeMapNode } from "../../../codeCharta.model"
import { Store } from "../../../state/angular-redux/store"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { mapColorsSelector } from "../../../state/store/appSettings/mapColors/mapColors.selector"

@Component({
	selector: "cc-metric-delta-selected",
	template: require("./metricDeltaSelected.component.html")
})
export class MetricDeltaSelectedComponent implements OnInit {
	@Input() metricName: string

	selectedNode$: Observable<CodeMapNode>
	mapColors$: Observable<MapColors>

	constructor(@Inject(Store) private store: Store) {}

	ngOnInit(): void {
		this.selectedNode$ = this.store.select(selectedNodeSelector)
		this.mapColors$ = this.store.select(mapColorsSelector)
	}
}
