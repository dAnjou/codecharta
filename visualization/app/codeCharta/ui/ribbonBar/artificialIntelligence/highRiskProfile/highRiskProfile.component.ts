import { Component, Input, ViewEncapsulation } from "@angular/core"
import { ArtificialIntelligenceData } from "../selectors/artificialIntelligence.selector"

@Component({
    selector: "cc-high-risk-profile",
    templateUrl: "./highRiskProfile.component.html",
    styleUrl: "./highRiskProfile.component.scss",
    encapsulation: ViewEncapsulation.None
})
export class HighRiskProfileComponent {
    @Input() data: Pick<ArtificialIntelligenceData, "analyzedProgrammingLanguage" | "riskProfile">
}
