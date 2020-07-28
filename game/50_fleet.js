/*
	@class
	@description - флот
	@params {Object} options
	@params {Array} options.shipData - массив с информацией обо всех кораблях на поле
	@params {Function} options.onDestroy - callback, который будет вызван в случае разрушения всего флота
*/
App.Fleet = function(options) {
	this.shipsData = options.shipsData;
	this.onDestroy = _.defaultTo(options.onDestroy, function() {});
	this.ships;
	this.onShipDestroy = this.onShipDestroy.bind(this);
	this.isAlive = true;
}

/*
	@method
	@description - передается конкретному кораблю и вызывается в момент разушения этого корабля
	@returns {undefined}
*/
App.Fleet.prototype.onShipDestroy = function() {
	this.checkLifeStatus();
}

/*
	@method
	@description - находит в структуре флота корабль по id
	@params {(String|Number)} shipId
	@returns {Object}
*/
App.Fleet.prototype.findShip = function(shipId) {
	return _.find(this.ships, ["id", shipId]);	
}

/*
	@method
	@description - проверят жизненный статус флота (флот считается уничтоженным, если статус всех кораблей
	ship.isAlive === false)
	@returns {undefined}
*/
App.Fleet.prototype.checkLifeStatus = function() {
	var isDead = this.ships.every(function(ship) {
		return ship.isAlive === false;
	});
	if(isDead) {
		this.isAlive = false;
		this.onDestroy();
	}	
}

/*
	@method
	@description - удар по одному из кораблей
	@params {(Number|String)} shipId
	@param {Number} rowIndex - индекс ряда, в котором находится точка
	@param {Number} pointIndex - местоположение точки в контексте ряда
	@returns {undefined}
*/
App.Fleet.prototype.hit = function(shipId, rowIndex, pointIndex) {
	var targetShip = this.findShip(shipId);
	targetShip.hit(rowIndex, pointIndex);
}

/*
	@method
	@description - инициирует все корабли на основе информации, переданной
	в options.shipsData
	@returns {undefined}
*/
App.Fleet.prototype.init = function() {
	this.ships = this.shipsData.reduce(function(accumulator, currentValue) {
		if(currentValue.points) {
			var shipInstance = new App.Ship({
				type: currentValue.type,
				id: currentValue.id,
				points: currentValue.points,
				onDestroy: this.onShipDestroy
			}).init();
			return accumulator.concat([shipInstance]);
		} else {
			/*
				на поле не нашлось свободных точек, инициация корабля невозможна
			*/
			console.warn("Ship "+currentValue.id+" of type "+currentValue.type+" was not placed on field");	
			return accumulator;
		}
	}.bind(this), []);
	return this;
}

