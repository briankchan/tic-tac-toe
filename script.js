
var PLAYERS = {
	N: 0,
	X: 1,
	O: 2
};
var PHASES = {
	START: 0,
	X_MOVE: 1,
	X_ACTION: 2,
	O_ACTION: 3,
	O_MOVE: 4,
	FIRST: 1,
	LAST: 4
};
var ACTIONS = {
	PLACE: {
		checkCondition: function(player) {
			for(var i= 0; i<BOARD_DIMENSIONS; i++) {
				for(var j=0; j<BOARD_DIMENSIONS; j++) {
					var tile = board[i][j];
					if(tile.getController() == player) {
						if(i<BOARD_DIMENSIONS-1 && board[i+1][j].getController() == player)
							return true;
						if(j<BOARD_DIMENSIONS-1 && board[i][j+1].getController() == player)
							return true;
					}
					
				}
			}
			return false;
		},
		doAction: function(player, tile) {
			if((tile.getController() == player || tile.getController() == PLAYERS.N) && tile.getPiece() == PLAYERS.N){
				tile.set(player);
				return true;
			}
		}
	}
};

var BOARD_SIZE = 500; //px
var BOARD_DIMENSIONS = 4;
var TILE_SIZE = BOARD_SIZE / BOARD_DIMENSIONS;

var BOARD_GRAPHIC = new createjs.Graphics().f("white").s("black").ss(1).drawRect(-1,-1,BOARD_SIZE+2,BOARD_SIZE+2);

var N_CONTROLLED_GRAPHIC = new createjs.Graphics().f("white").s("black").drawRect(1,1,TILE_SIZE-2,TILE_SIZE-2);
var X_CONTROLLED_GRAPHIC = new createjs.Graphics().f("lightblue").s("black").drawRect(1,1,TILE_SIZE-2,TILE_SIZE-2);
var O_CONTROLLED_GRAPHIC = new createjs.Graphics().f("pink").s("black").drawRect(1,1,TILE_SIZE-2,TILE_SIZE-2);

var SELECT_GRAPHIC = new createjs.Graphics().f("transparent").s("green").ss(5).drawRect(1,1,TILE_SIZE-2,TILE_SIZE-2);

var EMPTY_GRAPHIC = new createjs.Graphics();

var X_GRAPHIC = new createjs.Graphics().f("transparent").s("darkblue").ss(5)
		.moveTo(TILE_SIZE/5,TILE_SIZE/5).lineTo(TILE_SIZE*4/5,TILE_SIZE*4/5)
		.moveTo(TILE_SIZE/5,TILE_SIZE*4/5).lineTo(TILE_SIZE*4/5,TILE_SIZE/5);
var O_GRAPHIC = new createjs.Graphics().f("transparent").s("darkred").ss(5)
		.drawCircle(TILE_SIZE/2,TILE_SIZE/2,TILE_SIZE*3/10);

var stage;

var board = new Array(BOARD_DIMENSIONS);
for(var i=0; i<BOARD_DIMENSIONS; i++){
	board[i] = new Array(BOARD_DIMENSIONS);
}
//the board is actually 2px larger than BOARD_SIZE in each direction.

var phase;
var turnCount;

var turnIndicator;
var turnText;

var selectedTile;

$(function() {
	stage = new createjs.Stage("canvas");
	stage.x = 5;
	stage.y = 5;
	
	stage.mouseEventsEnabled = true;
	
	stage.addChild(new createjs.Shape(BOARD_GRAPHIC));
	
	for (var i=0; i<BOARD_DIMENSIONS; i++) {
		for (var j=0; j<BOARD_DIMENSIONS; j++) {
			board[i][j] = new Tile(i,j);
		}
	}
	
	
	for (var i = 1; i < 3; i++) //hardcode starting condition for 4x4 because reasons
		for (var j = 1; j < 3; j++) {
			board[i][j].setOControl();
		}
	//canvas.add(createXIndicator());
	
	phase = PHASES.X_MOVE;
	turnCount = 0;
	
	turnIndicator = new createjs.Shape(X_GRAPHIC);
	turnText = new createjs.Text("move","32px Arial", "black");
	turnText.x = BOARD_SIZE/BOARD_DIMENSIONS+8;
	turnText.y = BOARD_SIZE/BOARD_DIMENSIONS/2-16;
	
	var container = new createjs.Container();
	container.addChild(turnIndicator, turnText);
	
	container.x = BOARD_SIZE*7/6;
	container.y = BOARD_SIZE/BOARD_DIMENSIONS;
	stage.addChild(container);
	
	stage.update();
});

