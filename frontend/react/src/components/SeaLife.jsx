import { useEffect, useId, useState } from "react";

const fishPalettes = [
  ["#ffbd45", "#f47735", "#ffe7a0"],
  ["#28c9c2", "#1681a8", "#c8fff4"],
  ["#ff7185", "#cb3f75", "#ffd2b0"],
  ["#8bcf68", "#388b68", "#e0f3ae"],
  ["#a58aff", "#6050b5", "#e1d5ff"],
  ["#56b8ff", "#3867bd", "#d6f4ff"],
  ["#f5a64a", "#d95346", "#ffe0a0"],
  ["#ee78d0", "#873fa4", "#ffd6f7"],
  ["#e5df62", "#799c38", "#fff5a6"],
  ["#ff7954", "#a93656", "#ffd6aa"],
  ["#71e0a0", "#208b85", "#d8ffe0"],
  ["#93a9ff", "#5453a8", "#e0e2ff"],
  ["#f0a0e9", "#6650bf", "#fff0ff"],
  ["#42d4ed", "#2173a8", "#c9fbff"],
  ["#ffc56b", "#c15d31", "#fff1c4"],
];

const randomBetween = (min, max) => min + Math.random() * (max - min);

function createSwim(kind, laneIndex, laneCount) {
  const margin = 12;
  if (kind === "jellyfish") {
    const x = randomBetween(
      margin,
      Math.max(margin, window.innerWidth - 86 - margin),
    );
    return {
      x,
      y: window.innerHeight + margin,
      endX: x,
      endY: -118,
      width: 72,
      height: 94,
      duration: randomBetween(18000, 28000),
      forward: 1,
    };
  }

  const forward = Math.random() < 0.5 ? 1 : -1;
  const isFish = kind === "fish";
  const aspectRatio =
    kind === "fish"
      ? 100 / 160
      : kind === "shark"
        ? 100 / 180
        : kind === "turtle"
          ? 110 / 150
          : 130 / 100;
  const maxWidth = isFish
    ? Math.min(
        150,
        window.innerWidth * 0.26,
        Math.max(60, (window.innerHeight - 24) / aspectRatio),
      )
    : Math.min(
        110,
        window.innerWidth * 0.22,
        Math.max(54, (window.innerHeight - 24) / aspectRatio),
      );
  const minWidth = Math.min(isFish ? 72 : 64, maxWidth);
  const width = randomBetween(minWidth, maxWidth);
  const height = width * aspectRatio;
  const offscreenMargin = width * 1.1;
  const maxY = Math.max(40, window.innerHeight - height - margin);
  const laneY =
    laneCount > 1 ? (laneIndex * maxY) / (laneCount - 1) : maxY / 2;
  const startY = Math.min(maxY, Math.max(40, margin + laneY));
  const startX = forward > 0 ? -offscreenMargin : window.innerWidth + offscreenMargin;
  const endX = forward > 0 ? window.innerWidth + offscreenMargin : -offscreenMargin;

  return {
    x: startX,
    y: startY,
    endX,
    width,
    height,
    duration: randomBetween(10000, 22000),
    forward,
  };
}

