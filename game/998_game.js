/*
	@class
	@description - центральный класс, обеспечивающий взаимодействие всей системы
	@params {Object} options
	@params {Number} options.size - размер стороны игрового поля (поле квадратное)
	@params {Object} options.$node - jQuery-объект для отображения игры
	@params {Array} options.ships - информация обо всех кораблях на поле
	@params {Boolean} options.developerMode - все корабли изначально видны, если включен
*/
App.Game = function(options) {
	this.options = _.defaultTo(options, {});
	this.size = this.validateSize(options.size);
	this.$node = _.defaultTo(this.options.$node, $([]));
	this.ships = this.validateShips(this.options.ships);
	this.developerMode = !!this.options.developerMode;
	this.field;
	this.fleet;
	this.statistics;
	this.onLuckyStrike = this.onLuckyStrike.bind(this);
	this.onBadStrike = this.onBadStrike.bind(this);
	this.onFleetDestroy = this.onFleetDestroy.bind(this);
	this.onStatisticsClosed = this.onStatisticsClosed.bind(this);
	this.initiated = false;
}

/*
	@method
	@description - валидирует данные о размере игрового поля, при их некорректности возвращает
	значения по умолчанию
	@params {*} userData - размер стороны игрового поля
	@returns {Number}
*/
App.Game.prototype.validateSize = function(userData) {
	if(!_.isNumber(userData)) {
		console.warn("Field size should be of type Number, default size is used instead");
		return App.Field.MIN_SIZE;
	}

	if(userData < App.Field.MIN_SIZE) {
		console.warn("Field size should be greater or equal to " + App.Field.MIN_SIZE + ", default size is used instead");
		return App.Field.MIN_SIZE;
	}

	if(userData > App.Field.MAX_SIZE) {
		console.warn("Field size should be less or equal to " + App.Field.MAX_SIZE + ", default size is used instead");
		return App.Field.MAX_SIZE;
	}

	return userData;
}

/*
	@method
	@description - валидирует данные о кораблях на поле, 
	при их некорректности возвращает значения по умолчанию
	@params {*} userData
	@returns {Array}
*/
App.Game.prototype.validateShips = function(userData) {
	if(_.isArray(userData)) {
		var ids = [];
		var checkedUserData = userData.reduce(function(accumulator, currentValue) {
			if(!_.isObject(currentValue)) {
				console.warn("Ship should be described with plain object, containing type and id");
				return accumulator;				
			}

			if(!currentValue.id) {
				console.warn("Ship without id was skipped");
				return accumulator;	
			}

			if(!_.isNumber(currentValue.id) && !_.isString(currentValue.id)) {
				console.warn("Ship with incorrect id was skipped");
				return accumulator;	
			}

			if(ids.indexOf(currentValue.id) !== -1) {
				console.warn("Ship with duplicate id was skipped");
				return accumulator;	
			}

			ids.push(currentValue.id);

			if(!currentValue.type) {
				console.warn("Ship without type was skipped");
				return accumulator;
			}

			if(!App.SHIPS_CONFIG[currentValue.type]) {
				console.warn("Ship of type " + currentValue.type + " was skipped. See supported types in App.SHIPS_CONFIG.");
				return accumulator;	
			}

			return accumulator.concat([currentValue]);
		}, []);
		if(checkedUserData.length > 0) {
			return checkedUserData;
		} else {
			console.warn("Options.ships contains wrong data, default ships configuration is used instead");
			return App.SHIPS;
		}
	} else {
		console.warn("Options.ships is not of type Array, default ships configuration is used instead");
		return App.SHIPS;
	}
}

/*
	@method
	@description - callback, который передается флоту и вызывается при его разрушении
	@returns {undefined}
*/
App.Game.prototype.onFleetDestroy = function() {
	this.field.destroy();
	setTimeout(function() {
		this.statistics.render();
	}.bind(this), App.Game.transitionSpeed);
}

/*
	@method
	@description - callback, который передается игровому полю и вызывается в случае удачного попадания
	@params {Object} e - объект события
	@params {(String|Number)} e.shipId - id судна, по которому было осуществлено попадание
	@params {Number} e.rowIndex - индекс строки, которой принадлежит пораженная точка
	@params {Number} e.pointIndex - индекс точки, по которой был наесен удар
	@returns {undefined}
*/
App.Game.prototype.onLuckyStrike = function(e) {
	this.statistics.push(
		new App.Shot({
			success: true
		})
	)
	this.fleet.hit(e.shipId, e.rowIndex, e.pointIndex);
}

/*
	@method
	@description - callback, который передается игровому полю и вызывается в случае промаха
	@returns {undefined}
*/
App.Game.prototype.onBadStrike = function() {
	this.statistics.push(
		new App.Shot({
			success: false
		})
	)
}

/*
	@method
	@description - callback, который передается статистике и вызывается при ее закрытии
	@returns {undefined}
*/
App.Game.prototype.onStatisticsClosed = function() {
	document.location.reload(true);
}

/*
	@method
	@description - инициирует игровое поле, если находит его по селектору (иначе бросает ошибку)
	@returns {undefined}
*/
App.Game.prototype.initField = function() {
	var $field = this.$node.find(App.Field.selector);
	if($field.length > 0) {
		this.field = new App.Field({
			size: this.size,
			$node: $field,
			developerMode: this.developerMode,
			onLuckyStrike: this.onLuckyStrike,
			onBadStrike: this.onBadStrike	
		}).init();
	} else {
		throw new Error("Game requires container with class "+App.Field.selector+" to run successfully!");
	}
}

/*
	@method
	@description - инициирует флот
	@returns {undefined}
*/
App.Game.prototype.initFleet = function() {
	var shipsData = this.ships.map(function(ship) {
		var shipLength = App.SHIPS_CONFIG[ship.type].size;
		var shipBody = {
			points: this.field.getRandomFreeLine(shipLength)
		};
		return _.extend({}, ship, shipBody);
	}, this);

	this.fleet = new App.Fleet({
		shipsData: shipsData,
		onDestroy: this.onFleetDestroy
	}).init();
}

/*
	@method
	@description - инициирует статистику
	@returns {undefined}
*/
App.Game.prototype.initStatistics = function() {
	this.statistics = new App.Statistics({
		onClose: this.onStatisticsClosed
	});
}

/*
	@method
	@description - инициирует игру в целом при первом вызове, в дальнейшем возвращает instance игры
	@returns {undefined}
*/
App.Game.prototype.init = function() {
	if(!this.initiated) {
		this.initField();
		this.initFleet();
		this.initStatistics();
	
		this.field.render();
		this.initiated = true;
	}
	return this;
}

App.Game.transitionSpeed = 300;

