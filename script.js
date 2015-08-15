
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
					//moves.push({
					//	action: ACTIONS.PLACE,
					//	x: tile.getX(),
					//	y: tile.getY()
					//});
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


var ai = PLAYERS.O;
var aiTree;
var aiTurn;

//var moves;

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
		if(!aiTurn || game.phase == PHASES.START) {
			handleClick(modelTile);
			setTimeout(function() {runAIIfNeeded()}, 50); //run ai in different thread
		}
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
		//moves.push({ action: null });
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

function runAIIfNeeded() {
	if(ai == PLAYERS.X && (game.phase == PHASES.X_ACTION || game.phase == PHASES.X_MOVE) ||
			ai == PLAYERS.O && (game.phase == PHASES.O_ACTION || game.phase == PHASES.O_MOVE)) {
		aiTurn = true;
		var clicks = minimax(game, ai);
		
		console.log(clicks);
		
		setTimeout(function() {makeMove(clicks[0])}, 500);
		if(clicks.length > 1)
			setTimeout(function() {makeMove(clicks[1]); aiTurn = false;}, 1000);
	}
}

function makeMove(move) {
	console.log(move);
	if(move.fromX != undefined) {
		handleClick(game.board[move.fromX][move.fromY]);
		setTimeout(function() {handleClick(game.board[move.x][move.y])}, 100);
	} else if (move.x != undefined) {
		handleClick(game.board[move.x][move.y]);
	} else {
		handleClick(game.board[0][0]);
	}
}

