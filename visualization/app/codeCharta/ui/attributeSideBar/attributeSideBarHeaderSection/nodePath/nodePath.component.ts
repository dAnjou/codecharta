import { Component, Inject, Input, OnInit } from "@angular/core"
import { Observable } from "rxjs"

import { Store } from "../../../../state/angular-redux/store"
import { CodeMapNode } from "../../../../codeCharta.model"
import { fileCountDescriptionSelector } from "./fileCountDescription.selector"

@Component({
	selector: "cc-node-path",
	template: require("./nodePath.component.html")
})
export class NodePathComponent implements OnInit {
	@Input() node?: Pick<CodeMapNode, "path" | "children">
	fileCountDescription$: Observable<string | undefined>

	constructor(@Inject(Store) store: Store) {
		this.fileCountDescription$ = store.select(fileCountDescriptionSelector)
	}
}
