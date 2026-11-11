import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BIOME_ZONES } from '../../data/biomes';
import type { BiomeZone } from '../../data/biomes';
import { RotateCw, ZoomIn, ZoomOut, Compass, Sparkles } from 'lucide-react';

interface BiomePlanet3DProps {
  selectedZone: BiomeZone | null;
  onSelectZone: (zone: BiomeZone) => void;
}

export function BiomePlanet3D({ selectedZone, onSelectZone }: BiomePlanet3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelsContainerRef = useRef<HTMLDivElement>(null);

  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const autoRotateRef = useRef<boolean>(autoRotate);
  autoRotateRef.current = autoRotate;

  const selectedZoneIdRef = useRef<string | undefined>(selectedZone?.id);
  selectedZoneIdRef.current = selectedZone?.id;

  // Free 3D Trackball Rotation via Quaternions (Zero Gimbal Lock, Infinite 360° in all axes)
  const planetGroupRef = useRef<THREE.Group | null>(null);
  const targetQuaternionRef = useRef<THREE.Quaternion | null>(null);
  const isInterpolatingToTargetRef = useRef<boolean>(false);

  // References for Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // References for labels and beacons
  const pinWorldPositionsRef = useRef<Map<string, THREE.Vector3>>(new Map());
  const labelDomsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const beaconMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());

  // Convert lat/long to 3D Cartesian coordinates on sphere radius R
  const latLongToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.2);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Vibrant Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.15);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.8);
    sunLight.position.set(6, 8, 6);
    scene.add(sunLight);

    const secondaryLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    secondaryLight.position.set(-7, -4, -4);
    scene.add(secondaryLight);

    const bottomGlowLight = new THREE.DirectionalLight(0x818cf8, 0.85);
    bottomGlowLight.position.set(0, -8, 2);
    scene.add(bottomGlowLight);

    // 5. Starfield Dust (Glowing voxel dust around the planet)
    const starCount = 180;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const radius = 5.5 + Math.random() * 8;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * radius;
      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 6. Free 3D Rotating Planet Group
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);
    planetGroupRef.current = planetGroup;

    const PLANET_RADIUS = 2.45;

    // 6.1 Base Ocean Globe (Vibrant Low-Poly Voxel Water)
    const oceanGeo = new THREE.IcosahedronGeometry(PLANET_RADIUS, 4);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant cobalt/sky water
      roughness: 0.35,
      metalness: 0.2,
      flatShading: true,
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    planetGroup.add(oceanMesh);

    // 6.2 Glowing Atmosphere Shell
    const atmoGeo = new THREE.SphereGeometry(PLANET_RADIUS * 1.055, 36, 36);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.16,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    planetGroup.add(atmoMesh);

    // 6.3 Mini-Satellite (Minecraft Gold Moon Orbiting World)
    const moonGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      roughness: 0.4,
      metalness: 0.3,
      flatShading: true,
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.position.set(3.7, 0.6, 0);
    planetGroup.add(moonMesh);

    // 6.4 Continents & Detailed Voxel Topography
    BIOME_ZONES.forEach(zone => {
      const continentPos = latLongToVector3(zone.latitude, zone.longitude, PLANET_RADIUS * 0.98);
      const continentGroup = new THREE.Group();
      continentGroup.position.copy(continentPos);
      continentGroup.lookAt(continentPos.clone().multiplyScalar(2));

      const landColor = new THREE.Color(zone.color);
      const landMat = new THREE.MeshStandardMaterial({
        color: landColor,
        roughness: 0.75,
        metalness: 0.05,
        flatShading: true,
      });

      // Layer 1: Base Continent Foundation Plate
      const basePlate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.92, 0.2, 7),
        landMat
      );
      basePlate.rotation.x = Math.PI / 2;
      continentGroup.add(basePlate);

      // Layer 2: Stepped Voxel Hills & Mountain Formations
      const hills = [
        { x: 0.38, y: 0.25, r: 0.36, h: 0.26 },
        { x: -0.34, y: 0.32, r: 0.3, h: 0.22 },
        { x: -0.28, y: -0.36, r: 0.38, h: 0.28 },
        { x: 0.42, y: -0.22, r: 0.28, h: 0.2 },
      ];

      hills.forEach(hill => {
        const hillMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(hill.r * 0.72, hill.r, hill.h, 6),
          landMat
        );
        hillMesh.position.set(hill.x, hill.y, hill.h / 2);
        hillMesh.rotation.x = Math.PI / 2;
        continentGroup.add(hillMesh);
      });

      // Layer 3: Biome-specific Decorative 3D Features (Minecraft mini-props)
      if (zone.id === 'forests-plains') {
        const trunkGeo = new THREE.BoxGeometry(0.06, 0.06, 0.16);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
        const leafGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });

        [ { x: 0.2, y: 0.15 }, { x: -0.15, y: -0.15 }, { x: -0.1, y: 0.25 } ].forEach(tree => {
          const t = new THREE.Mesh(trunkGeo, trunkMat);
          t.position.set(tree.x, tree.y, 0.25);
          const l = new THREE.Mesh(leafGeo, leafMat);
          l.position.set(tree.x, tree.y, 0.36);
          continentGroup.add(t, l);
        });
      } else if (zone.id === 'jungle-cherry') {
        const sakuraLeafMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 });
        const leafGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        [ { x: 0.1, y: 0.2 }, { x: -0.2, y: 0.1 }, { x: 0.15, y: -0.2 } ].forEach(tree => {
          const l = new THREE.Mesh(leafGeo, sakuraLeafMat);
          l.position.set(tree.x, tree.y, 0.32);
          continentGroup.add(l);
        });
      } else if (zone.id === 'glacial-peaks') {
        const spireGeo = new THREE.ConeGeometry(0.12, 0.45, 4);
        const spireMat = new THREE.MeshStandardMaterial({
          color: 0xe0f2fe,
          emissive: 0x38bdf8,
          emissiveIntensity: 0.3,
          roughness: 0.15,
        });
        [ { x: 0.2, y: 0.1 }, { x: -0.18, y: -0.15 }, { x: 0.0, y: 0.25 } ].forEach(sp => {
          const s = new THREE.Mesh(spireGeo, spireMat);
          s.position.set(sp.x, sp.y, 0.35);
          s.rotation.x = Math.PI / 2;
          continentGroup.add(s);
        });
      } else if (zone.id === 'nether-end') {
        const magmaMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xf97316,
          emissiveIntensity: 0.9,
          roughness: 0.4,
        });
        const ventMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.1), magmaMat);
        ventMesh.position.set(0.1, 0.1, 0.24);
        continentGroup.add(ventMesh);
      }

      planetGroup.add(continentGroup);

      // 6.5 Interactive 3D Beacon Totem
      const beaconPos = latLongToVector3(zone.latitude, zone.longitude, PLANET_RADIUS + 0.22);
      const beaconGroup = new THREE.Group();
      beaconGroup.position.copy(beaconPos);
      beaconGroup.lookAt(beaconPos.clone().multiplyScalar(2));

      // Ground pulsing ring
      const ringGeo = new THREE.RingGeometry(0.14, 0.26, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: landColor,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      });
      const pulseRing = new THREE.Mesh(ringGeo, ringMat);
      beaconGroup.add(pulseRing);

      // Floating rotating crystal
      const crystalGeo = new THREE.OctahedronGeometry(0.2, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: landColor,
        emissive: landColor,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.8,
        flatShading: true,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.set(0, 0, 0.35);
      beaconGroup.add(crystal);
      beaconMeshesRef.current.set(zone.id, crystal);

      planetGroup.add(beaconGroup);

      // Save local coordinate for screen projection
      const labelAnchor = latLongToVector3(zone.latitude, zone.longitude, PLANET_RADIUS + 0.65);
      pinWorldPositionsRef.current.set(zone.id, labelAnchor);
    });

    // 6.6 Volumetric Voxel Clouds
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.0,
      transparent: true,
      opacity: 0.82,
      flatShading: true,
    });
    const cloudBoxGeo = new THREE.BoxGeometry(0.36, 0.18, 0.24);
    for (let i = 0; i < 22; i++) {
      const lat = (Math.random() - 0.5) * 140;
      const lon = (Math.random() - 0.5) * 360;
      const pos = latLongToVector3(lat, lon, PLANET_RADIUS + 0.48 + Math.random() * 0.15);
      const cloud = new THREE.Mesh(cloudBoxGeo, cloudMat);
      cloud.position.copy(pos);
      cloud.lookAt(new THREE.Vector3(0, 0, 0));
      cloud.scale.set(1 + Math.random() * 1.4, 0.75, 1 + Math.random() * 0.8);
      planetGroup.add(cloud);
    }

    // 7. Free 360° Trackball Drag Controls (Vertical, Horizontal & Diagonal Without Any Barrier)
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let velocityX = 0;
    let velocityY = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      isDragging = true;
      isInterpolatingToTargetRef.current = false;
      targetQuaternionRef.current = null;
      prevX = e.clientX;
      prevY = e.clientY;
      velocityX = 0;
      velocityY = 0;
      container.setPointerCapture(e.pointerId);
      container.style.cursor = 'grabbing';
      e.preventDefault();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || !planetGroupRef.current) return;
      const deltaX = e.clientX - prevX;
      const deltaY = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      velocityX = deltaX;
      velocityY = deltaY;

      // Trackball arcball rotation: screen movement generates a 3D rotation axis
      const dist = Math.hypot(deltaX, deltaY);
      if (dist > 0.001) {
        // DeltaY moves around X axis; DeltaX moves around Y axis
        const axis = new THREE.Vector3(deltaY, deltaX, 0).normalize();
        const angle = dist * 0.0065;
        const deltaQuat = new THREE.Quaternion().setFromAxisAngle(axis, angle);
        planetGroupRef.current.quaternion.premultiply(deltaQuat);
      }
      e.preventDefault();
    };

    const onPointerUp = (e: PointerEvent) => {
      if (isDragging) {
        isDragging = false;
        try {
          container.releasePointerCapture(e.pointerId);
        } catch {}
        container.style.cursor = 'grab';
      }
    };

    // Mouse Wheel Zoom
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const newZ = cameraRef.current.position.z + e.deltaY * 0.004;
      cameraRef.current.position.z = Math.max(5.0, Math.min(11.0, newZ));
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // 8. Resize Observer
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // 9. Main Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();
    const tempVec = new THREE.Vector3();
    const normalVec = new THREE.Vector3();
    const toCameraVec = new THREE.Vector3();
    const autoRotateAxis = new THREE.Vector3(0, 1, 0);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation towards target region via Quaternion Slerp
      if (isInterpolatingToTargetRef.current && targetQuaternionRef.current && planetGroupRef.current) {
        planetGroupRef.current.quaternion.slerp(targetQuaternionRef.current, 0.08);

        if (planetGroupRef.current.quaternion.angleTo(targetQuaternionRef.current) < 0.006) {
          planetGroupRef.current.quaternion.copy(targetQuaternionRef.current);
          isInterpolatingToTargetRef.current = false;
          targetQuaternionRef.current = null;
        }
      } else if (!isDragging && planetGroupRef.current) {
        // Continuous inertia momentum in whatever direction user dragged
        const dist = Math.hypot(velocityX, velocityY);
        if (dist > 0.08) {
          const axis = new THREE.Vector3(velocityY, velocityX, 0).normalize();
          const angle = dist * 0.0055;
          const deltaQuat = new THREE.Quaternion().setFromAxisAngle(axis, angle);
          planetGroupRef.current.quaternion.premultiply(deltaQuat);

          velocityX *= 0.94;
          velocityY *= 0.94;
        } else if (autoRotateRef.current) {
          // Continuous gentle auto-spin
          const deltaQuat = new THREE.Quaternion().setFromAxisAngle(autoRotateAxis, 0.0028);
          planetGroupRef.current.quaternion.premultiply(deltaQuat);
        }
      }

      // Animate Beacon Crystals (bobbing and spinning)
      beaconMeshesRef.current.forEach(mesh => {
        mesh.rotation.y += 0.03;
        mesh.position.z = 0.35 + Math.sin(elapsedTime * 3.5 + mesh.id) * 0.04;
      });

      // 10. Update 3D Floating Labels Projection in Real-time (Always visible on front side)
      if (cameraRef.current && planetGroupRef.current && container) {
        const cWidth = container.clientWidth;
        const cHeight = container.clientHeight;

        BIOME_ZONES.forEach(zone => {
          const dom = labelDomsRef.current.get(zone.id);
          const localPos = pinWorldPositionsRef.current.get(zone.id);
          if (!dom || !localPos) return;

          // 1. Transform label position into world space using planet quaternion
          tempVec.copy(localPos).applyMatrix4(planetGroupRef.current!.matrixWorld);

          // 2. Determine if face is on the visible front hemisphere (towards the camera)
          normalVec.copy(tempVec).normalize();
          toCameraVec.copy(camera.position).sub(tempVec).normalize();
          const isFrontFacing = normalVec.dot(toCameraVec) > 0.05;

          if (isFrontFacing) {
            // Project 3D coordinates into 2D viewport coordinates
            tempVec.project(camera);
            const x = (tempVec.x * 0.5 + 0.5) * cWidth;
            const y = (-(tempVec.y * 0.5) + 0.5) * cHeight;

            const isSelected = selectedZoneIdRef.current === zone.id;
            dom.style.display = 'flex';
            dom.style.opacity = '1';
            dom.style.pointerEvents = 'auto';
            dom.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${isSelected ? 1.15 : 1.0})`;
          } else {
            dom.style.display = 'none';
            dom.style.pointerEvents = 'none';
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const activeBeaconMeshes = beaconMeshesRef.current;
    const activePinWorldPositions = pinWorldPositionsRef.current;

    // 11. Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
      container.removeEventListener('wheel', onWheel);

      renderer.dispose();
      oceanGeo.dispose();
      oceanMat.dispose();
      atmoGeo.dispose();
      atmoMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      moonGeo.dispose();
      moonMat.dispose();
      cloudBoxGeo.dispose();
      cloudMat.dispose();
      scene.clear();
      activeBeaconMeshes.clear();
      activePinWorldPositions.clear();
    };
  }, []);

  // When selectedZone changes (e.g. from clicking button or badge), smoothly rotate the globe to face it via Quaternion
  useEffect(() => {
    if (!selectedZone || !planetGroupRef.current) return;

    // Local direction vector of the biome
    const localDir = latLongToVector3(selectedZone.latitude, selectedZone.longitude, 1).normalize();
    // Desired world direction facing directly to camera: (0, 0, 1)
    const targetWorldDir = new THREE.Vector3(0, 0, 1);

    // Compute rotation that maps localDir to targetWorldDir
    const q = new THREE.Quaternion().setFromUnitVectors(localDir, targetWorldDir);

    targetQuaternionRef.current = q;
    isInterpolatingToTargetRef.current = true;
  }, [selectedZone]);

  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const currentZ = cameraRef.current.position.z;
    const step = direction === 'in' ? -0.8 : 0.8;
    cameraRef.current.position.z = Math.max(5.0, Math.min(11.0, currentZ + step));
  };

  const handleResetView = () => {
    if (planetGroupRef.current) {
      targetQuaternionRef.current = new THREE.Quaternion();
      isInterpolatingToTargetRef.current = true;
    }
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 8.2);
    }
  };

  return (
    <div className="relative w-full h-[540px] sm:h-[620px] lg:h-[680px] bg-gradient-to-b from-cobble-950 via-[#070b14] to-cobble-950 rounded-3xl border border-yellow-500/30 overflow-hidden shadow-2xl flex items-center justify-center select-none">
      
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none" />

      {/* Floating 3D Region Badges Always Visible on the Globe */}
      <div ref={labelsContainerRef} className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {BIOME_ZONES.map(zone => {
          const isSelected = selectedZone?.id === zone.id;
          return (
            <button
              key={zone.id}
              ref={el => {
                if (el) labelDomsRef.current.set(zone.id, el);
                else labelDomsRef.current.delete(zone.id);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onSelectZone(zone);
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                display: 'none',
                willChange: 'transform, opacity',
                transition: 'opacity 0.2s ease, transform 0.08s ease-out',
                borderColor: `${zone.color}90`,
                boxShadow: isSelected ? `0 0 25px ${zone.color}` : `0 4px 14px rgba(0,0,0,0.8)`,
              }}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black backdrop-blur-md border transition-all cursor-pointer pointer-events-auto shadow-xl ${
                isSelected
                  ? 'bg-yellow-400 text-yellow-950 scale-110 z-20 ring-2 ring-yellow-300'
                  : 'bg-cobble-900/95 text-white hover:bg-cobble-850 hover:scale-105 z-10'
              }`}
            >
              <span className="text-base group-hover:scale-125 transition-transform">{zone.icon}</span>
              <span className="tracking-wide text-xs font-black drop-shadow-md whitespace-nowrap">
                {zone.shortName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Top Left Instructions */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cobble-900/90 border border-yellow-500/40 text-yellow-400 text-xs font-bold backdrop-blur-md shadow-xl">
          <Compass className="w-4 h-4 animate-spin-slow text-yellow-400" />
          <span>Planeta Cobblemon 3D</span>
        </div>
        <p className="text-[11px] text-cobble-300 bg-cobble-950/80 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-cobble-800 max-w-xs leading-snug">
          Gire o planeta livremente em 360° (vertical ou horizontal) • Clique no nome de qualquer região para ver os Pokémon
        </p>
      </div>

      {/* Top Right Controls Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-cobble-900/90 border border-cobble-700 p-1.5 rounded-xl backdrop-blur-md shadow-2xl">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          title={autoRotate ? 'Pausar giro automático' : 'Ativar giro automático'}
          className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            autoRotate
              ? 'bg-yellow-400 text-yellow-950 shadow-md shadow-yellow-400/20'
              : 'text-cobble-300 hover:text-white hover:bg-cobble-800'
          }`}
        >
          <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '7s' }} />
          <span className="hidden sm:inline">Giro Auto</span>
        </button>

        <button
          onClick={() => handleZoom('in')}
          title="Aproximar Câmera"
          className="p-2 rounded-lg text-cobble-300 hover:text-white hover:bg-cobble-800 transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleZoom('out')}
          title="Afastar Câmera"
          className="p-2 rounded-lg text-cobble-300 hover:text-white hover:bg-cobble-800 transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={handleResetView}
          title="Resetar Vista Frontal"
          className="p-2 rounded-lg text-cobble-300 hover:text-white hover:bg-cobble-800 transition-colors text-xs font-bold px-2.5 cursor-pointer"
        >
          Resetar
        </button>
      </div>

      {/* Active Selected Zone Banner at the bottom */}
      {selectedZone && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-3 bg-cobble-900/95 border border-yellow-500/50 px-4 py-2 rounded-2xl backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="text-2xl">{selectedZone.icon}</span>
          <div>
            <div className="text-xs font-black text-white flex items-center gap-2">
              <span>{selectedZone.name}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                Região Ativa
              </span>
            </div>
            <p className="text-[11px] text-cobble-300 line-clamp-1">{selectedZone.subtitle}</p>
          </div>
          <button
            onClick={() => onSelectZone(selectedZone)}
            className="ml-2 px-3 py-1 bg-yellow-400 hover:bg-yellow-300 text-yellow-950 text-xs font-black rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ver População</span>
          </button>
        </div>
      )}
    </div>
  );
}
