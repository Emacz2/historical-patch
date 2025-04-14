g_BackgroundLayerData.push(
	[
		{
			"offset": (time, width) => 30* Math.cos(0.5 * time), //you can make it move around by using a mathematical function of time for the offset parameter
			"sprite": "background-aristeia1-1",
			"tiling": true,
		},
		{
			"offset": (time, width) =>  20 *Math.cos(0.6 * time),
			"sprite": "background-aristeia1-2",
			"tiling": false,
		},
		{
			"offset": (time, width) => 50 * Math.cos(0.7 * time),
			"sprite": "background-aristeia1-3",
			"tiling": false,
		},
	]);
