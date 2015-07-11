
var PLAYERS = {
	N: 0,
	X: 1,
	O: 2
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


var turn = "X";
var turnIndicatorX = boardSize*7/6;
var turnIndicatorY = boardSize/2-boardSize/boardDims/2;

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
	
	stage.update();
	
	for (var i = 1; i < 3; i++) //hardcode starting condition for 4x4 because reasons
		for (var j = 1; j < 3; j++) {
			board[i][j].setOControl();
		}	
	//canvas.add(createXIndicator());
	
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
		if(that.piece==PLAYERS.N) {
			if(selectedTile) {
				if (selectedTile.piece == PLAYERS.X)
					that.setX();
				else that.setO();
				selectedTile.setN();
				selectedTile.deselect();
			}
			else {
				if(turn=="X") {
					that.setX();
					turn = "O"
				}
				else {
					that.setO();
					turn = "X";
				}
			}
		}
		else {
			if(selectedTile == that)
				that.deselect();
			else {
				if(selectedTile) selectedTile.deselect();
				that.select();
			}
		}
	});
	
	stage.addChild(container);
	
	this.container = container;
}
Tile.prototype.setN = function() {
	this.piece = PLAYERS.N;
	
	this.updateStage();
};
Tile.prototype.setX = function() {
	this.piece = PLAYERS.X;
	this.owner = PLAYERS.X;
	
	this.updateStage();
};
Tile.prototype.setO = function() {
	this.piece = PLAYERS.O;
	this.owner = PLAYERS.O;
	
	this.updateStage();
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
