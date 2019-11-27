import { Action } from "redux"
import { MarkedPackage } from "../../../../codeCharta.model"

export enum MarkedPackagesActions {
	SET_MARKED_PACKAGES = "SET_MARKED_PACKAGES",
	MARK_PACKAGE = "MARK_PACKAGE",
	UNMARK_PACKAGE = "UNMARK_PACKAGE"
}

export interface SetMarkedPackagesAction extends Action {
	type: MarkedPackagesActions.SET_MARKED_PACKAGES
	payload: MarkedPackage[]
}

export interface MarkPackageAction extends Action {
	type: MarkedPackagesActions.MARK_PACKAGE
	payload: MarkedPackage
}

export interface UnmarkPackageAction extends Action {
	type: MarkedPackagesActions.UNMARK_PACKAGE
	payload: MarkedPackage
}

export type MarkedPackagesAction = SetMarkedPackagesAction | MarkPackageAction | UnmarkPackageAction

export function setMarkedPackages(markedPackages: MarkedPackage[]): MarkedPackagesAction {
	return {
		type: MarkedPackagesActions.SET_MARKED_PACKAGES,
		payload: markedPackages
	}
}

export function markPackage(markedPackage: MarkedPackage): MarkedPackagesAction {
	return {
		type: MarkedPackagesActions.MARK_PACKAGE,
		payload: markedPackage
	}
}

export function unmarkPackage(markedPackage: MarkedPackage): MarkedPackagesAction {
	return {
		type: MarkedPackagesActions.UNMARK_PACKAGE,
		payload: markedPackage
	}
}
