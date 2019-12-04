import { AmountOfEdgePreviewsAction, AmountOfEdgePreviewsActions } from "./amountOfEdgePreviews.actions"

export function amountOfEdgePreviews(state: number = 1, action: AmountOfEdgePreviewsAction): number {
	switch (action.type) {
		case AmountOfEdgePreviewsActions.SET_AMOUNT_OF_EDGE_PREVIEWS:
			return action.payload
		default:
			return state
	}
}
