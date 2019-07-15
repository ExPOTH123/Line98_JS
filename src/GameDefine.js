const GameConfig = require('./Config');

class GameDefine
{
	constructor()
	{
		this.ROW_NUM = 10;
		this.COLUMN_NUM = 10;

		this.BALL_PER_SPAWN = 3;
		this.STEPS_TO_SPAWN = 2; // ball will be

		this.OUT_LINE = 0;

		this.COLOR = [0xff0000, 0xbfff00, 0x0080ff];
	}
}
module.exports = new GameDefine();