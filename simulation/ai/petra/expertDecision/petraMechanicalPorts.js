import { resolvedTemplate } from "simulation/ai/petra/expertDecision/petraApiAdapter.js";

function requireFunction(value, label) {
  if (typeof value !== "function")
    throw new Error(`${label} is required by the Petra mechanical port`);
  return value;
}

function readTemplateGeometry(gameState, kind) {
  if (!gameState || typeof gameState.getTemplate !== "function" || typeof gameState.applyCiv !== "function")
    throw new Error("gameState.getTemplate/applyCiv are required to read building geometry");
  const type = resolvedTemplate(gameState, kind);
  const template = gameState.getTemplate(type);
  if (!template)
    throw new Error(`template ${type} is unavailable`);
  if (typeof template.obstructionRadius !== "function")
    throw new Error(`template ${type}.obstructionRadius() is required`);
  const obstruction = template.obstructionRadius();
  const radius = Number(obstruction && obstruction.max);
  if (!Number.isFinite(radius) || radius <= 0)
    throw new Error(`template ${type} has invalid obstruction radius`);

  let footprintHalfExtents;
  let obstructionHalfExtents;
  if (typeof template.get === "function") {
    if (template.get("Footprint/Square")) {
      const width = Number(template.get("Footprint/Square/@width"));
      const depth = Number(template.get("Footprint/Square/@depth"));
      if (Number.isFinite(width) && Number.isFinite(depth) && width > 0 && depth > 0)
        footprintHalfExtents = { width: width / 2, depth: depth / 2 };
    }
    // IT14.81: construction collision is governed by Obstruction/Static, not the
    // larger visual/selection Footprint square.  For the current CWA templates this
    // distinction is material (e.g. Fields have a substantially larger Footprint than
    // their Static obstruction).  Using Footprint dimensions made Expert believe legal
    // human-tight Field packing was impossible.
    if (template.get("Obstruction/Static")) {
      const width = Number(template.get("Obstruction/Static/@width"));
      const depth = Number(template.get("Obstruction/Static/@depth"));
      if (Number.isFinite(width) && Number.isFinite(depth) && width > 0 && depth > 0)
        obstructionHalfExtents = { width: width / 2, depth: depth / 2 };
    }
  }
  // IT14.82: use the full construction Footprint for Farmstead/Field packing.
  // IT14.81 used the smaller Static obstruction as if it were the engine's legal
  // centre-spacing contract; that produced positions the AI accepted but the simulation
  // refused to materialize. Keep Static extents for diagnostics only.
  const halfExtents = footprintHalfExtents || obstructionHalfExtents;
  return { type, template, radius, halfExtents, footprintHalfExtents, obstructionHalfExtents };
}

function createPetraCollectorPorts(dependencies = {}) {
  const getLandAccess = requireFunction(dependencies.getLandAccess, "dependencies.getLandAccess");
  const isSupplyFull = requireFunction(dependencies.isSupplyFull, "dependencies.isSupplyFull");
  return {
    getLandAccess: (gameState, ent) => getLandAccess(gameState, ent),
    isSupplyFull: (gameState, ent) => isSupplyFull(gameState, ent)
  };
}

