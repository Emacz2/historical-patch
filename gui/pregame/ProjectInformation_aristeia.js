/**
 * IMPORTANT: Remember to update session/top_panel/BuildLabel.xml in sync with this.
 */
g_ProjectInformation.organizationName.caption = translate("Emac2");
g_ProjectInformation.productDescription.caption = sprintf(
	"%(name)s\n(%(version)s)\n\n%(warning)s",
	{
		// Translation: Game/Mod name as displayed on lower part of the main menu seen on game start
		"name": setStringTags(
			sprintf(
				translate("%(title)s:\n%(subtitle)s"),
				{
					"title": translate("Historical rebalance"),
					"subtitle": translate("gui/pregame/ProjectInformation")
				}
			),
			{ "font": "sans-bold-16" }
		),
		"version": translate("0 A.D. Alpha XXIV"), 
		"warning": translate("Notice: This game is under development and many features have not been added yet.")
	}
);

var g_CommunityButtons = [
	{
		"caption": translate("Mod DB"),
		"tooltip": translate("Click to view Aristeia on Moddb in your web browser."),
		"size": "8 100%-108 50%-4 100%-80",
		"onPress": () => {
			openURL("https://www.moddb.com/mods/aristeia-civilization-bronze-pack");
		}
	},
	{
		"caption": translate("mod.io"),
		"tooltip": translate("Click to view Aristeia on mod.io in your web browser."),
		"size": "50%+4 100%-108 100%-8 100%-80",
		"onPress": () => {
			openURL("https://0ad.mod.io/aristeia");
		}
	},
	{
		"caption": translate("Report a Bug"),
		"tooltip": translate("Click to visit Aristeia's bugtracker to report a bug, crash, or error."),
		"size": "8 100%-72 100%-8 100%-44",
		"onPress": () => {
			openURL("https://github.com/0ADMods/aristeia/issues/");
		}
	},
	{
		"caption": translate("0 A.D. Website"),
		"tooltip": translate("Click to open play0ad.com in your web browser."),
		"size": "8 100%-36 100%-8 100%-8",
		"onPress": () => {
			openURL("https://play0ad.com/");
		}
	}
];
