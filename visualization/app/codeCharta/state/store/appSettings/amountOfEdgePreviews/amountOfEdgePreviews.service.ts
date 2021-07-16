import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { AmountOfEdgePreviewsActions } from "./amountOfEdgePreviews.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface AmountOfEdgePreviewsSubscriber {
	onAmountOfEdgePreviewsChanged(amountOfEdgePreviews: number)
}

export class AmountOfEdgePreviewsService implements StoreSubscriber {
	private static AMOUNT_OF_EDGE_PREVIEWS_CHANGED_EVENT = "amount-of-edge-previews-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, AmountOfEdgePreviewsActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.amountOfEdgePreviews
	}

	private notify(newState: number) {
		this.$rootScope.$broadcast(AmountOfEdgePreviewsService.AMOUNT_OF_EDGE_PREVIEWS_CHANGED_EVENT, {
			amountOfEdgePreviews: newState
		})
	}

	static subscribe($rootScope: IRootScopeService, subscriber: AmountOfEdgePreviewsSubscriber) {
		$rootScope.$on(AmountOfEdgePreviewsService.AMOUNT_OF_EDGE_PREVIEWS_CHANGED_EVENT, (_event_, data) => {
			subscriber.onAmountOfEdgePreviewsChanged(data.amountOfEdgePreviews)
		})
	}
}
