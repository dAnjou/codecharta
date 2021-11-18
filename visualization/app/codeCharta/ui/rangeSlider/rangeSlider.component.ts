import "./rangeSlider.component.scss"
import { ColorRange } from "../../codeCharta.model"
import angular, { IRootScopeService, ITimeoutService, RzSlider } from "angular"
import { StoreService } from "../../state/store.service"
import { setColorRange, SetColorRangeAction } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import debounce from "lodash.debounce"
import { ColorRangeService, ColorRangeSubscriber } from "../../state/store/dynamicSettings/colorRange/colorRange.service"
import { ColorMetricService, ColorMetricSubscriber } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"
import { FilesService, FilesSelectionSubscriber } from "../../state/store/files/files.service"
import { isDeltaState } from "../../model/files/files.helper"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"
import { MapColorsService, MapColorsSubscriber } from "../../state/store/appSettings/mapColors/mapColors.service"

export interface ColorRangeFromSubscriber {
	onColorRangeFromUpdated(colorMetric: string, fromValue: number)
}

export interface ColorRangeToSubscriber {
	onColorRangeToUpdated(colorMetric: string, toValue: number)
}

export class RangeSliderController
	implements ColorMetricSubscriber, ColorRangeSubscriber, FilesSelectionSubscriber, BlacklistSubscriber, MapColorsSubscriber
{
	private static DEBOUNCE_TIME = 400
	private readonly applyDebouncedColorRange: (action: SetColorRangeAction) => void

	private DIGIT_WIDTH = 11
	private MIN_DIGITS = 4
	private MAX_DIGITS = 6
	private FULL_WIDTH_SLIDER = 235

	static COLOR_RANGE_FROM_UPDATED = "color-range-from-updated"
	static COLOR_RANGE_TO_UPDATED = "color-range-to-updated"

	private _viewModel: {
		colorRangeFrom: number
		colorRangeTo: number
		sliderOptions: RzSlider.RzOptions
	} = {
		colorRangeFrom: null,
		colorRangeTo: null,
		sliderOptions: { disabled: false }
	}

	constructor(
		private $rootScope: IRootScopeService,
		private $timeout: ITimeoutService,
		private storeService: StoreService,
		private nodeMetricDataService: NodeMetricDataService,
		private colorRangeService: ColorRangeService
	) {
		"ngInject"
		ColorMetricService.subscribe(this.$rootScope, this)
		ColorRangeService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
		MapColorsService.subscribe(this.$rootScope, this)
		this.renderSliderOnInitialisation()
		this.applyDebouncedColorRange = debounce((action: SetColorRangeAction) => {
			this.storeService.dispatch(action)
		}, RangeSliderController.DEBOUNCE_TIME)
	}

	onMapColorsChanged() {
		this.updateSliderColors()
	}

	renderSliderOnInitialisation() {
		// quick and dirty: Better solution would be to wait for the content to be loaded for the first render
		// should be taken care of when switching to Angular

		angular.element(() => {
			this.$timeout(() => {
				this.forceSliderRender()
			})
		})
	}

	forceSliderRender() {
		angular.element(() => this.$rootScope.$broadcast("rzSliderForceRender"))
	}

	onBlacklistChanged() {
		if (this.isMaxMetricValueChanged()) {
			this.updateMaxMetricValue()
			this.colorRangeService.reset()
		}
	}

	onColorMetricChanged() {
		this.updateMaxMetricValue()
	}

	onColorRangeChanged(colorRange: ColorRange) {
		this.updateViewModel(colorRange)

		this.$timeout(() => {
			this.initSliderOptions()
			this.updateSliderColors()
			this.updateInputFieldWidth()
		}, 0)
	}

	onFilesSelectionChanged() {
		this.updateMaxMetricValue()
		this.updateDisabledSliderOption()
	}

	onFromSliderChange() {
		this._viewModel.colorRangeFrom = Math.min(this._viewModel.sliderOptions.ceil - 1, this._viewModel.colorRangeFrom)
		this._viewModel.colorRangeTo = Math.max(this._viewModel.colorRangeTo, this._viewModel.colorRangeFrom + 1)
		this.applyColorRange()
	}

	onToSliderChange() {
		this._viewModel.colorRangeFrom = Math.min(this._viewModel.colorRangeTo - 1, this._viewModel.colorRangeFrom)
		this._viewModel.colorRangeTo = Math.min(this._viewModel.sliderOptions.ceil, Math.max(1, this._viewModel.colorRangeTo))
		this.applyColorRange()
	}

	private updateViewModel(colorRange: ColorRange) {
		this._viewModel.colorRangeFrom = colorRange.from
		this._viewModel.colorRangeTo = colorRange.to
	}

	private updateMaxMetricValue() {
		this._viewModel.sliderOptions.ceil = this.nodeMetricDataService.getMaxValueOfMetric(
			this.storeService.getState().dynamicSettings.colorMetric
		)
	}

	private isMaxMetricValueChanged() {
		const newMaxValue = this.nodeMetricDataService.getMaxValueOfMetric(this.storeService.getState().dynamicSettings.colorMetric)
		return this._viewModel.sliderOptions.ceil !== newMaxValue
	}

	private initSliderOptions() {
		this._viewModel.sliderOptions = {
			ceil: this.nodeMetricDataService.getMaxValueOfMetric(this.storeService.getState().dynamicSettings.colorMetric),
			onChange: () => this.applySliderChange(),
			onEnd: (_, modelValue, highValue, pointerType) => this.applySliderUpdateDone(modelValue, highValue, pointerType),
			pushRange: true,
			disabled: isDeltaState(this.storeService.getState().files)
		}
	}

	private updateDisabledSliderOption() {
		this._viewModel.sliderOptions.disabled = isDeltaState(this.storeService.getState().files)
	}

	private applySliderChange() {
		this.applyColorRange()
		this.updateSliderColors()
	}

	private applyColorRange() {
		this.applyDebouncedColorRange(
			setColorRange({
				to: this._viewModel.colorRangeTo,
				from: this._viewModel.colorRangeFrom,
				min: this._viewModel.sliderOptions.floor,
				max: this._viewModel.sliderOptions.ceil
			})
		)
	}

	private applySliderUpdateDone(modelValue, highValue, pointerType) {
		if (pointerType === "min") {
			this.broadcastColorRangeFromUpdated(this.storeService.getState().dynamicSettings.colorMetric, modelValue)
		} else if (pointerType === "max") {
			this.broadcastColorRangeToUpdated(this.storeService.getState().dynamicSettings.colorMetric, highValue)
		}
	}

	private broadcastColorRangeFromUpdated(colorMetric: string, fromValue: number) {
		this.$rootScope.$broadcast(RangeSliderController.COLOR_RANGE_FROM_UPDATED, { colorMetric, fromValue })
	}

	private broadcastColorRangeToUpdated(colorMetric: string, toValue: number) {
		this.$rootScope.$broadcast(RangeSliderController.COLOR_RANGE_TO_UPDATED, { colorMetric, toValue })
	}

	static subscribeToColorRangeFromUpdated($rootScope: IRootScopeService, subscriber: ColorRangeFromSubscriber) {
		$rootScope.$on(RangeSliderController.COLOR_RANGE_FROM_UPDATED, (_event, data) => {
			subscriber.onColorRangeFromUpdated(data.colorMetric, data.fromValue)
		})
	}

	static subscribeToColorRangeToUpdated($rootScope: IRootScopeService, subscriber: ColorRangeToSubscriber) {
		$rootScope.$on(RangeSliderController.COLOR_RANGE_TO_UPDATED, (_event, data) => {
			subscriber.onColorRangeToUpdated(data.colorMetric, data.toValue)
		})
	}

	private updateInputFieldWidth() {
		const fromLength = this._viewModel.colorRangeFrom.toFixed(0).length + 1
		const toLength = this._viewModel.colorRangeTo.toFixed(0).length + 1
		const fromWidth = Math.min(Math.max(this.MIN_DIGITS, fromLength), this.MAX_DIGITS) * this.DIGIT_WIDTH
		const toWidth = Math.min(Math.max(this.MIN_DIGITS, toLength), this.MAX_DIGITS) * this.DIGIT_WIDTH

		document.getElementById("rangeFromInputField").style.width = `${fromWidth}px`
		document.getElementById("rangeToInputField").style.width = `${toWidth}px`
		document.getElementById("colorSlider").style.width = `${this.FULL_WIDTH_SLIDER - fromWidth - toWidth}px`
	}

	private updateSliderColors() {
		const rangeFromPercentage = (100 / this._viewModel.sliderOptions.ceil) * this._viewModel.colorRangeFrom
		const rangeColors = this._viewModel.sliderOptions.disabled ? this.getGreyRangeColors() : this.getColoredRangeColors()
		this.applyCssColors(rangeColors, rangeFromPercentage)
	}

	private getGreyRangeColors() {
		const { lightGrey } = this.storeService.getState().appSettings.mapColors
		return {
			left: lightGrey,
			middle: lightGrey,
			right: lightGrey
		}
	}

	private getColoredRangeColors() {
		const mapColors = this.storeService.getState().appSettings.mapColors

		return {
			left: mapColors.positive,
			middle: mapColors.neutral,
			right: mapColors.negative
		}
	}

	private applyCssColors(rangeColors, rangeFromPercentage) {
		const slider = document.querySelector("range-slider-component .rzslider")
		const leftSection = <HTMLElement>slider.querySelector(".rz-bar-wrapper:nth-child(3) .rz-bar")
		const middleSection = <HTMLElement>slider.querySelector(".rz-selection")
		const rightSection = <HTMLElement>slider.querySelector(".rz-right-out-selection .rz-bar")

		leftSection.style.cssText = `background: ${rangeColors.left} !important; width: ${rangeFromPercentage}%;`
		middleSection.style.cssText = `background: ${rangeColors.middle} !important;`
		rightSection.style.cssText = `background: ${rangeColors.right};`
	}
}

export const rangeSliderComponent = {
	selector: "rangeSliderComponent",
	template: require("./rangeSlider.component.html"),
	controller: RangeSliderController
}
