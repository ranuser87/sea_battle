/*
	@class
	@description - корабль на поле
	@params {Object} options
	@params {String} options.type - "battleship", "cruiser", "destroyer", "boat"
	@params {String|Number} options.id
	@params {Array} options.points - ряд точек по горизонтали или вертикали
*/
App.Ship = function(options) {
	this.type = options.type;
	this.id = options.id;
	this.points = options.points;
	this.isAlive = true;
	this.onDestroy = _.defaultTo(options.onDestroy, function() {});
}

/*
	@method
	@description - поиск точки, соответствующей кораблю
	@param {Number} rowIndex - индекс ряда, в котором находится точка
	@param {Number} pointIndex - местоположение точки в контексте ряда
	@returns {Object} 
*/
App.Ship.prototype.findPoint = function(rowIndex, pointIndex) {
	return _.find(this.points, function(point) {
		return point.rowIndex === rowIndex && point.selfIndex === pointIndex;
	});
}

/*
	@method
	@description - проверяет жизненный статус лодки (считается убитой, если каждая
	из ее точек имеет статус point.status === "damaged")
	@returns {undefined}
*/
App.Ship.prototype.checkLifeStatus = function() {
	var isDead = this.points.every(function(point) {
		return point.status === App.Point.damaged;
	});
	if(isDead) {
		this.isAlive = false;
		this.points.forEach(function(point) {
			point.setStatus(App.Point.dead);
		});
		this.onDestroy();
	}
}

/*
	@method
	@description - удар по одной из точек, составляющих корабль
	@param {Number} rowIndex - индекс ряда, в котором находится точка
	@param {Number} pointIndex - местоположение точки в контексте ряда
	@returns {undefined}
*/
App.Ship.prototype.hit = function(rowIndex, pointIndex) {
	var targetPoint = this.findPoint(rowIndex, pointIndex);
	targetPoint.setStatus(App.Point.damaged);
	this.checkLifeStatus();
}

/*
	@method
	@description - записывает в точки, принадлежащие кораблю, информацию о корабле
	@returns {undefined}
*/
App.Ship.prototype.init = function() {
	this.points.forEach(function(point) {
		point.shipType = this.type;
		point.shipId = this.id;
	}, this);
	return this;
}