function resetGame(game) {
	moves = [];
	game.turnCount = 0;
	game.phaseInvalid = false;
	aiTree = {};
	aiTurn = false;
	
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
	
	if(checkDraw(game.board)) {
		game.phase = PHASES.START;
		
		turnIndicator.graphics = EMPTY_GRAPHIC;
		turnText.text = "Draw.";
		setErrorText("Click to start a new game.");
		return;
	}
	
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
		
		if(game.turnCount>0 && !playerCanUseAction(game.board, ACTIONS.PLACE, PLAYERS.O)) {
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

function prevPhase(phase) {
	phase--;
	if(phase < PHASES.FIRST){
		return PHASES.LAST
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
			//moves.push({
			//	action: "move", //TODO: turn move into an action like place
			//	x: tile.getX(),
			//	y: tile.getY(),
			//	fromX: selectedTile.getX(),
			//	fromY: selectedTile.getY()
			//});
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

function checkDraw(board) {
	for (var i=0; i<BOARD_DIMENSIONS; i++) {
		for (var j=0; j<BOARD_DIMENSIONS; j++) {
			if(board[i][j].getPiece()==PLAYERS.N)
				return false;
		}
	}
	return true;
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



function minimax(game, player) {
	var node;
	if (!aiTree.moves)
		node = {};
	else {
		var moveOne = moves[moves.length-2]; //hardcoded for current phases
		var moveTwo = moves[moves.length-1];
		
		var nodeOne = $.filter(aiTree.moves, function(node, i) {
			clicksAreEqual(moveOne, node.clicks)
		})[0];
		node =  $.filter(nodeOne.moves, function(node, i) {
			clicksAreEqual(moveTwo, node.clicks)
		})[0];
	}
	
	calculateGameScore(node, game, 6, -Infinity, Infinity, player);
	
	console.log(node);
	
	var firstMove = getRandomElement(node.bestMove);
	var secondMove = getRandomElement(firstMove.bestMove);
	
	if(secondMove) {
		aiTree[player] = secondMove;
		
		return [
			firstMove.clicks,
			secondMove.clicks
		];
	} else return [firstMove.clicks];
	
}

function getRandomElement(array) {
	if(array)
		return array[Math.floor(Math.random()*array.length)];
}

function clicksAreEqual(a, b) {
	if(a.x != undefined && a.x!=b.x) return false;
	if(a.y != undefined && a.y!=b.y) return false;
	if(a.fromX != undefined && a.fromX!=b.fromX) return false;
	if(a.fromY != undefined && a.fromY!=b.fromY) return false;
	return true;
}

function calculateGameScore(node, game, depth, alpha, beta, player) {
	var winner = checkWin(game.board);
	if (winner != PLAYERS.N) {
		if (winner == player)
			node.score = 1000000000 + depth;
		else node.score = -1000000000 - depth;
	} else if (checkDraw(game.board)) {
		node.score = 0;
	} else if (depth == 0) {
		node.score = calculateGameInProgressScore(game.board, player);
		node.moves = [];
		node.bestMove = null;
	} else {
		var children;
		
		if(node.moves && node.moves.length > 0)
			children = node.moves;
		else {
			children = findMoves(game);
			node.moves = children;
		}
		
		var phase = game.phase;
		
		var best;
		var bestMove = [];
		//maximize score on ai's turn, minimize on opponent's turn
		if (((phase == PHASES.X_ACTION || phase == PHASES.X_MOVE) && player == PLAYERS.X)
				|| ((phase == PHASES.O_ACTION || phase == PHASES.O_MOVE) && player == PLAYERS.O)) {
			best = -Infinity;
			$.each(children, function(i, child) {
				doMove(game, child.clicks);
				calculateGameScore(child, game, depth - 1, alpha, beta, player);
				undoMove(game, child.clicks, child.undo);
				if (child.score > best) {
					best = child.score;
					bestMove.length = 0;
					bestMove.push(child);
				} else if (child.score == best) {
					bestMove.push(child);
				}
				
				if(phase==PHASES.X_MOVE && player==PLAYERS.X || phase==PHASES.O_ACTION && player==PLAYERS.O) {
					alpha = Math.max(alpha, best);
					if(beta <= alpha) {
						//console.log("yay max");
						return false; //break
				}}
			});
		} else {
			best = Infinity;
			$.each(children, function(i, child) {
				doMove(game, child.clicks);
				calculateGameScore(child, game, depth - 1, alpha, beta, player);
				undoMove(game, child.clicks, child.undo);
				if (child.score < best) {
					best = child.score;
					bestMove.length = 0;
					bestMove.push(child);
				} else if (child.score == best) {
					bestMove.push(child);
				}
				
				beta = Math.min(beta, best);
				
				if(phase==PHASES.O_ACTION && player==PLAYERS.X || phase==PHASES.X_ACTION && player==PLAYERS.O) {
					if (beta <= alpha) {
						//console.log("yay min");
						return false; //break
					}
				}
			});
		}
		
		node.score = best;
		node.bestMove = bestMove;
	}
}
function gt(score,best) {return score > best}
function lt(score,best) {return score < best}

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
	
	//if(ACTIONS.PLACE.checkCondition(board, PLAYERS.X))
	//	score += (player == PLAYERS.X) ? 100000 : -100000;
	//if(ACTIONS.PLACE.checkCondition(board, PLAYERS.O))
	//	score += (player == PLAYERS.O) ? 100000 : -100000;
	
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
				for (var iOffset = -1; iOffset<=1; iOffset++) {
					for (var jOffset = -1; jOffset<=1; jOffset++) {
						if(iOffset != 0 || jOffset != moves) { //all neighboring tiles, but not this tile
							var move = makeMoveIfValid(game,i,j,i+iOffset,j+jOffset);
							if (move) moves.push(move);
						}
					}
				}
			}
		}
	}
	
	if(moves.length == 0) {
		moves.push({
			clicks: {}
		});
	}
	
	return moves;
}

function makeMoveIfValid(game, x, y, xNew, yNew) {
	if(xNew>=0 && xNew<BOARD_DIMENSIONS && yNew>=0 && yNew<BOARD_DIMENSIONS) {
		if(game.board[xNew][yNew].getPiece() == PLAYERS.N) {
			return {
				clicks: {x:xNew, y:yNew, fromX:x, fromY:y},
				undo: {controller:game.board[xNew][yNew].getController()}
			};
		}
	}
}

function findActionMoves(game, action, player) {
	var moves = [];
	
	if (action.checkCondition(game.board, player) || (game.turnCount == 0 && action == ACTIONS.PLACE)) {
		var board = game.board;
		for (var i = 0; i < BOARD_DIMENSIONS; i++) {
			for (var j = 0; j < BOARD_DIMENSIONS; j++) {
				var tile = board[i][j];
				var controller = tile.getController();
				if (tile.getPiece() == PLAYERS.N && (controller == player || controller == PLAYERS.N)) {
					moves.push({
						clicks: { x: i, y: j },
						undo: {controller:controller}
					});
				}
			}
		}
	}
	
	if(moves.length == 0) {
		moves.push({
			clicks: {}
		});
	}
	
	return moves;
}

function doMove(game, move) {
	var player = (game.phase == PHASES.X_ACTION || game.phase == PHASES.X_MOVE)
			? PLAYERS.X : PLAYERS.O;
	
	if (move.fromX!=undefined) {
		movePiece(player, game.board[move.x][move.y], game.board[move.fromX][move.fromY]);
	}else if (move.x!=undefined) {
		doAction(game.board, ACTIONS.PLACE, player, game.board[move.x][move.y]);
	}
	game.phase = incrementPhase(game.phase);
}

function undoMove(game, move, extraMoveData) {
	game.phase = prevPhase(game.phase);
	var board = game.board;
	if(move.fromX != undefined) {
		var player = (game.phase == PHASES.X_ACTION || game.phase == PHASES.X_MOVE) ? PLAYERS.X : PLAYERS.O;
		
		movePiece(player, board[move.fromX][move.fromY], board[move.x][move.y]);
		board[move.x][move.y].setController(extraMoveData.controller);
	} else if (move.x != undefined) {
		board[move.x][move.y].setPiece(PLAYERS.N);
		board[move.x][move.y].setController(extraMoveData.controller);
	}
	
}
