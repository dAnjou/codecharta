import { _getLegendEdgeMetric } from "./legendEdgeMetric.selector"
import { TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED } from "../../../util/dataMocks"

describe("_getLegendEdgeMetric", () => {
	it("should return nothing if there are no edgeMetricData", () => {
		expect(_getLegendEdgeMetric("rloc", [], undefined)).toBe(undefined)
	})

	it("should return nothing if edgeMetricData maxValue' is smaller than 0", () => {
		expect(
			_getLegendEdgeMetric(
				"rloc",
				[
					{
						name: "rloc",
						maxValue: undefined,
						minValue: undefined
					}
				],
				undefined
			)
		).toBe(undefined)
	})

	it("should get existing legendEdgeMetric", () => {
		expect(_getLegendEdgeMetric("rloc", [{ name: "rloc", maxValue: 10, minValue: 0 }], undefined)).toEqual({
			key: "rloc",
			title: "Real Lines of Code",
			description: undefined
		})
	})

	it("should get existing legendEdgeMetric with given attribute descriptors", () => {
		expect(
			_getLegendEdgeMetric(
				"mcc",
				[
					{
						name: "mcc",
						maxValue: 10,
						minValue: 0
					}
				],
				TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED
			)
		).toEqual({
			description: "Maximum cyclic complexity",
			hintHighValue: "",
			hintLowValue: "",
			key: "mcc",
			link: "https://www.npmjs.com/package/metric-gardener",
			title: "Maximum Cyclic Complexity"
		})

		expect(
			_getLegendEdgeMetric(
				"rloc",
				[
					{
						name: "rloc",
						maxValue: 10,
						minValue: 0
					}
				],
				TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED
			)
		).toEqual({
			description: "",
			hintHighValue: "",
			hintLowValue: "",
			key: "rloc",
			link: "https://www.npmjs.com/package/metric-gardener",
			title: "Real Lines of Code"
		})
	})
})
