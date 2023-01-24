import { Component, ViewEncapsulation } from "@angular/core"
import { Observable, map } from "rxjs"
import { KeyValue } from "@angular/common"

import { Store } from "../../../state/angular-redux/store"
import { legendMarkedPackagesSelector, MarkedPackagesMap } from "./legendMarkedPackages.selector"
import { markPackages } from "../../../state/store/fileSettings/markedPackages/markedPackages.actions"

type MarkedPackagesMapKeyValue = KeyValue<keyof MarkedPackagesMap, MarkedPackagesMap[keyof MarkedPackagesMap]>

@Component({
	selector: "cc-legend-marked-packages",
	templateUrl: "./legendMarkedPackages.component.html",
	styleUrls: ["./legendMarkedPackages.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class LegendMarkedPackagesComponent {
	markedPackagesMap$: Observable<MarkedPackagesMap>
	hasMarkedPackages$: Observable<boolean>

	constructor(private store: Store) {
		this.markedPackagesMap$ = store.select(legendMarkedPackagesSelector)
		this.hasMarkedPackages$ = this.markedPackagesMap$.pipe(map(markedPackagesMap => Object.keys(markedPackagesMap).length > 0))
	}

	handleColorChange(newHexColor: string, paths: string[]) {
		this.store.dispatch(
			markPackages(
				paths.map(path => ({
					color: newHexColor,
					path
				}))
			)
		)
	}

	trackMarkedPackage(_: number, { value }: { value: string[] }) {
		return value.join(",")
	}

	sortMarkedPackagesMap(kv1: MarkedPackagesMapKeyValue, kv2: MarkedPackagesMapKeyValue) {
		return kv1.value[0].localeCompare(kv2.value[0])
	}
}
