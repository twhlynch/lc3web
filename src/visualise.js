import {
	AmbientLight,
	BoxGeometry,
	Color,
	DirectionalLight,
	Group,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { block_color } from './blocks';

export function visualise(blocks, container) {
	if (blocks.size === 0) {
		container.textContent = 'No modified blocks to visualise.';
		return;
	}

	const voxels = [...blocks.entries()].map(([key, id]) => {
		const [x, y, z] = key.split(',').map(Number);
		return { x, y, z, id };
	});

	const bounds = computeBounds(voxels);
	const radius = computeRadius(bounds);
	const center = {
		x: (bounds.minX + bounds.maxX) / 2,
		y: (bounds.minY + bounds.maxY) / 2,
		z: (bounds.minZ + bounds.maxZ) / 2,
	};

	const three = bootstrapThree(container, center, radius);

	const group = createVoxels(voxels, center);
	group.position.set(center.x, center.y, center.z);
	three.scene.add(group);

	return three.cleanup;
}

function createVoxels(voxels, center) {
	const group = new Group();

	const box_geometry = new BoxGeometry(1, 1, 1);

	for (const voxel of voxels) {
		const color = block_color(voxel.id);

		const mesh = new Mesh(
			box_geometry,
			new MeshStandardMaterial({
				color,
				emissive: color,
			}),
		);

		mesh.position.set(
			voxel.x - center.x,
			voxel.y - center.y,
			voxel.z - center.z,
		);

		group.add(mesh);
	}

	return group;
}

function bootstrapThree(container, center, radius) {
	const scene = new Scene();
	scene.background = new Color(0x202020);

	// renderer
	const renderer = new WebGLRenderer({ antialias: true });

	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.setSize(container.clientWidth, container.clientHeight);

	container.appendChild(renderer.domElement);

	// lights
	scene.add(new AmbientLight(0xffffff, 0.6));

	const key = new DirectionalLight(0xffffff, 1.2);
	key.position.set(1, 3, 2);

	const fill = new DirectionalLight(0xffffff, 0.4);
	fill.position.set(-1, -0.5, -1);

	scene.add(key, fill);

	// camera
	const camera = new PerspectiveCamera(
		50,
		container.clientWidth / container.clientHeight,
		0.1,
		10000,
	);

	const controls = new OrbitControls(camera, renderer.domElement);

	function updateCamera() {
		positionCamera(camera, center, radius);

		controls.target.set(center.x, center.y, center.z);
		controls.update();
	}

	updateCamera();

	// resize
	function resize() {
		const width = container.clientWidth;
		const height = container.clientHeight;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		renderer.setSize(width, height);

		updateCamera();
	}

	const resizeObserver = new ResizeObserver(resize);
	resizeObserver.observe(container);

	// update
	let loop = 0;

	function animate() {
		loop = requestAnimationFrame(animate);

		controls.update();
		renderer.render(scene, camera);
	}

	animate();

	// cleanup
	function cleanup() {
		cancelAnimationFrame(loop);

		resizeObserver.disconnect();

		controls.dispose();
		renderer.dispose();

		renderer.domElement.remove();
	}

	return {
		scene,
		camera,
		renderer,
		controls,
		cleanup,
	};
}

function computeBounds(voxels) {
	let minX = Infinity,
		minY = Infinity,
		minZ = Infinity,
		maxX = -Infinity,
		maxY = -Infinity,
		maxZ = -Infinity;

	for (const { x, y, z } of voxels) {
		if (x < minX) minX = x;
		if (y < minY) minY = y;
		if (z < minZ) minZ = z;

		if (x > maxX) maxX = x;
		if (y > maxY) maxY = y;
		if (z > maxZ) maxZ = z;
	}

	return { minX, minY, minZ, maxX, maxY, maxZ };
}

function computeRadius(bounds) {
	const sx = bounds.maxX - bounds.minX + 1;
	const sy = bounds.maxY - bounds.minY + 1;
	const sz = bounds.maxZ - bounds.minZ + 1;

	return Math.sqrt((sx / 2) ** 2 + (sy / 2) ** 2 + (sz / 2) ** 2);
}

function positionCamera(camera, center, radius) {
	// field of view in radians
	const vFov = (camera.fov * Math.PI) / 180;
	const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
	const fov = Math.min(vFov, hFov);

	// fit the whole bounding sphere in view
	const distance = radius / (0.9 * Math.tan(fov / 2)) / 2;
	const d = Math.max(distance, 10);

	camera.position.set(center.x + d, center.y + d, center.z + d);
	camera.lookAt(center.x, center.y, center.z);
}
