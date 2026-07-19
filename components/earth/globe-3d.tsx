"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useQuery } from "@tanstack/react-query";
import { magnitudeColor } from "@/lib/dataviz";

/* ---------------------------------------------------------------------------
   A real 3D Earth for the hero: a dotted point-cloud globe that reads land
   from ocean, with the live ISS position and recent significant earthquakes
   fixed to their true coordinates. It spins slowly on its own; markers reveal
   a label on hover. Colours are pulled from the theme tokens and refresh when
   the light/dark theme changes. Data comes from the existing /api/iss and
   /api/earthquakes routes — no new sources.
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

// Coarse continent centres [lat, lon, angularRadius°] — a Fibonacci point
// within one of these is treated as land (brighter). Stylised, not a real map.
const LAND: Array<[number, number, number]> = [
  [54, -108, 26], [39, -98, 15], [-12, -58, 24], [52, 12, 17],
  [8, 20, 30], [-4, 24, 22], [58, 90, 34], [28, 78, 18],
  [40, 116, 16], [-25, 133, 15],
];

function isLand(latRad: number, lonRad: number): boolean {
  const D2R = Math.PI / 180;
  for (const [clat, clon, cr] of LAND) {
    const dlat = latRad - clat * D2R;
    let dlon = lonRad - clon * D2R;
    if (dlon > Math.PI) dlon -= 2 * Math.PI;
    if (dlon < -Math.PI) dlon += 2 * Math.PI;
    const d = Math.sqrt(
      dlat * dlat + dlon * dlon * Math.cos(latRad) * Math.cos(latRad)
    );
    if (d < cr * D2R) return true;
  }
  return false;
}

/** Two Fibonacci-lattice point clouds on the unit sphere: land and ocean. */
function useEarthPoints() {
  return useMemo(() => {
    const count = 4200;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const land: number[] = [];
    const ocean: number[] = [];
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const theta = i * golden;
      const x = Math.cos(theta) * rad;
      const z = Math.sin(theta) * rad;
      const latRad = Math.asin(y);
      const lonRad = Math.atan2(z, x);
      (isLand(latRad, lonRad) ? land : ocean).push(x, y, z);
    }
    return {
      land: new Float32Array(land),
      ocean: new Float32Array(ocean),
    };
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
  const colors = useThemeColors();
  const { land, ocean } = useEarthPoints();

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
    if (group.current && !reduce) group.current.rotation.y += delta * 0.075;
  });

  const issLat = iss ? parseFloat(iss.iss_position.latitude) : null;
  const issLon = iss ? parseFloat(iss.iss_position.longitude) : null;

  return (
    <group ref={group} rotation={[0.35, 0, 0.1]}>
      {/* opaque core hides the far-side points for a solid-planet read */}
      <mesh>
        <sphereGeometry args={[R - 0.015, 48, 48]} />
        <meshBasicMaterial color={colors.core} />
      </mesh>

      {/* ocean dots */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[ocean, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={colors.ocean}
          size={0.011}
          sizeAttenuation
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </points>

      {/* land dots */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[land, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={colors.accent}
          size={0.018}
          sizeAttenuation
          transparent
          opacity={0.95}
          depthWrite={false}
        />
      </points>

      {/* atmosphere halo */}
      <mesh>
        <sphereGeometry args={[R + 0.06, 48, 48]} />
        <meshBasicMaterial
          color={colors.accent}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>

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
      camera={{ position: [0, 0, 2.7], fov: 42 }}
      dpr={[1, 2]}
      frameloop={reduce ? "demand" : "always"}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
      aria-label="Interactive 3D globe showing the live ISS position and recent earthquakes"
    >
      <ambientLight intensity={0.9} />
      <Globe reduce={reduce} />
    </Canvas>
  );
}
