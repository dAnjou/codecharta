import "./threeViewer.module"
import { getService, instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { ThreeOrbitControlsService } from "./threeOrbitControlsService"
import { ThreeCameraService } from "./threeCameraService"
import { ThreeSceneService } from "./threeSceneService"
import { IRootScopeService, ITimeoutService } from "angular"
import { BoxGeometry, Group, Mesh, PerspectiveCamera, Vector3 } from "three"
import { StoreService } from "../../../state/store.service"
import { FocusedNodePathService } from "../../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.service"
import { setResetCameraIfNewFileIsLoaded } from "../../../state/store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { setCameraTarget } from "../../../state/store/appSettings/cameraTarget/cameraTarget.actions"
import { FilesService } from "../../../state/store/files/files.service"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { ThreeUpdateCycleService } from "./threeUpdateCycleService"

describe("ThreeOrbitControlsService", () => {
	let threeOrbitControlsService: ThreeOrbitControlsService
	let $rootScope: IRootScopeService
	let $timeout: ITimeoutService
	let storeService: StoreService
	let threeCameraService: ThreeCameraService
	let threeSceneService: ThreeSceneService
	let threeUpdateCycleService: ThreeUpdateCycleService

	let vector: Vector3

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedThreeCameraService()
		withMockedThreeSceneService()
		withMockedControlService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap.threeViewer")

		$rootScope = getService<IRootScopeService>("$rootScope")
		$timeout = getService<ITimeoutService>("$timeout")
		storeService = getService<StoreService>("storeService")
		threeCameraService = getService<ThreeCameraService>("threeCameraService")
		threeSceneService = getService<ThreeSceneService>("threeSceneService")
		threeUpdateCycleService = getService<ThreeUpdateCycleService>("threeUpdateCycleService")

		vector = new Vector3(1.071_512_919_582_800_4, 1.071_512_919_582_800_4, 1.071_512_919_582_800_4)
	}

	function withMockedThreeCameraService() {
		const camera = new PerspectiveCamera(100, 0, 0, 0)
		camera.position.set(vector.x, vector.y, vector.z)

		threeCameraService.camera = camera
	}

	function withMockedThreeSceneService() {
		threeSceneService.scene.add = jest.fn()
		threeSceneService.scene.remove = jest.fn()
		threeSceneService.mapGeometry = new Group().add(new Mesh(new BoxGeometry(10, 10, 10)))
	}

	function withMockedControlService() {
		threeOrbitControlsService.controls = {
			target: new Vector3(1, 1, 1)
		} as OrbitControls
		threeOrbitControlsService.controls.update = jest.fn()
	}

	function rebuildService() {
		threeOrbitControlsService = new ThreeOrbitControlsService(
			$rootScope,
			$timeout,
			storeService,
			threeCameraService,
			threeSceneService,
			threeUpdateCycleService
		)
	}

	describe("constructor", () => {
		it("should subscribe to FocusedNodePathService focus", () => {
			FocusedNodePathService.subscribeToFocusNode = jest.fn()

			rebuildService()

			expect(FocusedNodePathService.subscribeToFocusNode).toHaveBeenCalledWith($rootScope, threeOrbitControlsService)
		})

		it("should subscribe to FocusedNodePathService unfocus", () => {
			FocusedNodePathService.subscribeToUnfocusNode = jest.fn()

			rebuildService()

			expect(FocusedNodePathService.subscribeToUnfocusNode).toHaveBeenCalledWith($rootScope, threeOrbitControlsService)
		})

		it("should subscribe to FilesService", () => {
			FilesService.subscribe = jest.fn()

			rebuildService()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, threeOrbitControlsService)
		})
	})

	describe("onFilesSelectionChanged", () => {
		it("should autoFit when the option to do so is enabled", () => {
			threeOrbitControlsService.autoFitTo = jest.fn()

			storeService.dispatch(setResetCameraIfNewFileIsLoaded(true))

			threeOrbitControlsService.onFilesSelectionChanged()

			expect(threeOrbitControlsService.autoFitTo).toHaveBeenCalled()
		})

		it("should autoFit when the option to do so is enabled", () => {
			threeOrbitControlsService.autoFitTo = jest.fn()

			storeService.dispatch(setResetCameraIfNewFileIsLoaded(false))

			threeOrbitControlsService.onFilesSelectionChanged()

			expect(threeOrbitControlsService.autoFitTo).not.toHaveBeenCalled()
		})
	})

	it("rotateCameraInVectorDirection ", () => {
		threeOrbitControlsService.controls = {
			target: new Vector3(0, 0, 0)
		} as OrbitControls
		const vector = { x: 0, y: 1, z: 0 }

		threeOrbitControlsService.rotateCameraInVectorDirection(vector.x, vector.y, vector.z)

		expect(threeSceneService.scene.add).toBeCalled()
		expect(threeSceneService.scene.remove).toBeCalled()

		expect(threeCameraService.camera.position).toMatchSnapshot()
	})

	describe("onFocusedNode", () => {
		it("autoFitTo have to be", () => {
			threeOrbitControlsService.onFocusNode()
			$timeout.flush()

			expect(threeOrbitControlsService.controls.update).toBeCalled()
		})
	})

	describe("setControlTarget", () => {
		it("should set the controlTarget to the store cameraTarget", () => {
			const result: Vector3 = new Vector3(1, 1, 1)
			storeService.dispatch(setCameraTarget(result))

			threeOrbitControlsService.setControlTarget()

			expect(threeOrbitControlsService.controls.target).toEqual(result)
		})
	})

	describe("onUnfocusNode", () => {
		it("should call resetCamera", () => {
			threeOrbitControlsService.autoFitTo = jest.fn()

			threeOrbitControlsService.onUnfocusNode()

			expect(threeOrbitControlsService.autoFitTo).toBeCalled()
		})
	})

	describe("autoFitTo", () => {
		it("should auto fit map to its origin value ", () => {
			threeCameraService.camera.position.set(0, 0, 0)

			threeOrbitControlsService.autoFitTo()
			$timeout.flush()

			expect(threeCameraService.camera.position).toEqual(vector)
		})

		it("should call an control update", () => {
			threeCameraService.camera.lookAt = jest.fn()

			threeOrbitControlsService.autoFitTo()
			$timeout.flush()

			expect(threeCameraService.camera.lookAt).toBeCalledWith(threeOrbitControlsService.controls.target)
		})

		it("should auto fit map to its original value ", () => {
			threeCameraService.camera.updateProjectionMatrix = jest.fn()

			threeOrbitControlsService.autoFitTo()
			$timeout.flush()

			expect(threeOrbitControlsService.controls.update).toBeCalled()
			expect(threeCameraService.camera.updateProjectionMatrix).toBeCalled()
		})

		it("should set the defaultCameraPerspective to the auto fitted vector", () => {
			threeOrbitControlsService.defaultCameraPosition.set(0, 0, 0)

			threeOrbitControlsService.autoFitTo()
			$timeout.flush()

			expect(threeOrbitControlsService.defaultCameraPosition.x).toEqual(vector.x)
			expect(threeOrbitControlsService.defaultCameraPosition.y).toEqual(vector.y)
			expect(threeOrbitControlsService.defaultCameraPosition.z).toEqual(vector.z)
		})
	})
})
