function hasSameMods(modsA, modsB)
{
	if (!modsA || !modsB)
		return false;

	// Filter out mods that don't affect compatibility
	const significantModsA = modsA.filter(mod => !mod.ignoreInCompatibilityChecks);
	const significantModsB = modsB.filter(mod => !mod.ignoreInCompatibilityChecks);

	// If the number of significant mods differs, they're incompatible
	if (significantModsA.length !== significantModsB.length)
		return false;

	// Sort both arrays by mod name for consistent ordering
	significantModsA.sort((a, b) => a.name.localeCompare(b.name));
	significantModsB.sort((a, b) => a.name.localeCompare(b.name));

	// Check each mod pair
	for (let i = 0; i < significantModsA.length; i++) {
		const modA = significantModsA[i];
		const modB = significantModsB[i];

		// Mod names must match
		if (modA.name !== modB.name)
			return false;

		// Check version compatibility
		// You might want to implement semantic versioning comparison here
		if (!areVersionsCompatible(modA.version, modB.version))
			return false;
	}

	return true;
}

/**
 * Check if two version strings are compatible
 * This is a simple implementation - you might want to enhance it
 * based on your versioning scheme
 */
function areVersionsCompatible(versionA, versionB)
{
	// If versions are identical, they're compatible
	if (versionA === versionB)
		return true;

	// Parse versions into components
	const parseVersion = (v) => {
		return v.split(/[.-]/).map(part => {
			const num = parseInt(part, 10);
			return isNaN(num) ? part : num;
		});
	};

	const partsA = parseVersion(versionA);
	const partsB = parseVersion(versionB);

	// Compare version components
	// This implements a simple rule: major version must match, minor/patch can differ
	// You can adjust this logic based on your needs
	const minLength = Math.min(partsA.length, partsB.length);

	// At minimum, the first component (major version) must match
	if (partsA[0] !== partsB[0])
		return false;

	// If both have at least 2 components, check if they're compatible
	// This assumes that if versionB is newer, it's still compatible
	// as long as major version matches
	if (minLength >= 2) {
		// If versionB is newer, it's compatible (assuming backward compatibility)
		// You might want to make this configurable
		return true;
	}

	return true;
}