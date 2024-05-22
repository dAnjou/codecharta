import { Component, Input } from "@angular/core"
import { ArtificialIntelligenceData } from "../selectors/artificialIntelligence.selector"

@Component({
	selector: "cc-untracked-metrics-list",
	templateUrl: "./untrackedMetricsList.component.html"
})
export class UntrackedMetricsListComponent {
	@Input() data: Pick<
		ArtificialIntelligenceData,
		"analyzedProgrammingLanguage" | "unsuspiciousMetrics" | "suspiciousMetricSuggestionLinks" | "untrackedMetrics"
	>

	isUnsuspiciuosMetricsVisible = false
	isUntrackedMetricsVisible = false

	toggleUntrackedMetricsVisibility(): void {
		this.isUntrackedMetricsVisible = !this.isUntrackedMetricsVisible
	}

	toggleUnsuspiciousMetricsVisibility(): void {
		this.isUnsuspiciuosMetricsVisible = !this.isUnsuspiciuosMetricsVisible
	}
}
