
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
		checkCondition: function(board, player) {
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
		doAction: function(board, player, tile) {
			if((tile.getController() == player || tile.getController() == PLAYERS.N)) {
				if (tile.getPiece() == PLAYERS.N) {
					tile.set(player);
					setErrorText("");
					return true;
				} else setErrorText("Not an empty tile.");
			} else setErrorText("Not a neutral tile or a tile you control.");
			return false;
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
var phaseInvalid;
var turnCount;

var turnIndicator;
var turnText;
var errorText;

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
	
	phase = PHASES.START;
	turnCount = 0;
	
	turnIndicator = new createjs.Shape();
	turnText = new createjs.Text("","32px Arial", "black");
	turnText.x = TILE_SIZE*9/10;
	turnText.y = TILE_SIZE/2-16;
	
	var container = new createjs.Container();
	container.addChild(turnIndicator, turnText);
	
	container.x = BOARD_SIZE*7/6;
	container.y = TILE_SIZE;
	
	errorText = new createjs.Text("","24px Arial", "black");
	errorText.x = BOARD_SIZE*7/6 + TILE_SIZE*1/5;
	errorText.y = TILE_SIZE*5/2-12;
	errorText.lineHeight = 30;
	errorText.lineWidth = 350;
	
	incrementPhase();
	
	stage.addChild(container, errorText);
	
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
	if (phaseInvalid) {
		incrementPhase();
	} else if(phase == PHASES.START) { //reset board
		resetBoard(board);
		
		turnCount = 0;
		
		incrementPhase();
	} else if (phase == PHASES.X_MOVE) {
		if(movePiece(PLAYERS.X, tile))
			incrementPhase();
	} else if (phase == PHASES.X_ACTION) {
		if (doAction(board, ACTIONS.PLACE, PLAYERS.X, tile))
			incrementPhase();
	} else if (phase == PHASES.O_ACTION) {
		if (doAction(board, ACTIONS.PLACE, PLAYERS.O, tile))
			incrementPhase();
	} else if (phase == PHASES.O_MOVE) {
		if(movePiece(PLAYERS.O, tile))
			incrementPhase();
	}
}

function resetBoard(board) {
	for (var i = 0; i < BOARD_DIMENSIONS; i++)
		for (var j = 0; j < BOARD_DIMENSIONS; j++) {
			board[i][j].set(PLAYERS.N);
			if(i>=1 && i<=2 && j>=1 && j<=2)//hardcode starting condition for 4x4 because reasons
				board[i][j].setOControl();
			else board[i][j].setNControl();
		}
}

function incrementPhase() {
	phaseInvalid = false;
	setErrorText("");
	
	var winner = checkWin(board);
	if(winner != PLAYERS.N) {
		phase = PHASES.START;
		
		if(winner == PLAYERS.X)
			turnIndicator.graphics = X_GRAPHIC;
		else turnIndicator.graphics = O_GRAPHIC;
		turnText.text = " wins!";
		setErrorText("Click to start a new game.");
		return;
	}
	
	phase++;
	if(phase > PHASES.LAST) {
		phase = PHASES.FIRST;
		turnCount++;
	}
	
	if(phase == PHASES.X_MOVE) {
		turnIndicator.graphics = X_GRAPHIC;
		turnText.text = "'s move";
		
		if(!boardHasPiece(board, PLAYERS.X)) {
			phaseInvalid = true;
			setErrorText("No pieces; click board to continue.");
		}
	} else if (phase == PHASES.X_ACTION) {
		turnIndicator.graphics = X_GRAPHIC;
		turnText.text = "'s action";
		
		if(turnCount>0 && !playerCanUseAction(board, ACTIONS.PLACE, PLAYERS.X)) {
			phaseInvalid = true;
			setErrorText("No valid action; click board to continue.");
		}
	} else if (phase == PHASES.O_ACTION) {
		turnIndicator.graphics = O_GRAPHIC;
		turnText.text = "'s action";
		
		if(!playerCanUseAction(board, ACTIONS.PLACE, PLAYERS.O)) {
			phaseInvalid = true;
			setErrorText("No valid action; click board to continue.");
		}
	} else if (phase == PHASES.O_MOVE) {
		turnIndicator.graphics = O_GRAPHIC;
		turnText.text = "'s move";
		
		if(!boardHasPiece(board, PLAYERS.O)) {
			phaseInvalid = true;
			setErrorText("No pieces; click board to continue.");
		}
	}
	stage.update();
}

function setErrorText(text) {
	errorText.text = text;
	stage.update();
}

function movePiece(player, tile) {
	if(selectedTile == null) {
		if(tile.getPiece() == player){
			tile.select();
			setErrorText("");
		} else setErrorText("Not a piece you can move.")
	} else if (tile==selectedTile) {
		tile.deselect();
		setErrorText("");
	}else if(tile.isNeighbor(selectedTile)) {
		if (tile.getPiece() == PLAYERS.N) {
			selectedTile.set(PLAYERS.N);
			selectedTile.deselect();
			tile.set(player);
			setErrorText("");
			return true;
		} else {
			setErrorText("Not an empty tile.");
		}
	} else {
		setErrorText("Not a neighboring tile.");
	}
	
	return false;
}

function boardHasPiece(board, player) {
	for (var i = 0; i < BOARD_DIMENSIONS; i++)
		for (var j = 0; j < BOARD_DIMENSIONS; j++) {
			if (board[i][j].getPiece() == player){
				return true;
			}
		}
	
	return false;
}

function playerCanUseAction(board, action, player) {
	return action.checkCondition(board, player);
}
function doAction(board, action, player, tile) {
	return action.doAction(board, player, tile);
}

function checkWin(board) {
	for (var i=0; i<BOARD_DIMENSIONS; i++) {
		var winner = checkWinRow(board, i);
		if (winner != PLAYERS.N)
			return winner;
		winner = checkWinCol(board, i);
		if (winner != PLAYERS.N)
			return winner;
	}
	
	var winner = checkWinDiag1(board);
	if (winner != PLAYERS.N)
		return winner;
	winner = checkWinDiag2(board);
	if (winner != PLAYERS.N)
		return winner;
	
	return PLAYERS.N
}
function checkWinRow(board, n) {
	var firstPiece = board[0][n].getPiece();
	if(firstPiece == PLAYERS.N)
		return PLAYERS.N;
	else {
		for(var i=1; i<BOARD_DIMENSIONS; i++)
			if (board[i][n].getPiece() != firstPiece)
				return PLAYERS.N;
	}
	return firstPiece;
}
function checkWinCol(board, n) {
	var firstPiece = board[n][0].getPiece();
	if(firstPiece == PLAYERS.N)
		return PLAYERS.N;
	else {
		for(var i=1; i<BOARD_DIMENSIONS; i++)
			if (board[n][i].getPiece() != firstPiece)
				return PLAYERS.N;
	}
	return firstPiece;
}
function checkWinDiag1(board) {
	var firstPiece = board[0][0].getPiece();
	if(firstPiece == PLAYERS.N)
		return PLAYERS.N;
	else {
		for(var i=1; i<BOARD_DIMENSIONS; i++)
			if (board[i][i].getPiece() != firstPiece)
				return PLAYERS.N;
	}
	return firstPiece;
}
function checkWinDiag2(board) {
	var firstPiece = board[0][BOARD_DIMENSIONS-1].getPiece();
	if(firstPiece == PLAYERS.N)
		return PLAYERS.N;
	else {
		for(var i=1; i<BOARD_DIMENSIONS; i++)
			if (board[i][BOARD_DIMENSIONS-1-i].getPiece() != firstPiece)
				return PLAYERS.N;
	}
	return firstPiece;
}
