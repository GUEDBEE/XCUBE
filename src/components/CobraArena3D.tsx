import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { 
  Shield, 
  Orbit, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Sparkles, 
  Flame, 
  RotateCw,
  Trophy,
  Activity
} from 'lucide-react';

// Pre-allocated scratch vectors for zero garbage collection in render loop
const _vec3 = new THREE.Vector3();

interface CobraArena3DProps {
  activeSport?: string;
  onSelectSport?: (sport: string) => void;
}

export const CobraArena3D: React.FC<CobraArena3DProps> = ({
  activeSport = 'all',
  onSelectSport,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [lightingPreset, setLightingPreset] = useState<'emerald' | 'gold' | 'stealth'>('emerald');
  const [currentView, setCurrentView] = useState<'orbit' | 'radar' | 'hero'>('orbit');

  const controlsRef = useRef<OrbitControls | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const sportGroupRef = useRef<THREE.Group | null>(null);
  const radarRingsRef = useRef<THREE.Mesh[]>([]);
  const speedRef = useRef(1.0);

  speedRef.current = speedMultiplier;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 450;

    // Headless CPU / performance check
    const isHeadless =
      typeof navigator !== 'undefined' &&
      (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent));

    // 1. Scene & Fog
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const bgColor = new THREE.Color(0x060b10);
    scene.background = bgColor;
    scene.fog = new THREE.FogExp2(0x060b10, 0.045);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.8, 6.2);

    // 3. Renderer with ACESFilmicToneMapping & color pipeline
    const renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.appendChild(renderer.domElement);

    // 4. Studio Environment map using RoomEnvironment & PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Controls with damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground
    controls.minDistance = 3.0;
    controls.maxDistance = 12.0;
    controls.target.set(0, 1.0, 0);
    controlsRef.current = controls;

    // 6. Lighting: Key warm/emerald light + cool hemisphere fill
    const hemiLight = new THREE.HemisphereLight(0x10b981, 0x021714, 0.8);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0x00ff87, 2.2);
    dirLight.position.set(4, 6, 4);
    dirLight.castShadow = !isHeadless;
    if (dirLight.shadow) {
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.bias = -0.0005;
      dirLight.shadow.normalBias = 0.02;
      const d = 4;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
    }
    scene.add(dirLight);
    keyLightRef.current = dirLight;

    // Blue/Purple accent rim light
    const rimLight = new THREE.PointLight(0x38bdf8, 1.8, 12);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // 7. Procedural Textures (Zero 404 dependencies)
    // Radar Grid Floor Texture
    const radarCanvas = document.createElement('canvas');
    radarCanvas.width = 512;
    radarCanvas.height = 512;
    const ctx = radarCanvas.getContext('2d')!;
    ctx.fillStyle = '#060d14';
    ctx.fillRect(0, 0, 512, 512);

    // Glowing concentric radar circles
    ctx.strokeStyle = '#053127';
    ctx.lineWidth = 2;
    for (let r = 40; r <= 240; r += 40) {
      ctx.beginPath();
      ctx.arc(256, 256, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Radial crosshairs
    ctx.beginPath();
    ctx.moveTo(256, 16);
    ctx.lineTo(256, 496);
    ctx.moveTo(16, 256);
    ctx.lineTo(496, 256);
    ctx.stroke();

    // Subtle emerald tick marks
    ctx.strokeStyle = '#00ff87';
    ctx.lineWidth = 3;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      const x1 = 256 + Math.cos(a) * 230;
      const y1 = 256 + Math.sin(a) * 230;
      const x2 = 256 + Math.cos(a) * 245;
      const y2 = 256 + Math.sin(a) * 245;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    const radarTexture = new THREE.CanvasTexture(radarCanvas);
    radarTexture.colorSpace = THREE.SRGBColorSpace;
    radarTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // 8. Composite 3-12 Part Procedural Stadium & Cobra Model (THREE.Group)
    const arenaGroup = new THREE.Group();

    // Part 1: Main circular arena floor with radar texture
    const floorGeo = new THREE.CylinderGeometry(3.6, 3.8, 0.25, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      map: radarTexture,
      roughness: 0.2,
      metalness: 0.85,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = 0.125;
    floorMesh.receiveShadow = true;
    arenaGroup.add(floorMesh);

    // Part 2: Metallic beveled outer rim
    const rimGeo = new THREE.TorusGeometry(3.7, 0.09, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.95,
      roughness: 0.15,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 0.25;
    arenaGroup.add(rimMesh);

    // Part 3: Inner levitation neon ring
    const innerRingGeo = new THREE.TorusGeometry(2.2, 0.04, 16, 64);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x00ff87,
      transparent: true,
      opacity: 0.85,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = 0.27;
    arenaGroup.add(innerRing);
    radarRingsRef.current.push(innerRing);

    // Part 4: Central pedestal base
    const pedestalGeo = new THREE.CylinderGeometry(1.1, 1.3, 0.4, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0b1720,
      metalness: 0.8,
      roughness: 0.25,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = 0.45;
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    arenaGroup.add(pedestal);

    // Part 5: Central Holographic Cobra Shield (Extruded Procedural 3D Emblem)
    const cobraGroup = new THREE.Group();
    cobraGroup.position.set(0, 1.45, 0);

    // Shield contour
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 0.9);
    shieldShape.quadraticCurveTo(0.65, 0.8, 0.75, 0.2);
    shieldShape.quadraticCurveTo(0.7, -0.4, 0, -0.9);
    shieldShape.quadraticCurveTo(-0.7, -0.4, -0.75, 0.2);
    shieldShape.quadraticCurveTo(-0.65, 0.8, 0, 0.9);

    const shieldGeo = new THREE.ExtrudeGeometry(shieldShape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.04,
    });
    shieldGeo.center();

    const shieldMat = new THREE.MeshPhysicalMaterial({
      color: 0x052e25,
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    shieldMesh.castShadow = true;
    cobraGroup.add(shieldMesh);

    // Part 6: Cobra Crest / Hood Accent (Golden Trim)
    const hoodShape = new THREE.Shape();
    hoodShape.moveTo(0, 0.7);
    hoodShape.lineTo(0.4, 0.35);
    hoodShape.lineTo(0.2, -0.15);
    hoodShape.lineTo(0, -0.45);
    hoodShape.lineTo(-0.2, -0.15);
    hoodShape.lineTo(-0.4, 0.35);
    hoodShape.closePath();

    const hoodGeo = new THREE.ExtrudeGeometry(hoodShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
    hoodGeo.center();
    const hoodMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Cobra Gold
      metalness: 0.95,
      roughness: 0.12,
    });
    const hoodMesh = new THREE.Mesh(hoodGeo, hoodMat);
    hoodMesh.position.z = 0.09;
    cobraGroup.add(hoodMesh);

    // Part 7: Cobra Emerald Eyes (Glowing Neon)
    const eyeGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ff87 });
    const eyeLeft = new THREE.Mesh(eyeGeo, eyeMat);
    eyeLeft.position.set(-0.12, 0.18, 0.15);
    const eyeRight = new THREE.Mesh(eyeGeo, eyeMat);
    eyeRight.position.set(0.12, 0.18, 0.15);
    cobraGroup.add(eyeLeft);
    cobraGroup.add(eyeRight);

    // Part 8: Floating Holographic Data Rings surrounding Cobra
    const ring1Geo = new THREE.TorusGeometry(1.15, 0.02, 12, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00ff87,
      transparent: true,
      opacity: 0.6,
    });
    const holoRing1 = new THREE.Mesh(ring1Geo, ringMat);
    holoRing1.rotation.x = Math.PI / 3;
    cobraGroup.add(holoRing1);

    const ring2Geo = new THREE.TorusGeometry(1.3, 0.015, 12, 48);
    const holoRing2 = new THREE.Mesh(ring2Geo, ringMat);
    holoRing2.rotation.y = Math.PI / 4;
    cobraGroup.add(holoRing2);

    arenaGroup.add(cobraGroup);

    // Part 9: Orbiting Multi-Sport Satellites (Football, Basket, Tennis, MMA badge)
    const sportsGroup = new THREE.Group();
    sportsGroup.position.set(0, 1.45, 0);
    sportGroupRef.current = sportsGroup;

    // Ball 1: Football Sphere with pentagonal patterns
    const soccerGeo = new THREE.SphereGeometry(0.24, 24, 24);
    const soccerMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.35,
      metalness: 0.2,
    });
    const soccerBall = new THREE.Mesh(soccerGeo, soccerMat);
    soccerBall.position.set(2.4, 0.2, 0);
    soccerBall.castShadow = true;
    sportsGroup.add(soccerBall);

    // Ball 2: Basketball (Amber / Gold rubber)
    const basketGeo = new THREE.SphereGeometry(0.26, 24, 24);
    const basketMat = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      roughness: 0.6,
      metalness: 0.1,
    });
    const basketBall = new THREE.Mesh(basketGeo, basketMat);
    basketBall.position.set(-2.4, 0.2, 0);
    basketBall.castShadow = true;
    sportsGroup.add(basketBall);

    // Ball 3: Tennis Ball (Optic Yellow)
    const tennisGeo = new THREE.SphereGeometry(0.18, 20, 20);
    const tennisMat = new THREE.MeshStandardMaterial({
      color: 0xa3e635,
      roughness: 0.85,
      metalness: 0.05,
    });
    const tennisBall = new THREE.Mesh(tennisGeo, tennisMat);
    tennisBall.position.set(0, 0.3, 2.4);
    tennisBall.castShadow = true;
    sportsGroup.add(tennisBall);

    // Ball 4: MMA Octagon Token
    const mmaGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.06, 8);
    const mmaMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.85,
      roughness: 0.25,
    });
    const mmaToken = new THREE.Mesh(mmaGeo, mmaMat);
    mmaToken.position.set(0, 0.3, -2.4);
    mmaToken.rotation.x = Math.PI / 4;
    mmaToken.castShadow = true;
    sportsGroup.add(mmaToken);

    arenaGroup.add(sportsGroup);

    // Part 10: Vertical Laser Scanner Line
    const laserGeo = new THREE.CylinderGeometry(0.015, 0.015, 2.8, 12);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x00ff87,
      transparent: true,
      opacity: 0.75,
    });
    const laserMesh = new THREE.Mesh(laserGeo, laserMat);
    laserMesh.position.set(0, 1.45, 0);
    arenaGroup.add(laserMesh);

    // Part 11: Ground Radial Contact Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(8, 8);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(128, 128, 20, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 256, 256);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.7,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.01;
    arenaGroup.add(shadowPlane);

    scene.add(arenaGroup);

    // Pre-warm shaders
    renderer.compile(scene, camera);

    // 9. Damped Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const currentSpeed = speedRef.current;

      // Rotate Cobra Shield and sports satellites
      if (cobraGroup) {
        cobraGroup.rotation.y += 0.45 * delta * currentSpeed;
        cobraGroup.position.y = 1.45 + Math.sin(time * 1.5) * 0.08; // subtle breathing hover
      }

      if (holoRing1) holoRing1.rotation.z += 0.8 * delta * currentSpeed;
      if (holoRing2) holoRing2.rotation.x -= 0.6 * delta * currentSpeed;

      if (sportsGroup) {
        sportsGroup.rotation.y -= 0.35 * delta * currentSpeed;
        soccerBall.rotation.y += 1.2 * delta;
        basketBall.rotation.x += 1.0 * delta;
        tennisBall.rotation.y += 1.4 * delta;
        mmaToken.rotation.y += 1.1 * delta;
      }

      // Scanner laser oscillation
      if (laserMesh) {
        laserMesh.position.x = Math.sin(time * 2.5) * 1.8;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 10. Responsive resize handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Camera presets
  const applyCameraPreset = (view: 'orbit' | 'radar' | 'hero') => {
    setCurrentView(view);
    const controls = controlsRef.current;
    if (!controls) return;

    if (view === 'radar') {
      controls.object.position.set(0, 7.5, 0.1);
      controls.target.set(0, 0, 0);
    } else if (view === 'hero') {
      controls.object.position.set(0, 1.8, 3.2);
      controls.target.set(0, 1.45, 0);
    } else {
      controls.object.position.set(0, 3.8, 6.2);
      controls.target.set(0, 1.0, 0);
    }
  };

  // Lighting presets
  const applyLightingPreset = (preset: 'emerald' | 'gold' | 'stealth') => {
    setLightingPreset(preset);
    const keyLight = keyLightRef.current;
    if (!keyLight) return;

    if (preset === 'emerald') {
      keyLight.color.setHex(0x00ff87);
      keyLight.intensity = 2.2;
    } else if (preset === 'gold') {
      keyLight.color.setHex(0xfacc15);
      keyLight.intensity = 2.5;
    } else {
      keyLight.color.setHex(0x38bdf8);
      keyLight.intensity = 1.6;
    }
  };

  return (
    <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[540px] bg-[#060b10] rounded-2xl overflow-hidden border border-emerald-950/60 shadow-2xl">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Spec Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#0a1219]/90 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-400 pointer-events-none select-none">
        <Activity className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-semibold tracking-wider">RADAR COBRA 3D</span>
        <span className="text-zinc-500">|</span>
        <span className="text-zinc-300">Temps Réel PBR</span>
      </div>

      {/* Top Right Live Telemetry */}
      <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-3 bg-[#0a1219]/90 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-300 pointer-events-none select-none">
        <span className="text-emerald-400 font-bold">EDGE DETECTOR : ACTIVE</span>
        <span className="text-zinc-500">|</span>
        <span className="text-amber-400">VALUE BETS : +14.2%</span>
      </div>

      {/* Viewport-First Collapsible Bottom Control Dock (Compliant with Three.js Skill) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-3xl transition-transform duration-300 ease-in-out ${
          isControlsVisible ? 'translate-y-0' : 'translate-y-[calc(100%-38px)]'
        }`}
      >
        {/* Collapse / Expand Toggle Button pinned to top of dock */}
        <div className="flex justify-center -mb-px">
          <button
            type="button"
            onClick={() => setIsControlsVisible(!isControlsVisible)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0b1622] hover:bg-[#102133] border border-b-0 border-emerald-500/40 rounded-t-lg text-xs font-medium text-emerald-300 transition-colors cursor-pointer"
            aria-label={isControlsVisible ? "Masquer les contrôles 3D" : "Afficher les contrôles 3D"}
          >
            {isControlsVisible ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
                <span>Masquer Contrôles 3D</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Afficher Contrôles 3D</span>
              </>
            )}
          </button>
        </div>

        {/* Horizontal Control Dock Container (Solid/rgba surfaces, no backdrop-blur over WebGL) */}
        <div className="bg-[#0b1622] border border-emerald-500/40 rounded-xl p-3 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Sports Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-medium hidden md:inline">Sport :</span>
            {(['all', 'football', 'basketball', 'tennis', 'mma'] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => onSelectSport && onSelectSport(s)}
                className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeSport === s
                    ? 'bg-emerald-500 text-black shadow-sm'
                    : 'bg-[#122334] text-zinc-300 hover:bg-[#1a334c]'
                }`}
              >
                {s === 'all' ? 'Tous' : s}
              </button>
            ))}
          </div>

          {/* Camera Angles */}
          <div className="flex items-center gap-1">
            <span className="text-zinc-400 font-medium hidden lg:inline">Vue :</span>
            <button
              type="button"
              onClick={() => applyCameraPreset('orbit')}
              className={`px-2 py-1 rounded cursor-pointer ${
                currentView === 'orbit' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Orbite
            </button>
            <button
              type="button"
              onClick={() => applyCameraPreset('hero')}
              className={`px-2 py-1 rounded cursor-pointer ${
                currentView === 'hero' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Cobra
            </button>
            <button
              type="button"
              onClick={() => applyCameraPreset('radar')}
              className={`px-2 py-1 rounded cursor-pointer ${
                currentView === 'radar' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Radar Haut
            </button>
          </div>

          {/* Lighting Mode */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-medium hidden sm:inline">Éclairage :</span>
            <button
              type="button"
              onClick={() => applyLightingPreset('emerald')}
              className={`w-5 h-5 rounded-full border cursor-pointer ${
                lightingPreset === 'emerald' ? 'border-white scale-110' : 'border-transparent'
              } bg-emerald-400`}
              title="Cobra Émeraude"
              aria-label="Éclairage Émeraude"
            />
            <button
              type="button"
              onClick={() => applyLightingPreset('gold')}
              className={`w-5 h-5 rounded-full border cursor-pointer ${
                lightingPreset === 'gold' ? 'border-white scale-110' : 'border-transparent'
              } bg-amber-400`}
              title="Cobra Or VIP"
              aria-label="Éclairage Or VIP"
            />
            <button
              type="button"
              onClick={() => applyLightingPreset('stealth')}
              className={`w-5 h-5 rounded-full border cursor-pointer ${
                lightingPreset === 'stealth' ? 'border-white scale-110' : 'border-transparent'
              } bg-sky-400`}
              title="Cyber Furtif"
              aria-label="Éclairage Furtif"
            />
          </div>

          {/* Speed Multiplier */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSpeedMultiplier(speedMultiplier === 1.0 ? 2.0 : speedMultiplier === 2.0 ? 0.5 : 1.0)}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#122334] hover:bg-[#1a334c] text-emerald-300 rounded font-mono font-medium transition-colors cursor-pointer"
              title="Vitesse de balayage radar"
              aria-label="Changer la vitesse"
            >
              <RotateCw className="w-3 h-3 text-emerald-400" />
              <span>{speedMultiplier}x</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