function Fish({ palette, pattern }) {
  const id = useId().replace(/:/g, "");
  const [main, shade, highlight] = palette;

  return (
    <svg viewBox="0 0 160 100" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={highlight} />
          <stop offset=".38" stopColor={main} />
          <stop offset="1" stopColor={shade} />
        </linearGradient>
        <linearGradient id={`${id}-fin`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={highlight} stopOpacity=".88" />
          <stop offset="1" stopColor={shade} stopOpacity=".92" />
        </linearGradient>
      </defs>
      <path
        d="M27 50 5 24q5 25-3 50l25-15"
        fill={`url(#${id}-fin)`}
        stroke={shade}
        strokeWidth="2"
        className="sea-fish-tail"
      />
      <path
        d="m67 29 9-19 15 17m-30 47-3 15 20-13"
        fill={`url(#${id}-fin)`}
        stroke={shade}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M23 50C37 23 83 14 124 34q17 8 24 16-9 13-27 19C79 84 39 75 23 50Z"
        fill={`url(#${id}-body)`}
        stroke={shade}
        strokeWidth="2.5"
      />
      {pattern === 0 && (
        <path
          d="m59 29-8 41m23-47-8 49m23-48-7 48"
          fill="none"
          stroke={highlight}
          strokeWidth="7"
          strokeOpacity=".75"
        />
      )}
      {pattern === 1 && (
        <g fill={highlight} opacity=".82">
          <circle cx="54" cy="42" r="4" />
          <circle cx="70" cy="33" r="3" />
          <circle cx="77" cy="55" r="5" />
          <circle cx="96" cy="41" r="4" />
          <circle cx="57" cy="59" r="3" />
          <circle cx="99" cy="57" r="3" />
        </g>
      )}
      {pattern === 2 && (
        <path
          d="M37 50q8-10 16 0t16 0 16 0 16 0 16 0"
          fill="none"
          stroke={highlight}
          strokeWidth="5"
          strokeOpacity=".82"
        />
      )}
      {pattern === 3 && (
        <path
          d="M43 37q9-11 18 0t18 0 18 0 18 0M42 63q9 11 18 0t18 0 18 0 18 0"
          fill="none"
          stroke={highlight}
          strokeWidth="4"
          strokeOpacity=".78"
        />
      )}
      {pattern === 4 && (
        <g fill={highlight} opacity=".8">
          <path d="m56 34 6 10-6 10-6-10Zm25-8 6 10-6 10-6-10Zm24 12 6 10-6 10-6-10ZM76 57l6 10-6 10-6-10Z" />
        </g>
      )}
      <path
        d="M96 36q-7 14 0 29"
        fill="none"
        stroke={shade}
        strokeWidth="2"
        opacity=".8"
      />
      <path
        d="m85 56 19 8q-12 13-25 9"
        fill={`url(#${id}-fin)`}
        stroke={shade}
        strokeWidth="1.7"
      />
      <path
        d="M122 45q9 3 14 7"
        fill="none"
        stroke={shade}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <ellipse cx="126" cy="42" rx="4.6" ry="5.4" fill="#fff7de" />
      <circle cx="128" cy="42" r="2.6" fill="#142a43" />
      <circle cx="129" cy="41" r=".8" fill="white" />
      <path d="M134 54q5 2 9 0" fill="none" stroke={shade} strokeWidth="1.7" />
      <path d="M37 39q18-19 47-16" fill="none" stroke="white" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Shark() {
  const id = useId().replace(/:/g, "");

  return (
    <svg viewBox="0 0 180 100" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-back`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#b5d8e4" />
          <stop offset=".58" stopColor="#638da5" />
          <stop offset=".59" stopColor="#e7f2ed" />
          <stop offset="1" stopColor="#9fc6cb" />
        </linearGradient>
      </defs>
      <path d="M33 54 8 23l31 19q54-35 112-4l23 12-26 13Q89 91 39 61L8 79Z" fill={`url(#${id}-back)`} stroke="#34596f" strokeWidth="2" />
      <path d="m73 39 13-29 18 33m-31 20-9 20 28-15m29-27 17-16-6 24" fill="#668da2" stroke="#34596f" strokeWidth="2" strokeLinejoin="round" />
      <path d="M39 57q61 25 109 5-49 33-109 2Z" fill="#e7f2ed" />
      <path d="M119 57q11 5 22 2" fill="none" stroke="#283f52" strokeWidth="2.5" />
      <path d="m130 59 3 5m4-6 3 5m4-6 3 4" stroke="#526a75" strokeWidth="1.6" />
      <path d="M102 45q5 10 0 19m7-21q5 10 0 20m7-19q5 9 0 18" fill="none" stroke="#43687e" strokeWidth="2" />
      <circle cx="130" cy="48" r="3" fill="#101c29" />
      <circle cx="131" cy="47" r="1" fill="white" />
      <path d="M46 48q27-16 54-13" fill="none" stroke="white" strokeOpacity=".33" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Turtle() {
  return (
    <svg viewBox="0 0 150 110" aria-hidden="true">
      <path d="m42 67-26 21q-9 5-8-4l13-27m77 9 23 19q9 5 10-4L119 54M57 39 40 18q-7-7-10 1l9 28m39-9 16-22q7-7 10 1l-7 26" fill="#64b981" stroke="#347d69" strokeWidth="3" strokeLinejoin="round" className="sea-turtle-flippers" />
      <path d="M37 49q5-26 40-27t39 28q-7 34-41 34T37 49Z" fill="#477f54" stroke="#285b4b" strokeWidth="3" />
      <path d="M44 49q5-20 32-20t31 21q-7 26-31 27T44 49Z" fill="#9dbd5f" stroke="#d0d78a" strokeWidth="2" />
      <path d="m76 29 1 48M48 47l55 2M57 33l19 16 19-17M56 67l20-18 20 18" fill="none" stroke="#68894d" strokeWidth="2" />
      <path d="M110 48q24-9 28 6t-18 17q-11-4-10-12" fill="#70c88b" stroke="#347d69" strokeWidth="2.5" />
      <circle cx="127" cy="53" r="2.6" fill="#142b2b" />
      <circle cx="128" cy="52" r=".8" fill="white" />
      <path d="M129 62q4 2 7-1" fill="none" stroke="#347d69" strokeWidth="1.6" />
    </svg>
  );
}

function Jellyfish() {
  const id = useId().replace(/:/g, "");

  return (
    <svg viewBox="0 0 100 130" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bell`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffe0fa" stopOpacity=".94" />
          <stop offset=".48" stopColor="#bca9ff" stopOpacity=".86" />
          <stop offset="1" stopColor="#58d6e4" stopOpacity=".78" />
        </linearGradient>
      </defs>
      <path d="M13 56a37 37 0 0 1 74 0q-8 12-18 1-9 12-19 0-10 12-19 0-10 12-18-1Z" fill={`url(#${id}-bell)`} stroke="#f1ddff" strokeWidth="2.5" />
      <path d="M31 42q15-18 35-2" fill="none" stroke="white" strokeOpacity=".6" strokeWidth="4" strokeLinecap="round" />
      <path d="M24 60q-4 13 4 22t0 19m12-38q-4 16 4 25t0 20m12-45q-4 13 3 21t-1 23m13-44q-3 15 5 23t0 18m9-39q-2 13 5 19t-1 16" fill="none" stroke="#b9f5ef" strokeOpacity=".86" strokeWidth="3" strokeLinecap="round" className="sea-jelly-tentacles" />
      <circle cx="39" cy="52" r="2" fill="#fff" opacity=".8" />
      <circle cx="61" cy="52" r="2" fill="#fff" opacity=".8" />
    </svg>
  );
}

function SeaCreature({ kind, index, laneIndex, laneCount, staticPosition }) {
  const [movement, setMovement] = useState(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer;
    let active = true;

    const startSwim = () => {
      if (!active) return;
      const route = createSwim(kind, laneIndex, laneCount);
      const startDelay = randomBetween(index * 180, index * 180 + 700);

      timer = window.setTimeout(() => {
        if (!active) return;
        setMovement({
          ...route,
          x: route.x,
          y: route.y,
          visible: true,
        });

        timer = window.setTimeout(() => {
          if (!active) return;
          setMovement({
            ...route,
            x: route.endX,
            y: route.endY ?? route.y,
            width: route.width,
            height: route.height,
            visible: true,
            forward: route.forward,
            duration: route.duration,
          });

          timer = window.setTimeout(() => {
            if (!active) return;
            startSwim();
          }, Math.max(1800, route.duration * 0.78));
        }, 350);
      }, startDelay);
    };

    startSwim();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [index, kind, laneCount, laneIndex]);

  const fallback = {
    width: kind === "jellyfish" ? 72 : 96,
    height: kind === "jellyfish" ? 94 : 60,
    x: 48 + ((index * 129) % Math.max(120, window.innerWidth - 220)),
    y: 24 + ((index * 73) % Math.max(90, window.innerHeight - 200)),
    visible: true,
    forward: index % 2 === 0 ? 1 : -1,
    duration: 18000,
  };
  const fixedMovement = staticPosition
    ? { ...staticPosition, visible: true, duration: 22000 }
    : null;
  const resolvedMovement = fixedMovement || movement || fallback;
  const palette = fishPalettes[index % fishPalettes.length];
  const style = {
    width: resolvedMovement.width,
    height: resolvedMovement.height,
    left: resolvedMovement.x,
    top: resolvedMovement.y,
    opacity: resolvedMovement.visible ? (kind === "jellyfish" ? 0.8 : 1) : 0,
    zIndex: kind === "jellyfish" ? 2 : 3,
    transform: `scaleX(${resolvedMovement.forward})`,
    transitionDuration: `${resolvedMovement.visible ? resolvedMovement.duration : 0}ms, ${resolvedMovement.visible ? resolvedMovement.duration : 0}ms, 1100ms`,
  };

  return (
    <span className={`sea-creature sea-creature-${kind}`} style={style}>
      {kind === "fish" ? (
        <Fish palette={palette} pattern={index % 5} />
      ) : kind === "shark" ? (
        <Shark />
      ) : kind === "turtle" ? (
        <Turtle />
      ) : (
        <Jellyfish />
      )}
    </span>
  );
}

export default function SeaLife() {
  const creatures = [
    ...Array(14).fill("fish"),
    "shark",
    "shark",
    "turtle",
    "turtle",
    "jellyfish",
    "jellyfish",
    "jellyfish",
  ];
  const laneCounts = creatures.reduce((counts, kind) => {
    counts[kind] = (counts[kind] || 0) + 1;
    return counts;
  }, {});
  const laneIndexes = {};
  const heroFish = [
    { x: 120, y: 120, width: 120, height: 75, forward: 1 },
    { x: 460, y: 240, width: 118, height: 72, forward: -1 },
    { x: 960, y: 150, width: 128, height: 80, forward: 1 },
    { x: 1180, y: 370, width: 136, height: 84, forward: -1 },
  ];

  return (
    <div className="sea-life-layer" aria-hidden="true">
      {heroFish.map((fish, index) => (
        <SeaCreature
          key={`hero-fish-${index}`}
          kind="fish"
          index={index + 100}
          laneIndex={0}
          laneCount={1}
          staticPosition={fish}
        />
      ))}
      {creatures.map((kind, index) => {
        const laneIndex = laneIndexes[kind] || 0;
        laneIndexes[kind] = laneIndex + 1;
        return (
          <SeaCreature
            key={`${kind}-${index}`}
            kind={kind}
            index={index}
            laneIndex={laneIndex}
            laneCount={laneCounts[kind]}
          />
        );
      })}
    </div>
  );
}
