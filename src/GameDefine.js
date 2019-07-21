const GameConfig = require('./Config');

class GameDefine
{
	constructor()
	{
		this.ROW_NUM = 10;
		this.COLUMN_NUM = this.ROW_NUM;

		this.BALL_PER_SPAWN = 3;
		this.STEPS_TO_SPAWN = 2; // ball will be
		this.BALL_SIZE_ON_SUSPEND = 0.5;

		this.OUT_LINE = 0;

		this.COLOR = [0xff0000, 0xbfff00, 0x0080ff];

		this.TIME_PER_TURN = 10;

		this.BALL_IDLE_SPEED = 0.4;
		this.BALL_SPAWN_SPEED = 0.4;
		this.BALL_CHOSEN_SPEED = 0.4;
		this.BALL_EXPLODE_SPEED = 0.2;
		this.BALL_MOVE_SPEED = 2.0;
	}
}
module.exports = new GameDefine();