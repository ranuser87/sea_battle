/*
	@class
	@description - описывает выстрел по игровому полю
	@params {Object} options
	@params {Boolean} options.success - был выстрел удачным или нет
*/
App.Shot = function(options) {
	this.success = options.success;
}