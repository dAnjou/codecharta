import { Component, Input } from "@angular/core"
import { Store } from "@ngrx/store"
import { map } from "rxjs"

import { CodeMapNode, CcState } from "../../../../codeCharta.model"
import { currentFocusedNodePathSelector } from "../../../store/dynamicSettings/focusedNodePath/currentFocused.selector"
import { focusNode, unfocusAllNodes, unfocusNode } from "../../../store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { focusedNodePathSelector } from "../../../store/dynamicSettings/focusedNodePath/focusedNodePath.selector"
import { ThreeMapControlsService } from "../../../../ui/codeMap/threeViewer/threeMapControls.service"

@Component({
    selector: "cc-focus-buttons",
    templateUrl: "./focusButtons.component.html",
    styleUrls: ["../nodeContextMenuButton.component.scss"]
})
export class FocusButtonsComponent {
    @Input() codeMapNode: Pick<CodeMapNode, "path">

    currentFocusedNodePath$ = this.store.select(currentFocusedNodePathSelector)
    hasPreviousFocusedNodePath$ = this.store.select(focusedNodePathSelector).pipe(map(focusedNodePaths => focusedNodePaths.length > 1))

    constructor(
        private store: Store<CcState>,
        private threeMapControlsService: ThreeMapControlsService
    ) {}

    handleFocusNodeClicked() {
        this.store.dispatch(focusNode({ value: this.codeMapNode.path }))
        this.threeMapControlsService.focusOnNode(this.codeMapNode.path)
    }

    handleUnfocusNodeClicked() {
        this.store.dispatch(unfocusNode())
        this.threeMapControlsService.unfocusNode()
    }

    handleUnfocusAllNodesClicked() {
        this.store.dispatch(unfocusAllNodes())
    }
}
