/*
	@class
	@description - класс, ведущий учет всех попаданий и промахов
	@params {Object} options
	@params {Function} options.onClose - callback, который будет вызван при закрытии окна со статистикой
*/
App.Statistics = function(options) {
	this.shots = [];
	this.onClose = options.onClose;
}

/*
	@method
	@description - сохраняет объект выстрела
	@returns {undefined}
*/
App.Statistics.prototype.push = function(shot) {
	this.shots.push(shot);
}

/*
	@method
	@description - вычисляет массив статистических данных на основе всех имеющихся выстрелов
	@returns {Array}
*/
App.Statistics.prototype.calc = function() {
	var totalShots = this.shots.length;
	var luckyShots = this.shots.reduce(function(summ, shot) {
		if(shot.success) {
			return ++summ;
		} else {
			return summ;
		}
	}, 0);
	var accuracy = (luckyShots * 100) / totalShots;
	var accuracyRounded = Math.round(accuracy);
	return [
		{
			title: "Количество выстрелов",
			value: totalShots
		},
		{
			title: "Попаданий в цель",
			value: luckyShots 
		},
		{
			title: "Точность",
			value: accuracyRounded + "%"
		}
	]
}

/*
	@method
	@description - выводит статистику на экран
	@returns {undefined}
*/
App.Statistics.prototype.render = function() {
	var result = this.calc();
	var output = result.reduce(function(accumulator, item, index, array) {
		var result = "";
		if(index === 0) {
			result += "Статистика \n";
		}
		result += item.title + ": " + item.value + "\n";
		if(index === array.length - 1) {
			result += "Нажмите ОК, чтобы начать заново";
		}
		return accumulator + result;
	}, "");
	alert(output);
	this.onClose();
}