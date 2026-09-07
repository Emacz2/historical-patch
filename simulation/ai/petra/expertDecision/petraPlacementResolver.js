function normalize(v) {
  const len = Math.hypot(v[0], v[1]);
  return len > 0 ? [v[0] / len, v[1] / len] : [1, 0];
}

function addPolar(anchor, distance, angle) {
  return [anchor[0] + Math.cos(angle) * distance, anchor[1] + Math.sin(angle) * distance];
}

function requirePosition(value, label) {
  if (!Array.isArray(value) || value.length !== 2 || !value.every(Number.isFinite))
    throw new Error(`${label} must be an explicit [x,z] position`);
  return value;
}

function orderedAngles(baseAngle, count = 16) {
  const result = [];
  const step = 2 * Math.PI / count;
  result.push(baseAngle);
  for (let i = 1; i <= Math.floor(count / 2); ++i) {
    result.push(baseAngle + i * step);
    if (i !== count / 2)
      result.push(baseAngle - i * step);
  }
  return result;
}

function generateHouseCandidates(request) {
  const anchor = requirePosition(request.anchor, "house anchor");
  const templateRadius = Number(request.templateRadius);
  const anchorRadius = Number(request.anchorRadius || 0);
  if (!Number.isFinite(templateRadius) || templateRadius <= 0)
    throw new Error("house templateRadius is required");
  const borderGap = Number.isFinite(request.maxBorderGap) ? request.maxBorderGap : 5;
  const minDist = anchorRadius + templateRadius + 0.5;
  const maxDist = anchorRadius + templateRadius + borderGap;
  let direction = [1, 0];
  if (request.avoid) {
    const avoid = requirePosition(request.avoid, "house avoid");
    direction = normalize([anchor[0] - avoid[0], anchor[1] - avoid[1]]);
  }
  const base = Math.atan2(direction[1], direction[0]);
  const angles = orderedAngles(base, 16);
  const out = [];
  for (let d = minDist; d <= maxDist + 0.001; d += 1)
    for (const angle of angles)
      out.push(addPolar(anchor, d, angle));
  return out;
}

function generateFarmsteadCandidates(request) {
  const center = requirePosition(request.anchor, "farmstead food-center anchor");
  const toward = request.toward ? requirePosition(request.toward, "farmstead toward") : [center[0] + 1, center[1]];
  const base = Math.atan2(toward[1] - center[1], toward[0] - center[0]);
  const out = [];
  const angleCount = Math.max(8, Math.floor(Number(request.angleCount) || 16));
  for (const dist of request.distances || [12, 15, 18, 21])
    for (const angle of orderedAngles(base, angleCount))
      out.push(addPolar(center, dist, angle));
  return out;
}

function fieldLocalToWorld(anchor, u, v, angle) {
  const cosa = Math.cos(angle);
  const sina = Math.sin(angle);
  // Inverse of 0 A.D.'s local obstruction transform:
  // u = dx*c - dz*s, v = dx*s + dz*c.
  return [anchor[0] + u * cosa + v * sina, anchor[1] - u * sina + v * cosa];
}

