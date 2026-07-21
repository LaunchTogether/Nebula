"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useQuery } from "@tanstack/react-query";
import { magnitudeColor } from "@/lib/dataviz";

/* ---------------------------------------------------------------------------
   A realistic 3D Earth: textured mesh with a cloud layer, day/night lighting,
   and thousands of orbiting satellite particles. Includes the live ISS position
   and recent significant earthquakes fixed to their true coordinates.
--------------------------------------------------------------------------- */

const R = 1;

/** Geographic lat/lon (degrees) → a point on a sphere of radius r. */
function latLonToVec3(lat: number, lon: number, r = R): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

/** Generates thousands of random points for the satellite swarm */
function useSatellitePoints() {
  return useMemo(() => {
    const count = 3500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    // Mix of colors: cyan, white, red, blue
    const colorOptions = [
      new THREE.Color("#37e0e8"), // cyan
      new THREE.Color("#ffffff"), // white
      new THREE.Color("#ff5230"), // red
      new THREE.Color("#5e8bff"), // blue
    ];

    for (let i = 0; i < count; i++) {
      // Random position on sphere slightly larger than Earth
      // R=1, Satellites orbit between R+0.05 and R+0.25
      const r = R + 0.05 + Math.random() * 0.20; 
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Heavy bias towards cyan/blue/white, rarely red
      const rand = Math.random();
      let c;
      if (rand < 0.4) c = colorOptions[0]; // cyan
      else if (rand < 0.8) c = colorOptions[1]; // white
      else if (rand < 0.95) c = colorOptions[3]; // blue
      else c = colorOptions[2]; // red

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    
    return { positions, colors };
  }, []);
}

type Colors = {
  accent: string;
  cyan: string;
  ocean: string;
  core: string;
};

function readColors(): Colors {
  const g = (n: string, f: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(n).trim() || f;
  return {
    accent: g("--accent", "#5e8bff"),
    cyan: g("--accent-cyan", "#37e0e8"),
    ocean: g("--text-faint", "#5c6786"),
    core: g("--bg-elev", "#090d18"),
  };
}

/** Theme token colours, refreshed whenever the data-theme attribute flips. */
function useThemeColors(): Colors {
  const [colors, setColors] = useState<Colors>(readColors);
  useEffect(() => {
    const update = () => setColors(readColors());
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  return colors;
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(reducedMotionQuery);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(reducedMotionQuery).matches;
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );
}

/* ---------------------------- marker components --------------------------- */

interface Quake {
  id: string;
  properties: { mag: number; place: string };
  geometry: { coordinates: [number, number, number] };
}

function QuakeMarker({ quake }: { quake: Quake }) {
  const [hovered, setHovered] = useState(false);
  const [lon, lat] = quake.geometry.coordinates;
  const mag = quake.properties.mag;
  const pos = useMemo(() => latLonToVec3(lat, lon, R + 0.005), [lat, lon]);
  const size = 0.012 + (mag - 4) * 0.006;
  const color = magnitudeColor(mag);

  return (
    <group position={pos}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.6 : 1}
      >
        <sphereGeometry args={[size, 12, 12]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {hovered && (
        <Html center distanceFactor={5} zIndexRange={[60, 0]}>
          <div className="globe-tip">
            <span className="globe-tip-mag" style={{ color }}>
              M{mag.toFixed(1)}
            </span>
            <span className="globe-tip-place">{quake.properties.place}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

function ISSMarker({
  lat,
  lon,
  color,
  reduce,
}: {
  lat: number;
  lon: number;
  color: string;
  reduce: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => latLonToVec3(lat, lon, R + 0.055), [lat, lon]);

  useFrame(({ clock }) => {
    if (ref.current && !reduce) {
      const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.25;
      ref.current.scale.setScalar(s);
    }
  });

  return (
    <group position={pos}>
      {/* tether line down to the surface */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                0, 0, 0,
                ...latLonToVec3(lat, lon, R).sub(pos).toArray(),
              ]),
              3,
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.4} />
      </line>
      <mesh ref={ref}>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <Html center distanceFactor={6} zIndexRange={[70, 0]}>
        <div className="globe-iss">ISS</div>
      </Html>
    </group>
  );
}

/* ------------------------------- the globe -------------------------------- */

function Globe({ reduce }: { reduce: boolean }) {
  const group = useRef<THREE.Group>(null);
  const satellitesRef = useRef<THREE.Points>(null);
  const colors = useThemeColors();
  
  // High-res public textures for realistic Earth
  const [colorMap, bumpMap, specularMap] = useTexture([
    "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
    "https://unpkg.com/three-globe/example/img/earth-topology.png",
    "https://unpkg.com/three-globe/example/img/earth-water.png",
  ]);

  const { positions: satPositions, colors: satColors } = useSatellitePoints();

  const { data: iss } = useQuery<{
    iss_position: { latitude: string; longitude: string };
  }>({
    queryKey: ["iss"],
    queryFn: () => fetch("/api/iss").then((r) => r.json()),
    refetchInterval: 5000,
  });

  const { data: quakeData } = useQuery<{ features: Quake[] }>({
    queryKey: ["earthquakes"],
    queryFn: () => fetch("/api/earthquakes").then((r) => r.json()),
    staleTime: 1000 * 60 * 10,
  });

  const quakes = useMemo(
    () =>
      (quakeData?.features ?? [])
        .filter((q) => Number.isFinite(q.geometry?.coordinates?.[1]))
        .slice(0, 40),
    [quakeData]
  );

  useFrame((_, delta) => {
    if (group.current && !reduce) {
      group.current.rotation.y += delta * 0.05;
    }
    // Rotate satellites slightly faster on a different axis to simulate orbit
    if (satellitesRef.current && !reduce) {
      satellitesRef.current.rotation.y -= delta * 0.02;
      satellitesRef.current.rotation.z += delta * 0.01;
    }
  });

  const issLat = iss ? parseFloat(iss.iss_position.latitude) : null;
  const issLon = iss ? parseFloat(iss.iss_position.longitude) : null;

  return (
    <group ref={group} rotation={[0.35, 0, 0.1]}>
      
      {/* Lighting for day/night effect */}
      <ambientLight intensity={0.05} />
      {/* Strong directional light acting as the Sun */}
      <directionalLight position={[5, 3, 5]} intensity={2.5} />
      {/* Soft backlight so the dark side isn't pitch black */}
      <directionalLight position={[-5, -3, -5]} intensity={0.2} color={colors.accent} />

      {/* Realistic Earth Mesh */}
      <mesh>
        <sphereGeometry args={[R, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          bumpMap={bumpMap}
          bumpScale={0.015}
          roughnessMap={specularMap}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Cloud layer (simulated without texture) */}
      <mesh scale={[1.006, 1.006, 1.006]}>
        <sphereGeometry args={[R, 64, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere Halo */}
      <mesh>
        <sphereGeometry args={[R + 0.04, 48, 48]} />
        <meshBasicMaterial
          color={colors.accent}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Satellite Particle Swarm */}
      <points ref={satellitesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[satPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[satColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.012}
          vertexColors={true}
          transparent={true}
          opacity={0.8}
          sizeAttenuation={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {quakes.map((q) => (
        <QuakeMarker key={q.id} quake={q} />
      ))}

      {issLat !== null && issLon !== null && (
        <ISSMarker lat={issLat} lon={issLon} color={colors.cyan} reduce={reduce} />
      )}
    </group>
  );
}

export default function Globe3D() {
  const reduce = usePrefersReducedMotion();
  return (
    <Canvas
      camera={{ position: [0, 0, 2.8], fov: 45 }}
      dpr={[1, 2]}
      frameloop={reduce ? "demand" : "always"}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
      aria-label="Interactive 3D realistic globe showing satellites, the live ISS position and recent earthquakes"
    >
      <Globe reduce={reduce} />
    </Canvas>
  );
}
