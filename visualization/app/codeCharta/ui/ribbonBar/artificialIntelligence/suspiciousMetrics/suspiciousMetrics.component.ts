import { Component, Input, ViewEncapsulation } from "@angular/core"
import { ArtificialIntelligenceData } from "../selectors/artificialIntelligence.selector"

@Component({
	selector: "cc-suspicious-metrics",
	templateUrl: "./suspiciousMetrics.component.html",
	encapsulation: ViewEncapsulation.None
})
export class SuspiciousMetricsComponent {
	@Input() data: Pick<
		ArtificialIntelligenceData,
		"analyzedProgrammingLanguage" | "unsuspiciousMetrics" | "suspiciousMetricSuggestionLinks" | "untrackedMetrics"
	>
}
