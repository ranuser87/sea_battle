/*
	@class
	@description - точка на поле
	@param {number} options.selfIndex - местоположение точки в контексте ряда
	@param {number} options.rowIndex - индекс ряда, в котором находится точка
	@param {number} options.bound - длина ряда
	@returns {object}
*/
App.Point = function(options) {
	this.selfIndex = options.selfIndex;
	this.rowIndex = options.rowIndex;
	this.bound = options.bound;
	this.isFree = true;
	this.shipType;
	this.shipId;
	this.status;
	this.$node;
	this.status = App.Point.untouched;

	this.detectSiblings();
}

/*
	@method
	@description - вычисяет и записывает в объект координаты всех соседних точек
	@returns {undefined}
*/
App.Point.prototype.detectSiblings = function() {
	var prevRow = this.rowIndex - 1;
	var nextRow = this.rowIndex + 1;
	if(prevRow >= 0) {
		this[App.Point.north] = [prevRow, this.selfIndex];
	}
	if(nextRow < this.bound) {
		this[App.Point.south] = [nextRow, this.selfIndex];
	}

	var prevPoint = this.selfIndex - 1;
	var nextPoint = this.selfIndex + 1;
	if(prevPoint >= 0) {
		this[App.Point.west] = [this.rowIndex, prevPoint];
	}
	if(nextPoint < this.bound) {
		this[App.Point.east] = [this.rowIndex, nextPoint];
	}

	if(this.north && this.east) {
		this[App.Point.northEast] = [prevRow, this.selfIndex + 1];
	}

	if(this.south && this.east) {
		this[App.Point.southEast] = [nextRow, this.selfIndex + 1];
	}

	if(this.south && this.west) {
		this[App.Point.southWest] = [nextRow, this.selfIndex - 1];
	}

	if(this.north && this.west) {
		this[App.Point.northWest] = [prevRow, this.selfIndex - 1];
	}
}

/*
	@method
	@description - возвращает соседнюю точку, находящуюся в направлении {direction} от данной
	@param {Array} structure - матричный массив, содержащий все точки
	@param {String} direction - одна из сторон света: "north", "northEast", "east", "southEast", "south", "southWest", "west", "northWest"
	@returns {(Object|null)}
*/
App.Point.prototype.getSiblingFrom = function(structure, direction) {
	var result = null;
	if(this[direction]) {
		var siblingCoords = this[direction];
		var siblingRowIndex = siblingCoords[0];
		var siblingSelfIndex = siblingCoords[1];
		result = structure[siblingRowIndex][siblingSelfIndex];
	}
	return result;
}

/*
	@method
	@description - возвращает все соседние точки относительно данной (минимум - 3, если точка в углу, максимум - 8)
	@param {Array} structure - матричный массив, содержащий все точки
	@returns {Array}
*/
App.Point.prototype.getEnvironment = function(structure) {
	var result = [];
	var directions = [App.Point.north, App.Point.northEast, App.Point.east, App.Point.southEast, App.Point.south, App.Point.southWest, App.Point.west, App.Point.northWest];
	directions.forEach(function(direction) {
		var sibling = this.getSiblingFrom(structure, direction);
		if(sibling) {
			result.push(sibling)
		} 
	}, this);
	return result;
}

/*
	@method
	@description - собирает в массив точки, находящиеся в направлении {direction} от данной точки
	до тех пор, пока эти точки имеют статус isFree === true
	@param {Array} structure - матричный массив, содержащий все точки
	@param {String} direction - одна из сторон света: "north", "northEast", "east", "southEast", "south", "southWest", "west", "northWest"
	@returns {Array}
*/
App.Point.prototype.getFreePointsFrom = function(structure, direction) {
	var result = [];
	var sibling = this.getSiblingFrom(structure, direction);
	while(sibling && sibling.isFree) {
		result.push(sibling);
		sibling = sibling.getSiblingFrom(structure, direction)
	}
	return result;
}

/*
	@method
	@description - помечает данную точку, а также ее соседние точки как занятые (isFree === true).
	Соседние точки нужны постольку, поскольку корабли не должны соприкасаться сторонами/углами
	@param {Array} structure - матричный массив, содержащий все точки
	@returns {undefined}
*/
App.Point.prototype.occupy = function(structure) {
	this.isFree = false;
	this.getEnvironment(structure).forEach(function(nearestPoint) {
		nearestPoint.isFree = false;
	});
}

/*
	@method
	@description - устанавливает значение аттрибута data-status у DOM-элемента,
	который соответствует данной точке.
	@param {String} status - "untouched", "holey", "damaged", "dead"
	@returns {undefined}
*/
App.Point.prototype.setStatus = function(status) {
	this.status = status;
	this.$node.attr(App.Point.statusAttr, status);
}

/*
	@method
	@description - создает и записывает в объект jQuery-представление данной точки
	@returns {Object}
*/
App.Point.prototype.init = function() {
	var pointProps = {};
	pointProps["class"] = App.Point.cssClass+" "+App.Point.selectorAsClass;
	pointProps[App.Point.selfIndexAttr] = this.selfIndex;
	pointProps[App.Point.rowIndexAttr] = this.rowIndex;
	pointProps[App.Point.shipTypeAttr] = this.shipType;
	pointProps[App.Point.shipIdAttr] = this.shipId;
	pointProps[App.Point.freeAttr] = this.isFree;
	pointProps[App.Point.statusAttr] = this.status;

	var $point = $("<td></td", pointProps);
	this.$node = $point;
	return this;
}

App.Point.freeAttr = "data-free";

App.Point.statusAttr = "data-status";

App.Point.selfIndexAttr = "data-self-index";

App.Point.rowIndexAttr = "data-row-index";

App.Point.shipTypeAttr = "data-ship-type";

App.Point.shipIdAttr = "data-ship-id";

App.Point.damaged = "damaged";

App.Point.holey = "holey";

App.Point.untouched = "untouched";

App.Point.dead = "dead";

App.Point.north = "north";

App.Point.northEast = "northEast";

App.Point.east = "east";

App.Point.southEast = "southEast";

App.Point.south = "south";

App.Point.southWest = "southWest";

App.Point.west = "west";

App.Point.northWest = "northWest";

App.Point.selector = ".js-game-point";

App.Point.cssClass = "game__point";

App.Point.selectorAsClass = "js-game-point";