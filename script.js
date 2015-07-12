
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

var stage;

var boardDims = 4;
var board = new Array(boardDims);
for(var i=0; i<boardDims; i++){
	board[i] = new Array(boardDims);
}
var boardSize = 500;
//the board is actually 2px larger than boardSize in each direction.
var boardGraphic = new createjs.Graphics().f("white").s("black").ss(1).drawRect(-1,-1,boardSize+2,boardSize+2);
var nTileGraphic = new createjs.Graphics().f("white").s("black").drawRect(1,1,boardSize/boardDims-2,boardSize/boardDims-2);
var xTileGraphic = new createjs.Graphics().f("lightblue").s("black").drawRect(1,1,boardSize/boardDims-2,boardSize/boardDims-2);
var oTileGraphic = new createjs.Graphics().f("pink").s("black").drawRect(1,1,boardSize/boardDims-2,boardSize/boardDims-2);

var selectGraphic = new createjs.Graphics().f("transparent").s("green").ss(5).drawRect(1,1,boardSize/boardDims-2,boardSize/boardDims-2);

var emptyGraphic = new createjs.Graphics();
var xGraphic = new createjs.Graphics().f("transparent").s("darkblue").ss(5)
		.moveTo(boardSize/boardDims/5,boardSize/boardDims/5).lineTo(boardSize/boardDims*4/5,boardSize/boardDims*4/5)
		.moveTo(boardSize/boardDims/5,boardSize/boardDims*4/5).lineTo(boardSize/boardDims*4/5,boardSize/boardDims/5);
var oGraphic = new createjs.Graphics().f("transparent").s("darkred").ss(5)
		.drawCircle(boardSize/boardDims/2,boardSize/boardDims/2,boardSize/boardDims*2/5);

var phase;
var turnCount;

var turnIndicator;
var turnText

var selectedTile;

$(function() {
	stage = new createjs.Stage("canvas");
	stage.x = 5;
	stage.y = 5;
	
	stage.mouseEventsEnabled = true;
	
	stage.addChild(new createjs.Shape(boardGraphic));
	
	for (var i=0; i<boardDims; i++) {
		for (var j=0; j<boardDims; j++) {
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
	
	turnIndicator = new createjs.Shape(xGraphic);
	turnText = new createjs.Text("move","32px Arial", "black");
	turnText.x = boardSize/boardDims+8;
	turnText.y = boardSize/boardDims/2-16;
	
	var container = new createjs.Container();
	container.addChild(turnIndicator, turnText);
	
	container.x = boardSize*7/6;
	container.y = boardSize/boardDims;
	stage.addChild(container);
	
	stage.update();
});

function Tile(x, y) {
	this.x = x;
	this.y = y;
	
	this.owner = PLAYERS.N;
	this.tileShape = new createjs.Shape(nTileGraphic);
	this.piece = PLAYERS.N;
	this.pieceShape = new createjs.Shape(emptyGraphic);
	this.selected = false;
	this.selectShape = new createjs.Shape(emptyGraphic);
	
	var container = new createjs.Container();
	container.addChild(this.tileShape, this.pieceShape, this.selectShape);
	container.x = boardSize/boardDims*x;
	container.y = boardSize/boardDims*y;
	
	var that = this;
	container.addEventListener("click", function(e) {
		handleClick(that.x, that.y, that);
	});
	
	stage.addChild(container);
	
	this.container = container;
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
		this.pieceShape.graphics = emptyGraphic;
	} else if (this.piece == PLAYERS.X) {
		this.pieceShape.graphics = xGraphic;
	} else if (this.piece == PLAYERS.O){
		this.pieceShape.graphics = oGraphic;
	}
	
	if (this.owner == PLAYERS.N) {
		this.tileShape.graphics = nTileGraphic;
	} if (this.owner == PLAYERS.X) {
		this.tileShape.graphics = xTileGraphic;
	} if (this.owner == PLAYERS.O) {
		this.tileShape.graphics = oTileGraphic;
	}
	
	if(this.selected) {
		this.selectShape.graphics = selectGraphic;
	} else this.selectShape.graphics = emptyGraphic;
	
	stage.update();
};
Tile.prototype.isNeighbor = function(tile) {
	return Math.abs(this.x - tile.x)<=1 && Math.abs(this.y - tile.y)<=1 
};

function handleClick(x, y, tile) {
	console.log("phase", phase);
	if(phase == PHASES.START) {
		for (var i = 0; i < boardDims; i++) //hardcode starting condition for 4x4 because reasons
			for (var j = 0; j < boardDims; j++) {
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
		turnIndicator.graphics = xGraphic;
		turnText.text = "move";
	} else if (phase == PHASES.X_ACTION) {
		turnIndicator.graphics = xGraphic;
		turnText.text = "place";
	} else if (phase == PHASES.O_ACTION) {
		turnIndicator.graphics = oGraphic;
		turnText.text = "place";
	} else if (phase == PHASES.O_MOVE) {
		turnIndicator.graphics = oGraphic;
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
	for (var i = 0; i < boardDims; i++)
		for (var j = 0; j < boardDims; j++) {
			if (board[i][j].getPiece() == player){
				console.log(true);
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

var ACTIONS = {
	PLACE: {
		checkCondition: function(player) {
			for(var i= 0; i<boardDims; i++) {
				for(var j=0; j<boardDims; j++) {
					var tile = board[i][j];
					if(tile.getController() == player) {
						if(i<boardDims-1 && board[i+1][j].getController() == player)
							return true;
						if(j<boardDims-1 && board[i][j+1].getController() == player)
							return true;
					} else console.log(i,j,tile.getController())
					
				}
			}
			console.log("nope");
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


//function createXIndicator() {
//	var indicator = createX(turnIndicatorX, turnIndicatorY, boardSize/boardDims);
//	
//	indicator = new fabric.Group([indicator, new fabric.Text("move, then action", {
//		left: turnIndicatorX + boardSize/boardDims+5,
//		top: boardSize/2-15,
//		fontSize: 30,
//		fontFamily: "Arial",
//		hasControls: false,
//		lockMovementX: true,
//		lockMovementY: true,
//		lockScalingX: true,
//		lockScalingY: true,
//		lockRotation: true
//	})]);
//	
//	indicator.on("selectedTile", function() {
//		canvas.deactivateAll();
//		turn = "O";
//		canvas.remove(this);
//		canvas.add(createOIndicator());
//		if(selectedTile) selectedTile.deselect();
//	});
//	
//	return indicator;
//}
//
//function createOIndicator() {
//	var indicator = createO(turnIndicatorX, turnIndicatorY, boardSize/boardDims);
//	
//	indicator = new fabric.Group([indicator, new fabric.Text("action, then move", {
//		left: turnIndicatorX + boardSize/boardDims+5,
//		top: boardSize/2-15,
//		fontSize: 30,
//		fontFamily: "Arial",
//		hasControls: false,
//		lockMovementX: true,
//		lockMovementY: true,
//		lockScalingX: true,
//		lockScalingY: true,
//		lockRotation: true
//	})]);
//	
//	indicator.on("selectedTile", function() {
//		canvas.deactivateAll();
//		turn = "X";
//		canvas.remove(this);
//		canvas.add(createXIndicator());
//		if(selectedTile) selectedTile.deselect();
//	});
//	
//	return indicator;
//}
