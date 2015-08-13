
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
			//two adjacent tiles owned by player
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
					tile.setPiece(player);
					moves.push({
						action: ACTIONS.PLACE,
						x: tile.getX(),
						y: tile.getY()
					});
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
//the board is actually 2px larger than BOARD_SIZE in each direction to account for tile borders.

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

var game = {
	board: new Array(BOARD_DIMENSIONS),
	turnCount: 0,
	phase: PHASES.START,
	phaseInvalid: false
};

var boardGraphics = new Array(BOARD_DIMENSIONS);
for(var i=0; i<BOARD_DIMENSIONS; i++){
	game.board[i] = new Array(BOARD_DIMENSIONS);
	boardGraphics[i] = new Array(BOARD_DIMENSIONS);
}

var moves;

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
			var tile = new Tile(i,j);
			game.board[i][j] = tile;
			boardGraphics[i][j] = new TileGraphics(i,j,tile);
		}
	}
	
	turnIndicator = new createjs.Shape();
	turnText = new createjs.Text("","32px Arial", "black");
	turnText.x = TILE_SIZE*9/10;
	turnText.y = TILE_SIZE/2-16;
	
	var turnIndicatorContainer = new createjs.Container();
	turnIndicatorContainer.addChild(turnIndicator, turnText);
	
	turnIndicatorContainer.x = BOARD_SIZE*7/6;
	turnIndicatorContainer.y = TILE_SIZE;
	
	errorText = new createjs.Text("","24px Arial", "black");
	errorText.x = BOARD_SIZE*7/6 + TILE_SIZE/5;
	errorText.y = TILE_SIZE*5/2-12;
	errorText.lineHeight = 30;
	errorText.lineWidth = 350;
	
	stage.addChild(turnIndicatorContainer, errorText);
	
	game.phase = PHASES.START;
	resetGame(game);
	startNextPhase();
	
	updateBoardGraphics();
});

function updateBoardGraphics() {
	for (var i=0; i<BOARD_DIMENSIONS; i++)
		for (var j=0; j<BOARD_DIMENSIONS; j++) {
			boardGraphics[i][j].update();
		}
	
	stage.update();
}

function Tile(x, y) {
	this.x = x;
	this.y = y;
	
	this.controller = PLAYERS.N;
	this.piece = PLAYERS.N;
	this.selected = false;
}
Tile.prototype.getX = function() { return this.x; };
Tile.prototype.getY = function() { return this.y; };
Tile.prototype.setPiece = function(player) {
	this.piece = player;
	if(player != PLAYERS.N) {
		this.controller = player;
	}
};
Tile.prototype.getPiece = function() {
	return this.piece;
};
Tile.prototype.setController = function(controller) {
	this.controller = controller;
};
Tile.prototype.getController = function() {
	return this.controller;
};
Tile.prototype.select = function() {
	this.selected = true;
	selectedTile = this; //TODO: this is ugly. make selectedTile a property of board/game
};
Tile.prototype.deselect = function() {
	this.selected = false;
	selectedTile = null;
};
Tile.prototype.isSelected = function() {
	return this.selected;
};
Tile.prototype.isNeighbor = function(tile) {
	return Math.abs(this.x - tile.x)<=1 && Math.abs(this.y - tile.y)<=1 
};
Tile.prototype.copy = function() {
	var tile = new Tile(this.x, this.y);
	tile.piece = this.piece;
	tile.controller = this.controller;
	tile.selected = this.selected;
	return tile;
};