function generateFieldCandidates(request) {
  const anchor = requirePosition(request.anchor, "field farmstead anchor");
  const farm = request.anchorHalfExtents || { width: 5, depth: 5 };
  const field = request.templateHalfExtents || { width: 14, depth: 14 };
  const angle = Number.isFinite(Number(request.angle)) ? Number(request.angle) : 3 * Math.PI / 4;
  const baseGap = Number.isFinite(request.gap) ? request.gap : 0.5;
  const gaps = Array.isArray(request.gaps) && request.gaps.length ? request.gaps : [baseGap, 0.25, 0.5, 0.75];
  const out = [];
  const seen = new Set();
  const pushLocal = (u, v) => {
    const world = fieldLocalToWorld(anchor, u, v, angle);
    const key = `${world[0].toFixed(3)},${world[1].toFixed(3)}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(world);
  };

  // IT14.82 FARM PACKING CONTRACT:
  // Work entirely in the Farmstead's LOCAL rotated coordinates.  Farmstead and Fields
  // share one angle, so a tight four-Field block is ordinary rectangle packing even when
  // the whole district is rotated 135 degrees in world space.
  //
  // Use Static-obstruction half-extents (supplied by readTemplateGeometry), not the
  // larger visual Footprint dimensions.  The latter was the main reason IT14.80 thought
  // human-legal compact Fields did not fit.
  const farmW = Math.max(0.1, Number(farm.width) || 0.1);
  const farmD = Math.max(0.1, Number(farm.depth) || 0.1);
  const fieldW = Math.max(0.1, Number(field.width) || 0.1);
  const fieldD = Math.max(0.1, Number(field.depth) || 0.1);
  const shiftU = Math.max(0, fieldW - farmW);
  const shiftV = Math.max(0, fieldD - farmD);

  for (const gapValue of gaps) {
    const gap = Math.max(0, Number(gapValue) || 0);
    const normalU = farmW + fieldW + gap;
    const normalV = farmD + fieldD + gap;

    // Clockwise pinwheel: four edge-touching positions around the rotated Farmstead.
    pushLocal(-shiftU, -normalV); // north/local -v
    pushLocal(+normalU, -shiftV); // east/local +u
    pushLocal(+shiftU, +normalV); // south/local +v
    pushLocal(-normalU, +shiftV); // west/local -u

    // Counter-clockwise mirror. A resource/rock may block one tangential side while the
    // mirrored arrangement still gives the same compact 3-4 Field district.
    pushLocal(+shiftU, -normalV);
    pushLocal(+normalU, +shiftV);
    pushLocal(-shiftU, +normalV);
    pushLocal(-normalU, -shiftV);
  }

  // Side centres are useful when only one/two Fields are needed or a square obstruction
  // happens to make the pinwheel shift unnecessary.
  for (const gapValue of gaps) {
    const gap = Math.max(0, Number(gapValue) || 0);
    const normalU = farmW + fieldW + gap;
    const normalV = farmD + fieldD + gap;
    pushLocal(0, -normalV);
    pushLocal(+normalU, 0);
    pushLocal(0, +normalV);
    pushLocal(-normalU, 0);
  }

  // Human-like face sliding.  This never increases the perpendicular Farmstead->Field
  // gap; it only moves the Field ALONG a face so it can line up beside an existing Field
  // or dodge a tree/mineral/resource that temporarily blocks the ideal slot.
  const tangentFractions = [0.18, -0.18, 0.36, -0.36, 0.54, -0.54, 0.70, -0.70];
  if (request.allowWideTangents)
    tangentFractions.push(0.88, -0.88, 1.06, -1.06, 1.22, -1.22);

  for (const gapValue of gaps) {
    const gap = Math.max(0, Number(gapValue) || 0);
    const normalU = farmW + fieldW + gap;
    const normalV = farmD + fieldD + gap;
    const spanU = farmW + fieldW;
    const spanV = farmD + fieldD;
    for (const fraction of tangentFractions) {
      const tangentU = fraction * spanU;
      const tangentV = fraction * spanV;
      pushLocal(tangentU, -normalV);
      pushLocal(+normalU, tangentV);
      pushLocal(tangentU, +normalV);
      pushLocal(-normalU, tangentV);
    }
  }
  return out;
}

function generateRingCandidates(request, defaults = [18, 22, 26, 30]) {
  const anchor = requirePosition(request.anchor, `${request.kind} anchor`);
  let base = 0;
  if (request.toward) {
    const toward = requirePosition(request.toward, `${request.kind} toward`);
    base = Math.atan2(toward[1] - anchor[1], toward[0] - anchor[0]);
  }
  const out = [];
  const angleCount = Math.max(8, Math.floor(Number(request.angleCount) || 16));
  for (const dist of request.distances || defaults)
    for (const angle of orderedAngles(base, angleCount))
      out.push(addPolar(anchor, dist, angle));
  return out;
}

function generatePlacementCandidates(request) {
  if (!request || !request.kind)
    throw new Error("placement request.kind is required");
  if (Array.isArray(request.candidates))
    return request.candidates.map((pos, i) => requirePosition(pos, `candidate ${i}`));
  switch (request.kind) {
    case "house": return generateHouseCandidates(request);
    case "farmstead": return generateFarmsteadCandidates(request);
    case "field": return generateFieldCandidates(request);
    case "barracks": return generateRingCandidates(request, [18, 22, 26, 30]);
    case "market": return generateRingCandidates(request, [28, 34, 40, 46, 52]);
    case "storehouse": return generateRingCandidates(request, [20, 24, 28, 32]);
    case "tower": return generateRingCandidates(request, [16, 20, 24, 28, 32]);
    // IT14.62 hotfix: Cleruchy placement is resource-anchored by the controller,
    // but still needs the generic ring candidate generator. The missing resolver
    // case caused every attempted frontier expansion to throw once per update.
    case "cleruchy": return generateRingCandidates(request, [0, 4, 8, 12, 16, 20, 26, 32]);
    default: throw new Error(`Unsupported placement kind ${request.kind}`);
  }
}

function resolveBuildingPosition(request, ports = {}) {
  const templateRadius = Number(request.templateRadius || 1);
  if (!Number.isFinite(templateRadius) || templateRadius <= 0)
    throw new Error("placement request.templateRadius must be positive");
  if (typeof ports.snapToLegalPosition !== "function")
    throw new Error("ports.snapToLegalPosition(candidate, request) is required");
  const candidates = generatePlacementCandidates(request);
  const rejected = [];
  const scored = [];
  for (let index = 0; index < candidates.length; ++index) {
    const candidate = candidates[index];
    const snapped = ports.snapToLegalPosition(candidate, request);
    if (!snapped) {
      rejected.push({ index, candidate, reason: "obstructed-or-illegal" });
      continue;
    }
    const position = Array.isArray(snapped) ? snapped : snapped.position;
    if (!position || !position.every(Number.isFinite)) {
      rejected.push({ index, candidate, reason: "invalid-snap-result" });
      continue;
    }
    if (typeof ports.isDangerous === "function" && ports.isDangerous(position, templateRadius, request)) {
      rejected.push({ index, candidate, position, reason: "dangerous" });
      continue;
    }
    if (typeof ports.extraValidation === "function" && !ports.extraValidation(position, request)) {
      rejected.push({ index, candidate, position, reason: "extra-validation" });
      continue;
    }

    // Preserve legacy first-legal behavior unless the caller explicitly supplies a
    // score. Farmstead placement uses this to prefer clear berry->dropsite paths
    // instead of a geometrically close position hidden behind stone/metal blockers.
    if (typeof ports.scoreCandidate !== "function")
      return {
        kind: request.kind,
        position: [position[0], position[1]],
        angle: Number.isFinite(request.angle) ? request.angle : 3 * Math.PI / 4,
        candidateIndex: index,
        rejected
      };

    const score = Number(ports.scoreCandidate(position, request, index));
    if (!Number.isFinite(score)) {
      rejected.push({ index, candidate, position, reason: "invalid-score" });
      continue;
    }
    scored.push({ index, position: [position[0], position[1]], score });
  }

  if (scored.length) {
    scored.sort((a, b) => a.score - b.score || a.index - b.index);
    const best = scored[0];
    return {
      kind: request.kind,
      position: best.position,
      angle: Number.isFinite(request.angle) ? request.angle : 3 * Math.PI / 4,
      candidateIndex: best.index,
      score: best.score,
      rejected
    };
  }
  return { kind: request.kind, position: undefined, candidateIndex: -1, rejected };
}

export {
  orderedAngles,
  generatePlacementCandidates,
  resolveBuildingPosition
};
