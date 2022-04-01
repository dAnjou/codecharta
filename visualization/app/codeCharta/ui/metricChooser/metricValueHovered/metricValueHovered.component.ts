import { Component, Inject, Input } from "@angular/core"
import { Observable } from "rxjs"
import { CodeMapNode, PrimaryMetrics } from "../../../codeCharta.model"
import { Store } from "../../../state/angular-redux/store"
import { hoveredNodeSelector } from "../../../state/selectors/hoveredNode.selector"
import { primaryMetricNamesSelector } from "../../../state/selectors/primaryMetrics/primaryMetricNames.selector"

@Component({
	selector: "cc-metric-value-hovered",
	template: require("./metricValueHovered.component.html")
})
export class MetricValueHoveredComponent {
	@Input() metricFor: keyof PrimaryMetrics

	hoveredNode$: Observable<CodeMapNode | undefined>
	primaryMetricNames$: Observable<PrimaryMetrics>

	constructor(@Inject(Store) store: Store) {
		this.primaryMetricNames$ = store.select(primaryMetricNamesSelector)
		this.hoveredNode$ = store.select(hoveredNodeSelector)
	}
}