function TileGraphics(x, y, modelTile) {
	this.model = modelTile;
	
	this.tileShape = new createjs.Shape(N_CONTROLLED_GRAPHIC);
	this.pieceShape = new createjs.Shape(EMPTY_GRAPHIC);
	this.selectShape = new createjs.Shape(EMPTY_GRAPHIC);
	
	var container = new createjs.Container();
	container.addChild(this.tileShape, this.pieceShape, this.selectShape);
	container.x = BOARD_SIZE/BOARD_DIMENSIONS*x;
	container.y = BOARD_SIZE/BOARD_DIMENSIONS*y;
	
	container.addEventListener("click", function(e) {
		handleClick(modelTile);
	});
	
	stage.addChild(container);
}
TileGraphics.prototype.update = function() {
	var piece = this.model.getPiece();
	if (piece == PLAYERS.N) {
		this.pieceShape.graphics = EMPTY_GRAPHIC;
	} else if (piece == PLAYERS.X) {
		this.pieceShape.graphics = X_GRAPHIC;
	} else if (piece == PLAYERS.O){
		this.pieceShape.graphics = O_GRAPHIC;
	}
	
	var controller = this.model.getController();
	if (controller == PLAYERS.N) {
		this.tileShape.graphics = N_CONTROLLED_GRAPHIC;
	} if (controller == PLAYERS.X) {
		this.tileShape.graphics = X_CONTROLLED_GRAPHIC;
	} if (controller == PLAYERS.O) {
		this.tileShape.graphics = O_CONTROLLED_GRAPHIC;
	}
	
	if(this.model.isSelected()) {
		this.selectShape.graphics = SELECT_GRAPHIC;
	} else this.selectShape.graphics = EMPTY_GRAPHIC;
};

function handleClick(tile) {
	if (game.phaseInvalid) {
		moves.push({ action: null });
		startNextPhase();
	} else if(game.phase == PHASES.START) {
		resetGame(game);
		startNextPhase();
	} else if (game.phase == PHASES.X_MOVE) {
		if(movePiece(PLAYERS.X, tile, selectedTile))
			startNextPhase();
	} else if (game.phase == PHASES.X_ACTION) {
		if (doAction(game.board, ACTIONS.PLACE, PLAYERS.X, tile))
			startNextPhase();
	} else if (game.phase == PHASES.O_ACTION) {
		if (doAction(game.board, ACTIONS.PLACE, PLAYERS.O, tile))
			startNextPhase();
	} else if (game.phase == PHASES.O_MOVE) {
		if(movePiece(PLAYERS.O, tile, selectedTile))
			startNextPhase();
	}
	
	updateBoardGraphics();
}

function resetGame(game) {
	moves = [];
	game.turnCount = 0;
	game.phaseInvalid = false;
	aiTree = {};
	
	var board = game.board;
	for (var i = 0; i < BOARD_DIMENSIONS; i++)
		for (var j = 0; j < BOARD_DIMENSIONS; j++) {
			board[i][j].setPiece(PLAYERS.N);
			if(i>=1 && i<=2 && j>=1 && j<=2)//hardcode starting condition for 4x4 because reasons
				board[i][j].setController(PLAYERS.O);
			else board[i][j].setController(PLAYERS.N);
		}
}

function startNextPhase() {
	game.phaseInvalid = false;
	setErrorText("");
	
	var winner = checkWin(game.board);
	if(winner != PLAYERS.N) {
		game.phase = PHASES.START;
		
		if(winner == PLAYERS.X)
			turnIndicator.graphics = X_GRAPHIC;
		else turnIndicator.graphics = O_GRAPHIC;
		turnText.text = " wins!";
		setErrorText("Click to start a new game.");
		return;
	}
	
	if(game.phase == PHASES.LAST) game.turnCount++;
	game.phase = incrementPhase(game.phase);
	
	if(game.phase == PHASES.X_MOVE) {
		turnIndicator.graphics = X_GRAPHIC;
		turnText.text = "'s move";
		
		if(!boardHasPiece(game.board, PLAYERS.X)) {
			game.phaseInvalid = true;
			setErrorText("No pieces; click board to continue.");
		}
	} else if (game.phase == PHASES.X_ACTION) {
		turnIndicator.graphics = X_GRAPHIC;
		turnText.text = "'s action";
		
		if(game.turnCount>0 && !playerCanUseAction(game.board, ACTIONS.PLACE, PLAYERS.X)) {
			game.phaseInvalid = true;
			setErrorText("No valid action; click board to continue.");
		}
	} else if (game.phase == PHASES.O_ACTION) {
		turnIndicator.graphics = O_GRAPHIC;
		turnText.text = "'s action";
		
		if(!playerCanUseAction(game.board, ACTIONS.PLACE, PLAYERS.O)) {
			game.phaseInvalid = true;
			setErrorText("No valid action; click board to continue.");
		}
	} else if (game.phase == PHASES.O_MOVE) {
		turnIndicator.graphics = O_GRAPHIC;
		turnText.text = "'s move";
		
		if(!boardHasPiece(game.board, PLAYERS.O)) {
			game.phaseInvalid = true;
			setErrorText("No pieces; click board to continue.");
		}
	}
}

