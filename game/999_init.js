App.gameInstance = new App.Game({
	size: 10,
	$node: $(".js-game"),
	ships: [
		{
			type: App.SHIPS_CONFIG.battleship.type,
			id: "A"
		},
		{
			type: App.SHIPS_CONFIG.cruiser.type,
			id: "B"
		},
		{
			type: App.SHIPS_CONFIG.cruiser.type,
			id: "C"
		},
		{
			type: App.SHIPS_CONFIG.destroyer.type,
			id: "D"
		},
		{
			type: App.SHIPS_CONFIG.destroyer.type,
			id: "E"
		},
		{
			type: App.SHIPS_CONFIG.destroyer.type,
			id: "F"
		},
		{
			type: App.SHIPS_CONFIG.boat.type,
			id: "G"
		},
		{
			type: App.SHIPS_CONFIG.boat.type,
			id: "H"
		},
		{
			type: App.SHIPS_CONFIG.boat.type,
			id: "I"
		},
		{
			type: App.SHIPS_CONFIG.boat.type,
			id: "J"
		}
	],
	developerMode: false
}).init();