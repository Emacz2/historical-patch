// These integers must be sequential
PETRA_EXPERT.DIFFICULTY_SANDBOX = 0;
PETRA_EXPERT.DIFFICULTY_VERY_EASY = 1;
PETRA_EXPERT.DIFFICULTY_EASY = 2;
PETRA_EXPERT.DIFFICULTY_MEDIUM = 3;
PETRA_EXPERT.DIFFICULTY_HARD = 4;
PETRA_EXPERT.DIFFICULTY_VERY_HARD = 5;

PETRA_EXPERT.Config = function(difficulty = PETRA_EXPERT.DIFFICULTY_MEDIUM, behavior)
{
	this.difficulty = difficulty;

	// for instance "balanced", "aggressive" or "defensive"
	this.behavior = behavior || "random";

	// debug level: 0=none, 1=sanity checks, 2=debug, 3=detailed debug, -100=serializatio debug
	this.debug = 0;

	this.chat = true;	// false to prevent AI's chats

	let randPopScaling = randFloat(.85, 1.2);

	this.popScaling = randPopScaling;

	let randTowerLapseTime = Math.ceil(randFloat(10, 40));
	let randFortressLapseTime = Math.ceil(randFloat(80, 250));
	let randPopForBarracks1 = Math.ceil(randFloat(15, 25));
	let randPopForBarracks2 = Math.ceil(randFloat(50, 65));
	let randPopForBarracks3 = Math.ceil(randFloat(85, 100));
	let randPopForBarracks4 = Math.ceil(randFloat(120, 130));
	let randPopForBarracks5 = Math.ceil(randFloat(140, 150));

	let randPopForStable1 = Math.ceil(randFloat(80, 100));
	let randPopForStable2 = Math.ceil(randFloat(125, 140));
	let randPopForStable3 = Math.ceil(randFloat(160, 180));
	let randPopForStable4 = Math.ceil(randFloat(200, 240));
	let randPopForStable5 = Math.ceil(randFloat(250, 270));

	//let randNumSentryTowers = Math.ceil(randFloat(3, 15));



	this.Military = {
		//"towerLapseTime": 120,	// Time to wait between building 2 towers
		"towerLapseTime": randTowerLapseTime,
		//"fortressLapseTime": 390,	// Time to wait between building 2 fortresses
		"fortressLapseTime": randFortressLapseTime,
		//"popForBarracks1": 30,
		"popForBarracks1": randPopForBarracks1,
		//"popForBarracks2": 65,
		"popForBarracks2": randPopForBarracks2,
		"popForBarracks3": randPopForBarracks3,
		"popForBarracks4": randPopForBarracks4,
		"popForBarracks5": randPopForBarracks5,
		"popForStable1": randPopForStable1,
		"popForStable2": randPopForStable2,
		"popForStable3": randPopForStable3,
		"popForStable4": randPopForStable4,
		"popForStable5": randPopForStable5,
		"popForForge": 65,		
		"popForEmbassy": 65,
		//"numSentryTowers": 1
		"numSentryTowers": 2 //randNumSentryTowers
	};

	this.DamageTypeImportance = {
		"Hack": 0.090,
		"Pierce": 0.085,
		"Crush": 0.060,
		"Fire": 0.095
	};

	// mod params
	let randPopPhase2 = Math.ceil(randFloat(50, 80));
	let randWorkPhase3 = Math.ceil(randFloat(160, 190));
	let randWorkPhase4 = Math.ceil(randFloat(190, 200));
	let randPopForDock = Math.ceil(randFloat(5, 35));
	let randTargetNumWorkers = Math.ceil(randFloat(120, 150));
	let randTargetNumTraders = Math.ceil(randFloat(10, 20));
	let randTargetNumFishers = Math.ceil(randFloat(5, 20));

	this.Economy = {
		//"popPhase2": 75,	// How many units we want before aging to phase2.
		"popPhase2": randPopPhase2,
		//"workPhase3": 125,	// How many workers we want before aging to phase3.
		"workPhase3": randWorkPhase3,
		//"workPhase4": 150,	// How many workers we want before aging to phase4 or higher.
		"randWorkPhase4": randWorkPhase4,

		"popForGerousia": 65,
		
		"popForCorral1": 25,
		"popForCorral2": 50,
		"popForCorral3": 90,
		"popForCorral4": 120,
		"popForCorral5": 150,
		//"popForDock": 25,
		"popForDock": randPopForDock,
		//"targetNumWorkers": 40,	// dummy, will be changed later
		"targetNumWorkers": randTargetNumWorkers,
		//"targetNumTraders": 5,	// Target number of traders
		"targetNumTraders": randTargetNumTraders,
		//"targetNumFishers": 1,	// Target number of fishers per sea
		"targetNumFishers": randTargetNumFishers,
		//"supportRatio": 0.35,	// fraction of support workers among the workforce
		"supportRatio": .85,
		//"provisionFields": 2
		"provisionFields": 1
	};

	// Note: attack settings are set directly in attack_plan.js
	// defense
	/* this.Defense =
	{
		"defenseRatio": { "ally": 1.4, "neutral": 1.8, "own": 2 },	// ratio of defenders/attackers.
		"armyCompactSize": 2000,	// squared. Half-diameter of an army.
		"armyBreakawaySize": 3500,	// squared.
		"armyMergeSize": 1400	// squared.
	}; */

	// mod
	this.Defense =
	{
		"defenseRatio": { "ally": 2.4, "neutral": 2.8, "own": 4 },	// ratio of defenders/attackers.
		"armyCompactSize": 3000,	// squared. Half-diameter of an army.
		"armyBreakawaySize": 5500,	// squared.
		"armyMergeSize": 2400	// squared.
	};

	// Additional buildings that the AI does not yet know when to build
	// and that it will try to build on phase 3 when enough resources.
	this.buildings =
	{
		"default": [],
		"athen": [
			"structures/{civ}/gymnasium",
			"structures/{civ}/prytaneion",
			"structures/{civ}/theater"
		],
		"brit": [
			"structures/{civ}/kennel",
			"structures/{civ}/hill_fort"

		],
		"cart": [
			"structures/{civ}/embassy_celtic",
			"structures/{civ}/embassy_iberian",
			"structures/{civ}/embassy_italic",
			"structures/{civ}/numidian_camp",
			"structures/{civ}/super_dock",

		],
		"gaul": [
			"structures/{civ}/celtic_coalitliton",
			"structures/{civ}/assembly"
		],
		"han": [
			"structures/{civ}/academy",
			"structures/{civ}/ministry"

		],
		"iber": [
			"structures/{civ}/hall_of_heroes",
			"structures/{civ}/monument",
			"structures/{civ}/silvermine"
		],
		"kush": [
			"structures/{civ}/camp_blemmye",
			"structures/{civ}/camp_noba",
			"structures/{civ}/pyramid_large",
			"structures/{civ}/pyramid_small",
			"structures/{civ}/temple_amun"
	 	],
		"mace": [
			"structures/{civ}/royal_stoa",
			"structures/{civ}/theater"
		],
		"maur": [
			"structures/{civ}/palace",
			"structures/{civ}/pillar_ashoka"
		],
		"pers": [
			"structures/{civ}/apartment_block",
			"structures/{civ}/tachara"
		],
		"ptol": [
			"structures/{civ}/library",
			"structures/{civ}/theater",
			//"structures/{civ}/lighthouse",
			//"structures/{civ}/mercenary_camp",
			"structures/{civ}/temple_2"

		],
		"rome": [
			"structures/{civ}/army_camp",
			"structures/{civ}/temple_mars",
			"structures/{civ}/temple_vesta",
			"structures/{civ}/tower_artillery"
		],
		"sele": [
			"structures/{civ}/theater"
		],
		"spart": [
			"structures/{civ}/camp",
			"structures/{civ}/gerousia",
			"structures/{civ}/syssiton",
			"structures/{civ}/tent_helot",
			"structures/{civ}/theater"

		]
	};

	/* this.priorities =
	{
		"villager": 30,      // should be slightly lower than the citizen soldier one to not get all the food
		"citizenSoldier": 45,
		"trader": 75,
		"healer": 50,
		"ships": 70,
		"house": 350,
		"dropsites": 200,
		"field": 400,
		"dock": 90,
		"corral": 100,
		"economicBuilding": 90,
		"militaryBuilding": 130,
		"defenseBuilding": 70,
		"civilCentre": 950,
		"majorTech": 700,
		"minorTech": 250,
		"wonder": 1000,
		"emergency": 1000    // used only in emergency situations, should be the highest one
	}; */

	// mod
	this.priorities =
	{
		"villager": 800,      // should be slightly lower than the citizen soldier one to not get all the food
		"citizenSoldier": 900,
		"trader": 200,
		"healer": 250,
		"ships": 100,
		"house": 750,
		"dropsites": 200,
		"field": 670,
		"dock": 600,
		"corral":100,
		"economicBuilding": 750,
		"militaryBuilding": 700,
		"defenseBuilding": 300,
		"civilCentre": 925,
		"majorTech": 700,
		"minorTech": 600,
		"wonder": 1000,
		"emergency": 1000    // used only in emergency situations, should be the highest one
	};

	// Default personality (will be updated in setConfig)
	this.personality =
	{
		"aggressive": 0.5,
		"cooperative": 0.5,
		"defensive": 0.5
	};

	// See PETRA_EXPERT.QueueManager.prototype.wantedGatherRates()
	this.queues =
	{
		"firstTurn": {
			"food": 10,
			"wood": 10,
			"default": 0
		},
		"short": {
			"food": 225,
			"wood": 150,
			"default": 50
		},
		"medium": {
			"default": 0
		},
		"long": {
			"default": 0
		},
		"long1": {
			"default": 0
		}
	};

	this.garrisonHealthLevel = { "low": 0.4, "medium": 0.55, "high": 0.7 };

	this.unusedNoAllyTechs = [
		"Player/sharedLos",
		"Market/InternationalBonus",
		"Player/sharedDropsites"
	];


	this.criticalPopulationFactors = [
		0.8,
		0.8,
		0.7,
		0.6,
		0.5,
		0.35
	];

	this.criticalStructureFactors = [
		0.8,
		0.8,
		0.7,
		0.6,
		0.5,
		0.35
	];

	this.criticalRootFactors = [
		0.8,
		0.8,
		0.67,
		0.5,
		0.35,
		0.2
	];
};

