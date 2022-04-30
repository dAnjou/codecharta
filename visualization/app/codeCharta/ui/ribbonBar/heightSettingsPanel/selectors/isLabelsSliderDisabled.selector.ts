import { createSelector } from "../../../../state/angular-redux/createSelector"
import { colorLabelsSelector } from "../../../../state/store/appSettings/colorLabels/colorLabels.selector"

export const isLabelsSliderDisabledSelector = createSelector(
	[colorLabelsSelector],
	colorLabels => colorLabels.negative || colorLabels.neutral || colorLabels.positive
)