function incrementPhase(phase) {
	phase++;
	if(phase > PHASES.LAST){
		return PHASES.FIRST
	}
	else return phase;
}

function setErrorText(text) {
	errorText.text = text;
}

function movePiece(player, tile, selectedTile) {
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
			selectedTile.setPiece(PLAYERS.N);
			selectedTile.deselect();
			tile.setPiece(player);
			moves.push({
				action: "move", //TODO: turn move into an action like place
				x: tile.getX(),
				y: tile.getY(),
				fromX: selectedTile.getX(),
				fromY: selectedTile.getY()
			});
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
	var winner;
	for (var i=0; i<BOARD_DIMENSIONS; i++) {
		winner = checkWinRow(board, i);
		if (winner != PLAYERS.N)
			return winner;
		winner = checkWinCol(board, i);
		if (winner != PLAYERS.N)
			return winner;
	}
	
	winner = checkWinDiag1(board);
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


function copyGame(game) {
	return {
		board: copyBoard(game.board),
		turnCount: game.turnCount,
		phase: game.phase,
		phaseInvalid: game.phaseInvalid
	}
}

function copyBoard(board) {
	var copy = new Array(BOARD_DIMENSIONS);
	for (var i=0; i<BOARD_DIMENSIONS; i++){
		copy[i] = new Array(BOARD_DIMENSIONS);
		for (var j=0; j<BOARD_DIMENSIONS; j++) {
			copy[i][j] = board[i][j].copy();
		}
	}
	
	return copy;
}

function calculateGameInProgressScore(board, player) {
	var score = 0;
	//var winner = checkWin(board); //check for winning separately
	//if (winner == player) {
	//	return 1000000000;
	//}
	//else if (winner != PLAYERS.N) {
	//	score -= 1000000000;
	//}
	
	for(var i=0; i<BOARD_DIMENSIONS; i++)
		for(var j=0; j<BOARD_DIMENSIONS; j++) {
			var tile = board[i][j];
			
			var piece = tile.getPiece();
			if (piece == player) score += 1000;
			else if (piece != PLAYERS.N) score -= 1000;
			
			var controller = tile.getController();
			if (controller == player) score += 1;
			else if (controller != PLAYERS.N) score -= 1;
		}
	
	for(var n=0; n<BOARD_DIMENSIONS; n++) {
		score += calculateRowScore(board, player, n);
		score += calculateColScore(board, player, n);
	}
	score += calculateDiag1Score(board, player);
	score += calculateDiag2Score(board, player);
	
	return score;
}

function calculateColScore(board, player, n) {
	return calculateLineScore(player, function(i) {
		return board[n][i]
	});
}
function calculateRowScore(board, player, n) {
	return calculateLineScore(player, function(i) {
		return board[i][n]
	});
}
function calculateDiag1Score(board, player) {
	return calculateLineScore(player, function(i) {
		return board[i][i]
	});
}
function calculateDiag2Score(board, player) {
	return calculateLineScore(player, function(i) {
		return board[i][BOARD_DIMENSIONS - i - 1]
	});
}

function calculateLineScore(player, tileGetterFunction) {
	var playerPieces = 0;
	var opponentPieces = 0;
	var playerTiles = 0;
	var opponentTiles = 0;
	for(var i=0; i<BOARD_DIMENSIONS; i++) {
		var tile = tileGetterFunction(i);
		
		var piece = tile.getPiece();
		if (piece == player) playerPieces++;
		else if(piece != PLAYERS.N) opponentPieces++;
		
		var controller = tile.getController();
		if (controller == player) playerTiles++;
		else if(controller != PLAYERS.N) opponentTiles++;
	}
	return calculateLineScoreHelper(playerPieces, opponentPieces, playerTiles, opponentTiles);
}

function calculateLineScoreHelper(playerPieces, opponentPieces, playerTiles, opponentTiles) {
	if(playerPieces == opponentPieces) return 0;
	if(playerPieces < 2 && opponentPieces < 2) return 0;
	
	var score = 0;
	if(playerPieces == 3) {
		score = (opponentPieces > 0) ? 100 : 500;
	}
	if(playerPieces == 2) {
		score = (opponentPieces > 0) ? 50 : 100;
	}
	
	return score + playerTiles*10 - opponentTiles*10;
}

function findMoves(game) {
	if(game.phase == PHASES.X_MOVE) {
		return findMoveMoves(game, PLAYERS.X);
	} else if (game.phase == PHASES.X_ACTION) {
		return findActionMoves(game, ACTIONS.PLACE, PLAYERS.X);
	} else if (game.phase == PHASES.O_ACTION) {
		return findActionMoves(game, ACTIONS.PLACE, PLAYERS.O);
	} else if (game.phase == PHASES.O_MOVE) {
		return findMoveMoves(game, PLAYERS.O);
	}
}

function findMoveMoves(game, player) {
	var moves = [];
	for (var i=0; i<BOARD_DIMENSIONS; i++) {
		for (var j=0; j<BOARD_DIMENSIONS; j++) {
			if (game.board[i][j].getPiece() == player) {
				var left = makeMoveIfValid(game,i,j,i-1,j);
				if (left) moves.push(left);
				var right = makeMoveIfValid(game,i,j,i+1,j);
				if (right) moves.push(right);
				var up = makeMoveIfValid(game,i,j,i,j-1);
				if (up) moves.push(up);
				var down = makeMoveIfValid(game,i,j,i,j+1);
				if (down) moves.push(down);
			}
		}
	}
	
	if(moves.length == 0) {
		var copy = copyGame(game);
		copy.phase = incrementPhase(copy.phase);
		moves.push({
			clicks: {},
			game: copy
		});
	}
	
	return moves;
}

function makeMoveIfValid(game, x, y, xNew, yNew, player) {
	if(xNew>=0 && xNew<BOARD_DIMENSIONS && yNew>=0 && yNew<BOARD_DIMENSIONS) {
		if(game.board[xNew][yNew].getPiece() != PLAYERS.N) {
			var copy = copyGame(game);
			copy.phase = incrementPhase(copy.phase);
			movePiece(player, copy.board[x][y], copy.board[xNew][yNew]);
			return {
				clicks: {x:x, y:y, fromX:xNew, fromY:yNew},
				game: copy
			};
		}
	}
}

function findActionMoves(game, action, player) {
	var moves = [];
	
	if (action.checkCondition(game.board, player) || (game.turnCount == 0 && player==PLAYERS.X && action == ACTIONS.PLACE)) {
		var board = game.board;
		for (var i = 0; i < BOARD_DIMENSIONS; i++) {
			for (var j = 0; j < BOARD_DIMENSIONS; j++) {
				var tile = board[i][j];
				var controller = tile.getController();
				if (tile.getPiece() == PLAYERS.N && (controller == player || controller == PLAYERS.N)) {
					var copy = copyGame(game);
					copy.phase = incrementPhase(copy.phase);
					doAction(copy.board, action, player, copy.board[i][j]);
					moves.push({
						clicks: { x: i, y: j },
						game: copy
					});
				}
			}
		}
	}
	
	if(moves.length == 0) {
		var copy = copyGame(game);
		copy.phase = incrementPhase(copy.phase);
		moves.push({
			clicks: {},
			game: copy
		});
	}
	
	return moves;
}
