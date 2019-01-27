import {metricChooserComponent, MetricChooserController} from "./metricChooser.component";
import {DataService} from "../../core/data/data.service";
import {SettingsService} from "../../core/settings/settings.service";

import {CodeMapMouseEventService} from "../codeMap/codeMap.mouseEvent.service";
jest.mock("../codeMap/codeMap.mouseEvent.service");


describe("MetricChooserController", () => {

    let dataServiceMock: DataService;
    let settingsServiceMock: SettingsService;
    let metricChooserController: MetricChooserController;
    let $rootScope = {};

    function rebuildSUT() {
        metricChooserController = new MetricChooserController(dataServiceMock, settingsServiceMock, $rootScope);
    }

    function mockEverything() {

        CodeMapMouseEventService.mockClear();

        const DataServiceMock = jest.fn<DataService>(() => ({
            setComparisonMap: jest.fn(),
            setReferenceMap: jest.fn(),
            subscribe: jest.fn(),
            getComparisonMap: jest.fn(),
            getReferenceMap: jest.fn(),
            $rootScope: {
                $on: jest.fn()
            },
            data: {
                revisions: [],
                metrics: [],
                metricData: [],
            },
            notify: ()=>{
                metricChooserController.onDataChanged(dataServiceMock.data);
            }
        }));

        dataServiceMock = new DataServiceMock();

        const SettingsServiceMock = jest.fn<SettingsService>(() => ({
            applySettings: jest.fn(),
            settings: {
                areaMetric: "area",
                heightMetric: "height",
                colorMetric: "color",
            }
        }));

        settingsServiceMock = new SettingsServiceMock();

        rebuildSUT();

    }

    beforeEach(()=>{
        mockEverything();
    });

    it("should subscribe to dataService on construction", () => {
        expect(dataServiceMock.subscribe).toHaveBeenCalledWith(metricChooserController);
    });

    it("should subscribe to CodeMapMouseEventService on construction", () => {
        expect(CodeMapMouseEventService.subscribe).toHaveBeenCalledWith($rootScope, metricChooserController);
    });

    it("should get metrics from data service on startup", () => {
        dataServiceMock.data.metricData = [{name: "Some Metric", maxValue: 1}];
        rebuildSUT();
        expect(metricChooserController.metricData).toBe(dataServiceMock.data.metricData);
    });

    it("onDataChanged should refresh metrics and sort them", () => {
        const metricData = [
            {name: "some", maxValue: 2},
            {name: "revisions", maxValue: 3},
            {name: "a", maxValue: 4}
        ];
        metricChooserController.onDataChanged({metricData: metricData});
        expect(metricChooserController.metricData).toEqual(metricData);
        expect(metricChooserController.metricData[0]).toEqual(metricData[0]);
        expect(metricChooserController.metricData[1]).toEqual(metricData[1]);
    });

    it("onDataChanged should be called when dataService.notify is called", () => {
        metricChooserController.onDataChanged = jest.fn();
        dataServiceMock.notify();
        expect(metricChooserController.onDataChanged).toHaveBeenCalled();
    });

    it("notify should be call applySettings", () => {
        metricChooserController.notify();
        expect(settingsServiceMock.applySettings).toHaveBeenCalled();
    });

    it("onBuildingHovered should reset values if data, data.to, data.to.node or data.to.node.attributes are non existant", () => {
        metricChooserController.hoveredAreaValue = 30;
        metricChooserController.onBuildingHovered(null, null);
        expect(metricChooserController.hoveredAreaValue).not.toBeTruthy();
        metricChooserController.hoveredAreaValue = 30;
        metricChooserController.onBuildingHovered({to: null}, null);
        expect(metricChooserController.hoveredAreaValue).not.toBeTruthy();
        metricChooserController.hoveredAreaValue = 30;
        metricChooserController.onBuildingHovered({to: {node: null}}, null);
        expect(metricChooserController.hoveredAreaValue).not.toBeTruthy();
        metricChooserController.hoveredAreaValue = 30;
        metricChooserController.onBuildingHovered({to:{node:{attributes: null}}}, null);
        expect(metricChooserController.hoveredAreaValue).not.toBeTruthy();
    });

    it("onBuildingHovered should not get values if data.to.node.attributes is existant but empty", () => {
        metricChooserController.hoveredAreaValue = 30;
        metricChooserController.onBuildingHovered({to:{node:{attributes: {}}}}, null);
        expect(metricChooserController.hoveredAreaValue).not.toBeTruthy();
    });

    it("onBuildingHovered should get values if data.to.node.attributes is existant and filled with correct values", () => {
        metricChooserController.hoveredAreaValue = 30;
        metricChooserController.onBuildingHovered({to:{node:{attributes: {area: 10}}}}, null);
        expect(metricChooserController.hoveredAreaValue).toBe(10);
    });

    it("onBuildingHovered should not get values if data.to.node.attributes is existant and filled with incorrect values", () => {
        metricChooserController.hoveredAreaValue = 30;
        metricChooserController.onBuildingHovered({to:{node:{attributes: {somearea: 10}}}}, null);
        expect(metricChooserController.hoveredAreaValue).not.toBeTruthy();
    });

});