PETRA_EXPERT.Config.prototype.setConfig = function(gameState)
{
	if (this.difficulty > PETRA_EXPERT.DIFFICULTY_SANDBOX)
	{
		// Setup personality traits according to the user choice:
		// The parameter used to define the personality is basically the aggressivity or (1-defensiveness)
		// as they are anticorrelated, although some small smearing to decorelate them will be added.
		// And for each user choice, this parameter can vary between min and max
		let personalityList = {
			"random": { "min": 0, "max": 1 },
			"defensive": { "min": 0, "max": 0.27 },
			"balanced": { "min": 0.37, "max": 0.63 },
			"aggressive": { "min": 0.73, "max": 1 }
		};
		let behavior = randFloat(-0.5, 0.5);
		// make agressive and defensive quite anticorrelated (aggressive ~ 1 - defensive) but not completelety
		let variation = 0.3 * randFloat(-1, 1) * Math.sqrt(Math.square(0.5) - Math.square(behavior));
		let aggressive = Math.max(Math.min(behavior + variation, 0.5), -0.5) + 0.5;
		let defensive = Math.max(Math.min(-behavior + variation, 0.5), -0.5) + 0.5;
		let min = personalityList[this.behavior].min;
		let max = personalityList[this.behavior].max;
		this.personality = {
			"aggressive": min + aggressive * (max - min),
			"defensive": 1 - max + defensive * (max - min),
			"cooperative": randFloat(0, 1)
		};
	}
	// Petra Expert usually uses the continuous values of personality.aggressive and personality.defensive
	// to define its behavior according to personality. But when discontinuous behavior is needed,
	// it uses the following personalityCut which should be set such that:
	// behavior="aggressive" => personality.aggressive > personalityCut.strong &&
	//                          personality.defensive  < personalityCut.weak
	// and inversely for behavior="defensive"
	this.personalityCut = { "weak": 0.3, "medium": 0.5, "strong": 0.7 };

	if (gameState.playerData.teamsLocked)
		this.personality.cooperative = Math.min(1, this.personality.cooperative + 0.30);
	else if (gameState.getAlliedVictory())
		this.personality.cooperative = Math.min(1, this.personality.cooperative + 0.15);

	// changing settings based on difficulty or personality
	this.Military.towerLapseTime = Math.round(this.Military.towerLapseTime * (1.1 - 0.2 * this.personality.defensive));
	this.Military.fortressLapseTime = Math.round(this.Military.fortressLapseTime * (1.1 - 0.2 * this.personality.defensive));
	this.priorities.defenseBuilding = Math.round(this.priorities.defenseBuilding * (0.9 + 0.2 * this.personality.defensive));

	if (this.difficulty < PETRA_EXPERT.DIFFICULTY_EASY)
	{
		this.popScaling = 0.5;
		this.Economy.supportRatio = 0.5;
		this.Economy.provisionFields = 1;
		this.Military.numSentryTowers = this.personality.defensive > this.personalityCut.strong ? 1 : 0;
	}
	else if (this.difficulty < PETRA_EXPERT.DIFFICULTY_MEDIUM)
	{
		this.popScaling = 0.7;
		this.Economy.supportRatio = 0.4;
		this.Economy.provisionFields = 1;
		this.Military.numSentryTowers = this.personality.defensive > this.personalityCut.strong ? 1 : 0;
	}
	else
	{
		if (this.difficulty == PETRA_EXPERT.DIFFICULTY_MEDIUM)
			this.Military.numSentryTowers = 1;
		else
			this.Military.numSentryTowers = 2;
		if (this.personality.defensive > this.personalityCut.strong)
			++this.Military.numSentryTowers;
		else if (this.personality.defensive < this.personalityCut.weak)
			--this.Military.numSentryTowers;

		if (this.personality.aggressive > this.personalityCut.strong)
		{
			this.Military.popForBarracks1 = 12;
			this.Economy.popPhase2 = 50;
			this.priorities.healer = 10;
		}
	}

	let maxPop = gameState.getPopulationMax();
	if (this.difficulty < PETRA_EXPERT.DIFFICULTY_EASY)
		this.Economy.targetNumWorkers = Math.max(1, Math.min(40, maxPop));
	else if (this.difficulty < PETRA_EXPERT.DIFFICULTY_MEDIUM)
		this.Economy.targetNumWorkers = Math.max(1, Math.min(60, Math.floor(maxPop/2)));
	else
		this.Economy.targetNumWorkers = Math.floor(this.Economy.targetNumWorkers * this.popScaling);
	this.Economy.targetNumTraders = Math.floor(this.Economy.targetNumTraders * this.popScaling);


	if (gameState.getVictoryConditions().has("wonder"))
	{
		this.Economy.workPhase3 = Math.floor(0.9 * this.Economy.workPhase3);
		this.Economy.workPhase4 = Math.floor(0.9 * this.Economy.workPhase4);
	}

	if (maxPop <= 300)
		this.popScaling *= Math.sqrt(maxPop / 300);

	this.Military.popForBarracks1 = Math.floor(this.Military.popForBarracks1 * this.popScaling);
	this.Military.popForBarracks2 = Math.floor(this.Military.popForBarracks2 * this.popScaling);
	this.Military.popForBarracks3 = Math.floor(this.Military.popForBarracks3 * this.popScaling);
	this.Military.popForBarracks4 = Math.floor(this.Military.popForBarracks4 * this.popScaling);
	this.Military.popForBarracks5 = Math.floor(this.Military.popForBarracks5 * this.popScaling);
	//Stable
	this.Military.popForStable1 = Math.floor(this.Military.popForStable1 * this.popScaling);
	this.Military.popForStable2 = Math.floor(this.Military.popForStable2 * this.popScaling);
	this.Military.popForStable3 = Math.floor(this.Military.popForStable3 * this.popScaling);
	this.Military.popForStable4 = Math.floor(this.Military.popForStable4 * this.popScaling);
	this.Military.popForStable5 = Math.floor(this.Military.popForStable5 * this.popScaling);
	this.Military.popForForge = Math.floor(this.Military.popForForge * this.popScaling);
	this.Military.popForEmbassy = Math.floor(this.Military.popForEmbassy * this.popScaling);

	this.Economy.popPhase2 = Math.floor(this.Economy.popPhase2 * this.popScaling);
	this.Economy.popForGerousia = Math.floor(this.Economy.popForGerousia * this.popScaling);
	this.Economy.workPhase3 = Math.floor(this.Economy.workPhase3 * this.popScaling);
	this.Economy.workPhase4 = Math.floor(this.Economy.workPhase4 * this.popScaling);
	this.Economy.targetNumTraders = Math.round(this.Economy.targetNumTraders * this.popScaling);
	this.Economy.targetNumWorkers = Math.floor(this.Economy.targetNumWorkers * this.popScaling);
	this.Economy.workPhase3 = Math.min(this.Economy.workPhase3, this.Economy.targetNumWorkers);
	this.Economy.workPhase4 = Math.min(this.Economy.workPhase4, this.Economy.targetNumWorkers);
	if (this.difficulty < PETRA_EXPERT.DIFFICULTY_EASY)
		this.Economy.workPhase3 = Infinity;	// prevent the phasing to city phase

	this.emergencyValues = {
		"population": this.criticalPopulationFactors[this.difficulty],
		"structures": this.criticalStructureFactors[this.difficulty],
		"roots": this.criticalRootFactors[this.difficulty],
	};

	this.Cheat(gameState);

	if (this.debug < 2)
		return;
	API3.warn(" >>>  Petra Expert bot: personality = " + uneval(this.personality));
};

