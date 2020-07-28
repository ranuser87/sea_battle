/*
	@class
	@description - игровое поле
	@params {Object} options
	@params {Number} options.size - размер одной из сторон игрового поля (поле квадратное)
	@params {Object} options.$node - jQuery-объект данного поля
	@params {Boolean} options.developerMode - все корабли изначально видны, если включен
	@params {Function} options.onLuckyStrike - callback, который будет вызван в случае попадания по кораблю
	@params {Function} options.onBadStrike - callback, который будет вызван в случае попадания мимо цели
	@returns {object}
*/
App.Field = function(options) {
	this.size = options.size;
	this.$node = options.$node;
	this.developerMode = options.developerMode;
	this.onLuckyStrike = _.defaultTo(options.onLuckyStrike, function() {});
	this.onBadStrike = _.defaultTo(options.onBadStrike, function() {});
	this.structure = [];
	this.clickHandler = this.clickHandler.bind(this);
}

/*
	@method
	@description - возвращает все незанятые точки на поле (point.isFree === true)
	@returns {Array}
*/
App.Field.prototype.getFreePoints = function() {
	var flatStructure = _.flatten(this.structure);
	return _.filter(flatStructure, ["isFree", true]);	
}

/*
	@method
	@description - возвращает случайную незанятую точку (point.isFree === true),
	или undefined, если свободных не осталось
	@returns {(Object|undefined)}
*/
App.Field.prototype.getRandomFreePoint = function() {
	var freePoints = this.getFreePoints();
	if(freePoints.length > 0) {
		var randomIndex = _.random(0, freePoints.length - 1);
		return freePoints[randomIndex];
	}
}

/*
	@method
	@description - возвращает линию (последовательность незанятых точек по горизонтали или вертикали)
	или null, если пролучить линию не удалось
	@params {Object} point - стартовая точка, от которой откладываются все остальные
	@params {Number} lineSize - длина линии
	@returns {(Array|null)}
*/
App.Field.prototype.getFreeLine = function(point, lineSize) {
	var directions = [App.Point.north, App.Point.east, App.Point.south, App.Point.west];
	/*
		проверяем только основные части света, так как корабль не может
		располагаться по диагонали
	*/
	for(var i = 0; i < directions.length; i++) {
		var direction = directions[i];
		var freePoints = point.getFreePointsFrom(this.structure, direction);
		if(lineSize <= freePoints.length) {
			var targetSiblings = freePoints.slice(0, lineSize);
			targetSiblings.forEach(function(point) {
				point.occupy(this.structure);
			}, this);
			return targetSiblings;
		}
	}
	return null;
}

/*
	@method
	@description - возвращает случайную линию (последовательность незанятых точек по горизонтали или вертикали)
	или null, если пролучить линию не удалось
	@params {Number} lineSize - длина линии
	@returns {(Array|null)}
*/
App.Field.prototype.getRandomFreeLine = function(lineSize) {
	var randomFreePoint = this.getRandomFreePoint();
	if(randomFreePoint) {
		var line = this.getFreeLine(randomFreePoint, lineSize);
		var counter = 0;
		while(!line) {
			if(counter > App.Field.maxAttempts) {
				break;
				/*
					линию не удается получить даже после череды попыток, уходим
				*/
			}
			randomFreePoint = this.getRandomFreePoint();
			line = this.getFreeLine(randomFreePoint, lineSize);
			counter++;
		}
		return line;
	} else {
		return null;
	}
}

/*
	@method
	@description - обработчик клика по точкам поля
	@params {Object}
	@returns {undefined}
*/
App.Field.prototype.clickHandler = function(e) {
	var $target = $(e.currentTarget);
	if($target.attr(App.Point.statusAttr) === App.Point.untouched) {
		var rowIndex = parseInt($target.attr(App.Point.rowIndexAttr));
		var pointIndex = parseInt($target.attr(App.Point.selfIndexAttr));
		if($target.attr(App.Point.shipIdAttr)) {
			this.onLuckyStrike({
				shipId: $target.attr(App.Point.shipIdAttr),
				rowIndex: rowIndex,
				pointIndex: pointIndex
			});
		} else {
			var point = this.structure[rowIndex][pointIndex];
			point.setStatus(App.Point.holey);
			this.onBadStrike();
		}
	}
}

/*
	@method
	@description - создает и записывает в объект матричный массив с экземплярами App.Point
	@returns {Object}
*/
App.Field.prototype.init = function() {
	var squareArea = this.size * this.size;
	var pointIndex = 0;
	var rowIndex = 0;
	for(var i = 0; i < squareArea; i++) {
		if(i%this.size === 0) {
			pointIndex = 0;
			if(i!==0) {
				rowIndex++;
			}
			this.structure.push([
				new App.Point({
					selfIndex: pointIndex,
					rowIndex: rowIndex,
					bound: this.size
				})
			]);
		} else {
			pointIndex++;
			var lastRow = this.structure[this.structure.length - 1];
			lastRow.push(new App.Point({
				selfIndex: pointIndex,
				rowIndex: rowIndex,
				bound: this.size
			}));
		}
	}
	return this;
}

/*
	@method
	@description - модифицирует внешний вид поля и удаляет обработчики события
	@returns {undefined}
*/
App.Field.prototype.destroy = function() {
	this.$node.off("click", this.clickHandler);
	this.$node.addClass(App.Field.disabled);	
}

/*
	@method
	@description - выводит поле на экран на основании содержимого this.structure
	@returns {undefined}
*/
App.Field.prototype.render = function() {
	this.$node.empty();

	var $tbody = $("<tbody></tbody>");
	this.structure.forEach(function(row) {
		var $row = $("<tr></tr>");
		row.forEach(function(point) {
			var $point = point.init().$node;
			$row.append($point);
		}, this);
		$tbody.append($row);
	}, this);
	this.$node.append($tbody);

	this.$node.on("click", App.Point.selector, this.clickHandler);

	if(this.developerMode) {
		this.$node.addClass(App.Field.uncovered);	
	}
}

App.Field.MIN_SIZE = 10;

App.Field.MAX_SIZE = 100;

App.Field.selector = ".js-game-field";

App.Field.maxAttempts = 10;

App.Field.uncovered = "game__field_uncovered";

App.Field.disabled = "game__field_disabled";