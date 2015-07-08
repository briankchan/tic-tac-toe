
var canvas;

var boardDims = 4;
var board = [[boardDims], [boardDims], [boardDims], [boardDims]]; //TODO create dynamically based on boardDims
var boardSize = 500;

var turn = "X";
var turnIndicatorX = boardSize*7/6;
var turnIndicatorY = boardSize/2-boardSize/boardDims/2;

var selected;

$(function() {
	
	canvas = new fabric.Canvas("canvas");
	canvas.selection = false;
	
	canvas.add(createBoardOutline());
	
	for (var i = 0; i < boardDims; i++)
		for (var j = 0; j < boardDims; j++) {
			var square = createBoardSquare(i, j);
			board[i][j] = square;
			canvas.add(square);
		}
	
	for (var i = 1; i < 3; i++) //hardcode starting condition for 4x4 because reasons
		for (var j = 1; j < 3; j++) {
			board[i][j].fill="pink";
		}	
	canvas.add(createXIndicator());
	
});

function createBoardOutline() {
	return new fabric.Rect({
		left: 0,
		top: 0,
		width: boardSize,
		height: boardSize,
		fill: "white",
		stroke: "gray",
		selectable: false,
		evented: false,
		hasControls: false,
		lockMovementX: true,
		lockMovementY: true,
		lockScalingX: true,
		lockScalingY: true,
		lockRotation: true
	});
}

function createXIndicator() {
	var indicator = createX(turnIndicatorX, turnIndicatorY, boardSize/boardDims);
	
	indicator.evented = true; //fml
	indicator.selectable = true;
	indicator.on("selected", function() {
		canvas.deactivateAll();
		turn = "O";
		canvas.remove(this);
		canvas.add(createOIndicator());
		if(selected) selected.deselect();
	});
	
	return indicator;
}

function createOIndicator() {
	var indicator = createO(turnIndicatorX, turnIndicatorY, boardSize/boardDims);
	
	indicator.evented = true; //this is terrible
	indicator.selectable = true;
	indicator.on("selected", function() {
		canvas.deactivateAll();
		turn = "X";
		canvas.remove(this);
		canvas.add(createXIndicator());
		if(selected) selected.deselect();
	});
	
	return indicator;
}

function createBoardSquare(x, y) {
	var rect = new fabric.Rect({
		left: boardSize*x/boardDims+1,
		top: boardSize*y/boardDims+1,
		width: boardSize/boardDims-2,
		height: boardSize/boardDims-2,
		fill: "white",
		stroke: "gray",
		borderColor: "green",
		hasControls: false,
		lockMovementX: true,
		lockMovementY: true,
		lockScalingX: true,
		lockScalingY: true,
		lockRotation: true,
		piece: ""
	});
	
	rect.on("selected", function() {
		canvas.deactivateAll();
		if(this.piece=="") {
			if(selected) {
				if (selected.piece == "X")
					this.setX();
				else this.setO();
				selected.setNone();
				selected.deselect();
			}
			else {
				if(turn=="X")
					this.setX();
				else this.setO();
			}
		}
		else {
			if(selected == this)
				this.deselect();
			else {
				if(selected) selected.deselect();
				this.select();
			}
		}
	});
	
	rect.select = function() {
		selected = this;
		this.stroke = "green";
		this.strokeWidth = 2;
	};
	
	rect.deselect = function() {
		selected = null;
		this.stroke = "gray";
		this.strokeWidth = 1;
	};
	
	rect.setX = function() {
		canvas.remove(this.pieceObj);
		this.piece = "X";
		this.pieceObj = createX(this.left, this.top, this.width);
		this.fill = "lightblue";
		canvas.add(this.pieceObj);
	};
	rect.setO = function() {
		canvas.remove(this.pieceObj);
		this.piece = "O";
		this.pieceObj = createO(this.left, this.top, this.width);
		this.fill = "pink";
		canvas.add(this.pieceObj);
	};
	rect.setNone = function() {
		this.piece = "";
		canvas.remove(this.pieceObj);
		this.pieceObj = null;
	};
	return rect;
}

function createX(x, y, size) {
	return new fabric.Group([
			new fabric.Line([x + size/5, y + size*4/5, x + size*4/5, y + size/5], {
				stroke: "darkblue",
				strokeWidth: 5
			}),
			new fabric.Line([x + size/5, y + size/5, x + size*4/5, y + size*4/5], {
				stroke: "darkblue",
				strokeWidth: 5
			})
	], {
			selectable: false,
			evented: false,
			hasControls: false,
			lockMovementX: true,
			lockMovementY: true,
			lockScalingX: true,
			lockScalingY: true,
			lockRotation: true
	});
}

function createO(x, y, size) {
	return new fabric.Circle({
		radius: size*3/10,
		left: x + size/5,
		top: y + size/5,
		fill: "transparent",
		stroke: "darkred",
		strokeWidth: 5,
		selectable: false,
		evented: false,
		hasControls: false,
		lockMovementX: true,
		lockMovementY: true,
		lockScalingX: true,
		lockScalingY: true,
		lockRotation: true
	})
}
