window.App = {};

App.SHIPS_CONFIG = {
	"battleship": {
		type: "battleship",
		size: 4
	},
	"cruiser": {
		type: "cruiser",
		size: 3
	},
	"destroyer": {
		type: "destroyer",
		size: 2
	},
	"boat": {
		type: "boat",
		size: 1
	}
}

App.SHIPS = [
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
]