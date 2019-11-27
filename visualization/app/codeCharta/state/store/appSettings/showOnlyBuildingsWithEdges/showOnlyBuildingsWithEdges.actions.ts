import { Action } from "redux"

export enum ShowOnlyBuildingsWithEdgesActions {
	SET_SHOW_ONLY_BUILDINGS_WITH_EDGES = "SET_SHOW_ONLY_BUILDINGS_WITH_EDGES"
}

export interface SetShowOnlyBuildingsWithEdgesAction extends Action {
	type: ShowOnlyBuildingsWithEdgesActions.SET_SHOW_ONLY_BUILDINGS_WITH_EDGES
	payload: boolean
}

export type ShowOnlyBuildingsWithEdgesAction = SetShowOnlyBuildingsWithEdgesAction

export function setShowOnlyBuildingsWithEdges(showOnlyBuildingsWithEdges: boolean): ShowOnlyBuildingsWithEdgesAction {
	return {
		type: ShowOnlyBuildingsWithEdgesActions.SET_SHOW_ONLY_BUILDINGS_WITH_EDGES,
		payload: showOnlyBuildingsWithEdges
	}
}