function createPetraPlacementPorts(gameState, kind, options = {}) {
  const HQ = options.HQ || gameState && gameState.ai && gameState.ai.HQ;
  if (!HQ || !HQ.territoryMap)
    throw new Error("HQ.territoryMap is required by the Petra placement port");
  const createObstructionMap = requireFunction(options.createObstructionMap, "options.createObstructionMap");
  const geometry = readTemplateGeometry(gameState, kind);
  const accessIndex = Number(options.accessIndex || 0);
  const obstructions = createObstructionMap(gameState, accessIndex, geometry.template);
  if (!obstructions || !Number.isFinite(obstructions.width) || !Number.isFinite(obstructions.cellSize))
    throw new Error("createObstructionMap must return an InfoMap-like object with width/cellSize");
  const territoryMap = HQ.territoryMap;
  if (typeof territoryMap.gamePosToMapPos !== "function" || typeof territoryMap.getNonObstructedTile !== "function")
    throw new Error("territoryMap.gamePosToMapPos/getNonObstructedTile are required by the Petra placement port");
  const radiusCells = Math.ceil(geometry.radius / obstructions.cellSize);
  const exactOrientedFootprint = !!(options.exactOrientedFootprint || options.exactAxisAlignedFootprint) && !!geometry.halfExtents;

  // IT14.82: Fields/Farmsteads remain packed as rotated rectangles in one local
  // coordinate system, but the rectangle is the full Footprint, not the smaller Static
  // obstruction. This deliberately errs on the safe side: a candidate must clear the
  // same footprint envelope used to calculate centre spacing. The simulation remains
  // the final authority when the construct command is issued.
  const exactRectangleIsFree = (candidate, request = {}) => {
    if (!exactOrientedFootprint || !Array.isArray(candidate) || candidate.length < 2)
      return false;
    const x = Number(candidate[0]);
    const z = Number(candidate[1]);
    const angle = Number.isFinite(Number(request.angle)) ? Number(request.angle) : 0;
    if (!Number.isFinite(x) || !Number.isFinite(z))
      return false;
    const data = obstructions.map || obstructions.data;
    const width = Number(obstructions.width);
    const cellSize = Number(obstructions.cellSize);
    if (!data || !Number.isFinite(width) || !Number.isFinite(cellSize) || cellSize <= 0)
      return false;

    const epsilon = Math.min(0.15, cellSize * 0.04);
    const halfW = Math.max(0.05, Number(geometry.halfExtents.width) - epsilon);
    const halfD = Math.max(0.05, Number(geometry.halfExtents.depth) - epsilon);
    const cosa = Math.cos(angle);
    const sina = Math.sin(angle);
    // Bounding AABB of the rotated rectangle, used only to bound the cell scan.
    const boundX = Math.abs(cosa) * halfW + Math.abs(sina) * halfD;
    const boundZ = Math.abs(sina) * halfW + Math.abs(cosa) * halfD;
    const minX = Math.floor((x - boundX) / cellSize);
    const maxX = Math.floor((x + boundX) / cellSize);
    const minZ = Math.floor((z - boundZ) / cellSize);
    const maxZ = Math.floor((z + boundZ) / cellSize);
    if (minX < 0 || minZ < 0 || maxX >= width || maxZ >= width)
      return false;

    for (let mz = minZ; mz <= maxZ; ++mz)
      for (let mx = minX; mx <= maxX; ++mx) {
        const cellX = (mx + 0.5) * cellSize;
        const cellZ = (mz + 0.5) * cellSize;
        const dx = cellX - x;
        const dz = cellZ - z;
        // Match 0 A.D.'s local obstruction transform (see attackPlan.js).
        const u = dx * cosa - dz * sina;
        const v = dx * sina + dz * cosa;
        if (Math.abs(u) > halfW || Math.abs(v) > halfD)
          continue;
        if (Number(data[mx + mz * width]) < 255)
          return false;
      }
    return true;
  };

  return {
    geometry,
    obstructionMap: obstructions,
    radiusCells,
    snapToLegalPosition(candidate, request = {}) {
      if (exactOrientedFootprint)
        return exactRectangleIsFree(candidate, request) ? [Number(candidate[0]), Number(candidate[1])] : undefined;
      const mapPos = territoryMap.gamePosToMapPos(candidate);
      if (!Array.isArray(mapPos) || mapPos.length < 2)
        return undefined;
      const mx = Math.floor(mapPos[0]);
      const mz = Math.floor(mapPos[1]);
      if (mx < 0 || mz < 0 || mx >= territoryMap.width || mz >= territoryMap.width)
        return undefined;
      const j = mx + mz * territoryMap.width;
      const i = territoryMap.getNonObstructedTile(j, radiusCells, obstructions);
      if (!Number.isFinite(i) || i < 0)
        return undefined;
      const x = (i % obstructions.width + 0.5) * obstructions.cellSize;
      const z = (Math.floor(i / obstructions.width) + 0.5) * obstructions.cellSize;
      return [x, z];
    },
    isDangerous(position) {
      return typeof HQ.isDangerousLocation === "function" ?
        !!HQ.isDangerousLocation(gameState, position, geometry.radius) : false;
    }
  };
}

export { readTemplateGeometry, createPetraCollectorPorts, createPetraPlacementPorts };
