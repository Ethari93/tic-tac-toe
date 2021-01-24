const GameBoard = (() => {
    const boardSize = 3;
    const gameContainer = document.querySelector("#game-board");
    let gameBoard = [];

    const init = () => {
        renderBoard();
        setEvents();
    }

    const renderBoard = () => {
        for(let i = 0; i < boardSize; i++){
            for(let j = 0; j < boardSize; j++){
                const cell = renderCell(i, j);
                gameContainer.appendChild(cell);
                gameBoard.push(cell);
            }
        }
    };

    const renderCell = (x, y) => {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.x = x;
        cell.dataset.y = y;

        return cell;
    };

    const setEvents = () => {
        gameBoard.forEach((cell) => {
            cell.addEventListener('click', () => clickCell(cell));
        })
    };

    const clickCell = (cell) => {
        if(cell.classList.contains("taken")){
            return;
        }
        cell.classList.add("taken");

        GameLogic.makeMove(cell, fillCell);
    }

    const fillCell = (cell, data) => {
        cell.appendChild(data.iconElem.cloneNode());
        cell.dataset.symbol = data.symbol;
    }

    const getRow = (index) => {
        return gameContainer.querySelectorAll(`[data-x='${index}']`);
    }

    const getColumn = (index) => {
        return gameContainer.querySelectorAll(`[data-y='${index}']`);
    }

    const getAcross = () => {
        let cells = [];
        for(let i = 0; i < boardSize; i++){
            cells.push(gameContainer.querySelector(`[data-x='${i}'][data-y='${i}']`));
        }
        return cells;
    }

    const getBoard = () => {
        return gameBoard;
    }

    const boardFull = () => {
        return gameContainer.querySelectorAll(".cell:not(.taken)").length === 0;
    }

    const reset = () => {
        gameContainer.textContent = "";
        init();
    }
    

    init();

    return {getBoard, getRow, getColumn, getAcross, reset, boardFull}
})();

const Player = (icon) => {

    const setIcon = () => {
        const iconElem = document.createElement("i");
        iconElem.classList.add("game-icon")
        if(icon == "cross"){
            iconElem.classList.add("fas", "fa-times");
        } else{
            iconElem.classList.add("far", "fa-circle");
        }
        return iconElem;
    }

    const getPlayer = () => {
        return {
            iconElem: iconElem,
            symbol: icon   
        }
    }

    const iconElem = setIcon();

    return{getPlayer};
};

const GameLogic = (() => {
    const playerOne = Player("cross");
    const playerTwo = Player("circle");
    let currentPlayer;
    let gameOver = false;
    let boardFull = false;

    const init = () => {
        currentPlayer = playerOne;
        getPlayerDisplay(currentPlayer).classList.add("active");
        displayMessage("move");
    }
    
    const makeMove = (cell, fillCell) => {
        if(!gameOver){
            const player = currentPlayer.getPlayer();
            fillCell(cell, player);
            checkBoardState(cell.dataset.x, cell.dataset.y, player.symbol);
            if(gameOver){
                displayMessage("victory");
            } else{
                if(boardFull){
                    displayMessage("tie");
                } else{
                    changePlayer();
                }
            }
        }
    }

    displayMessage = (status) => {
        const gameMessages = {
            victory: `${currentPlayer.getPlayer().symbol} wins! Congrats.`,
            tie: `Game over. It's a tie!`,
            move: `${currentPlayer.getPlayer().symbol}, your move!`
        }
    
        const display = document.querySelector(".game-status");
        display.textContent = gameMessages[status];
    }

    const changePlayer = () => {
        getPlayerDisplay(currentPlayer).classList.remove("active");
        currentPlayer === playerOne ? currentPlayer = playerTwo : currentPlayer = playerOne;
        getPlayerDisplay(currentPlayer).classList.add("active");
        displayMessage("move");
    }

    const getPlayerDisplay = (player) => {
        return document.querySelector(`#player_${player.getPlayer().symbol}`);
    }

    const checkBoardState = (x, y, symbol) => {
        const row = GameBoard.getRow(x);
        const column = GameBoard.getColumn(y);

        if(!cellsVictorious(row, symbol)){
            if(!cellsVictorious(column, symbol)){
                if(x === y){
                    const across = GameBoard.getAcross();
                    if(cellsVictorious(across, symbol)){
                        gameOver = true;
                    }
                }
            } else{
                gameOver = true;
            }
        } else{
            gameOver = true;
        }

        boardFull = GameBoard.boardFull();
    }

    const cellsVictorious = (cells, symbol) => {
        let victory = true;
        for(let cell of cells){
            const currentSymbol = cell.dataset.symbol;
            if (currentSymbol !== symbol){
                victory = false;
                break;
            }
        };
        return victory;
    }

    const restart = () => {
        getPlayerDisplay(currentPlayer).classList.remove("active");
        currentPlayer = playerOne;
        getPlayerDisplay(currentPlayer).classList.add("active");

        gameOver = false;
        boardFull = false;
        GameBoard.reset();
    }

    init();

    return{makeMove, restart}

})();