function Tile(x, y) {
	this.x = x;
	this.y = y;
	
	this.owner = PLAYERS.N;
	this.tileShape = new createjs.Shape(N_CONTROLLED_GRAPHIC);
	this.piece = PLAYERS.N;
	this.pieceShape = new createjs.Shape(EMPTY_GRAPHIC);
	this.selected = false;
	this.selectShape = new createjs.Shape(EMPTY_GRAPHIC);
	
	var container = new createjs.Container();
	container.addChild(this.tileShape, this.pieceShape, this.selectShape);
	container.x = BOARD_SIZE/BOARD_DIMENSIONS*x;
	container.y = BOARD_SIZE/BOARD_DIMENSIONS*y;
	
	var that = this;
	container.addEventListener("click", function(e) {
		handleClick(that);
	});
	
	stage.addChild(container);
}
Tile.prototype.set = function(player) {
	this.piece = player;
	if(player != PLAYERS.N) {
		this.owner = player;
	}
	
	this.updateStage();
};
Tile.prototype.getPiece = function() {
	return this.piece;
};
Tile.prototype.setNControl = function() {
	this.owner = PLAYERS.N;
	this.updateStage();
};
Tile.prototype.setXControl = function() {
	this.owner = PLAYERS.X;
	this.updateStage();
};
Tile.prototype.setOControl = function() {
	this.owner = PLAYERS.O;
	this.updateStage();
};
Tile.prototype.getController = function() {
	return this.owner;
};
Tile.prototype.select = function() {
	this.selected = true;
	selectedTile = this;
	this.updateStage();
};
Tile.prototype.deselect = function() {
	this.selected = false;
	selectedTile = null;
	this.updateStage();
};
Tile.prototype.updateStage = function() {
	if (this.piece == PLAYERS.N) {
		this.pieceShape.graphics = EMPTY_GRAPHIC;
	} else if (this.piece == PLAYERS.X) {
		this.pieceShape.graphics = X_GRAPHIC;
	} else if (this.piece == PLAYERS.O){
		this.pieceShape.graphics = O_GRAPHIC;
	}
	
	if (this.owner == PLAYERS.N) {
		this.tileShape.graphics = N_CONTROLLED_GRAPHIC;
	} if (this.owner == PLAYERS.X) {
		this.tileShape.graphics = X_CONTROLLED_GRAPHIC;
	} if (this.owner == PLAYERS.O) {
		this.tileShape.graphics = O_CONTROLLED_GRAPHIC;
	}
	
	if(this.selected) {
		this.selectShape.graphics = SELECT_GRAPHIC;
	} else this.selectShape.graphics = EMPTY_GRAPHIC;
	
	stage.update();
};
Tile.prototype.isNeighbor = function(tile) {
	return Math.abs(this.x - tile.x)<=1 && Math.abs(this.y - tile.y)<=1 
};

function handleClick(tile) {
	if(phase == PHASES.START) {
		for (var i = 0; i < BOARD_DIMENSIONS; i++) //hardcode starting condition for 4x4 because reasons
			for (var j = 0; j < BOARD_DIMENSIONS; j++) {
				board[i][j].set(PLAYERS.N);
				if(i>=1 && i<=2 && j>=1 && j<=2)
					board[i][j].setOControl();
				else board[i][j].setNControl();
			}
		
		turnCount = 0;
		
		incrementPhase();
	} else if (phase == PHASES.X_MOVE) {
		if(movePiece(PLAYERS.X, tile))
			incrementPhase();
	} else if (phase == PHASES.X_ACTION) {
		if (turnCount==0 || playerCanUseAction(ACTIONS.PLACE, PLAYERS.X)) {
			if (doAction(ACTIONS.PLACE, PLAYERS.X, tile))
				incrementPhase();
		} else incrementPhase();
	} else if (phase == PHASES.O_ACTION) {
		if (playerCanUseAction(ACTIONS.PLACE, PLAYERS.O)) {
			if (doAction(ACTIONS.PLACE, PLAYERS.O, tile))
				incrementPhase();
		} else incrementPhase();
	} else if (phase == PHASES.O_MOVE) {
		if(movePiece(PLAYERS.O, tile))
			incrementPhase();
	}
}

function incrementPhase() {
	phase++;
	if(phase > PHASES.LAST) {
		phase = PHASES.FIRST;
		turnCount++;
	}
	
	if(phase == PHASES.X_MOVE) {
		turnIndicator.graphics = X_GRAPHIC;
		turnText.text = "move";
	} else if (phase == PHASES.X_ACTION) {
		turnIndicator.graphics = X_GRAPHIC;
		turnText.text = "place";
	} else if (phase == PHASES.O_ACTION) {
		turnIndicator.graphics = O_GRAPHIC;
		turnText.text = "place";
	} else if (phase == PHASES.O_MOVE) {
		turnIndicator.graphics = O_GRAPHIC;
		turnText.text = "move";
	}
	stage.update();
}

function movePiece(player, tile) {
	if(boardHasPiece(player)) {
		if(selectedTile == null) {
			if(tile.getPiece() == player)
				tile.select();
		} else if (tile==selectedTile) {
			tile.deselect();
		} else if (tile.getPiece() == PLAYERS.N && tile.isNeighbor(selectedTile))  {
			selectedTile.set(PLAYERS.N);
			selectedTile.deselect();
			tile.set(player);
			return true;
		}
	} else {
		return true;
	}
	
	return false;
}

function boardHasPiece(player) {
	for (var i = 0; i < BOARD_DIMENSIONS; i++)
		for (var j = 0; j < BOARD_DIMENSIONS; j++) {
			if (board[i][j].getPiece() == player){
				return true;
			}
		}
	
	return false;
}

function playerCanUseAction(action, player) {
	return action.checkCondition(player);
}
function doAction(action, player, tile) {
	return action.doAction(player, tile);
}