PETRA_EXPERT.Config.prototype.Cheat = function(gameState)
{
	// Sandbox, Very Easy, Easy, Medium, Hard, Very Hard
	// rate apply on resource stockpiling as gathering and trading
	// time apply on building, upgrading, packing, training and technologies
	const rate = [ 0.42, 0.56, 0.75, 1.00, 1.25, 1.56 ];
	const time = [ 1.40, 1.25, 1.10, 1.00, 1.00, 1.00 ];
	const AIDiff = Math.min(this.difficulty, rate.length - 1);
	SimEngine.QueryInterface(Sim.SYSTEM_ENTITY, Sim.IID_ModifiersManager).AddModifiers("AI Bonus", {
		"ResourceGatherer/BaseSpeed": [{ "affects": ["Unit", "Structure"], "multiply": rate[AIDiff] }],
		"Trader/GainMultiplier": [{ "affects": ["Unit", "Structure"], "multiply": rate[AIDiff] }],
		"Cost/BuildTime": [{ "affects": ["Unit", "Structure"], "multiply": time[AIDiff] }],
	}, gameState.playerData.entity);
};

PETRA_EXPERT.Config.prototype.Serialize = function()
{
	var data = {};
	for (let key in this)
		if (this.hasOwnProperty(key) && key != "debug")
			data[key] = this[key];
	return data;
};

PETRA_EXPERT.Config.prototype.Deserialize = function(data)
{
	for (let key in data)
		this[key] = data[key];
};
