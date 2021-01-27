const GameBoard = (() => {
    const boardSize = 3;
    const container = document.querySelector("#container");
    const gameContainer = document.querySelector("#game-board");
    let gameBoard = [];
    let gameArray = [];

    const init = () => {

        renderBoard();
        setEvents();
        fillArray();
    }

    const fillArray = () => {
        for(let i = 0; i < boardSize; i++){
            const row = [];
            for (let j = 0; j < boardSize; j++){
                row.push('');
            }
            gameArray.push(row);
        }
        
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

        GameLogic.makeMove(cell);
    }

    const fillCell = (cell, player) => {
        cell.classList.add("taken");
        cell.appendChild(player.iconElem.cloneNode());
        cell.dataset.symbol = player.symbol;
        fillGameArray(cell.dataset.x, cell.dataset.y, player.symbol);
    }

    const fillGameArray = (x, y, symbol) => {
        gameArray[x][y] = symbol;
    }

    const getRow = (index) => {
        return gameContainer.querySelectorAll(`[data-x='${index}']`);
    }

    const getColumn = (index) => {
        return gameContainer.querySelectorAll(`[data-y='${index}']`);
    }

    const getAcross = () => {
        let diagonalOne = [];
        let diagonalTwo = []
        for(let i = 0; i < boardSize; i++){
            diagonalOne.push(gameContainer.querySelector(`[data-x='${i}'][data-y='${i}']`));
        }

        diagonalTwo.push(gameContainer.querySelector(`[data-x='2'][data-y='0']`));
        diagonalTwo.push(gameContainer.querySelector(`[data-x='1'][data-y='1']`));
        diagonalTwo.push(gameContainer.querySelector(`[data-x='0'][data-y='2']`));

        return [diagonalOne, diagonalTwo];
    }

    const getBoard = () => {
        return gameArray;
    }

    const boardFull = () => {
        return gameContainer.querySelectorAll(".cell:not(.taken)").length === 0;
    }

    const reset = () => {
        gameContainer.textContent = "";
        gameArray = [];

        init();
    }

    const getEmptyCells = () => {
        return gameContainer.querySelectorAll(".cell:not(.taken)");
    }
    

    init();

    return {getBoard, getRow, getColumn, getAcross, reset, boardFull, getEmptyCells, fillCell}
})();

const Player = (icon, isAI) => {

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

    const isComputer = () => {
        return isAI;
    }

    const makeAIMove = () => {
        //const emptyCells = GameBoard.getEmptyCells();
        //const randomNumber = Math.floor(Math.random() * (emptyCells.length - 1));  
        //const targetCell = emptyCells[randomNumber];
        
        let bestMove =  Minimax.findBestMove();

        let cell = document.querySelector(`[data-x='${bestMove.row}'][data-y='${bestMove.col}']`);

        GameBoard.fillCell(cell, getPlayer());

        return cell;
    }

    const iconElem = setIcon();

    return{getPlayer, isComputer, makeAIMove};
};

const GameLogic = (() => {
    const playerOne = Player("cross", false);
    const playerTwo = Player("circle", true);

    let currentPlayer;
    let gameOver = false;
    let boardFull = false;
    let AIthinking = false;

    const init = () => {
        currentPlayer = playerOne;
        getPlayerDisplay(currentPlayer).classList.add("active");
        displayMessage("move");
    }
    
    const makeMove = (cell) => {
        if(gameOver || AIthinking){
            return;
        }

        const player = currentPlayer.getPlayer();
        GameBoard.fillCell(cell, player);
        checkBoardState(cell.dataset.x, cell.dataset.y, player.symbol);


        if(!isgameOver()){
            changePlayer();
            if(currentPlayer.isComputer()){
                displayMessage("thinking");
                AIthinking = true;
                window.setTimeout(makeComputerMove, 1000);
            } 
        }
    }

    const makeComputerMove = () => {
        const player = currentPlayer.getPlayer();
    
        const cell = currentPlayer.makeAIMove()
        checkBoardState(cell.dataset.x, cell.dataset.y, player.symbol);
        AIthinking = false;

        if(!isgameOver()){
            changePlayer();
        }

    }

    const isgameOver = () => {
        let over = false;
        if(gameOver){
            displayMessage("victory");
            over = true;
        } else{
            if(boardFull){
                displayMessage("tie");
                over = true;
            }
        }

        return over;
    }

    displayMessage = (status) => {
        const gameMessages = {
            victory: `${currentPlayer.getPlayer().symbol} wins! Congrats.`,
            tie: `Game over. It's a tie!`,
            move: `${currentPlayer.getPlayer().symbol}, your move!`,
            thinking: `${currentPlayer.getPlayer().symbol} is thinking...`
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

        if(cellsVictorious(row, symbol)){
            gameOver = true;
            return;
        }

        if(cellsVictorious(column, symbol)){
            gameOver = true;
            return;
        }

        const rowsAcross = GameBoard.getAcross();
        rowsAcross.forEach((cells) => {

            if(cellsVictorious(cells, symbol)){
                gameOver = true;
                return;
            };
        });

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

    return{makeMove, restart, changePlayer}

})();


const Minimax = (() => {
    //Evaluation function 
    const evaluateBoard = (board) => {
        const maximizer = "circle";
        const minimizer = "cross";
        let score = 0;
        
        //evaluate rows
        for(let row = 0; row < 3; row++){
            if(board[row][0] == board[row][1] && board[row][1] == board[row][2]){
                if(board[row][0] === maximizer){
                    score = 10;
                } 

                if(board[row][0] === minimizer){
                    score = -10;
                }
            }
        }

        //evaluate columns
        for(let col = 0; col < 3; col++){
            if(board[0][col] == board[1][col] && board[1][col] == board[2][col]){
                if(board[0][col] === maximizer){
                    score = 10;
                } 

                if(board[0][col] === minimizer){
                    score = -10;
                }
            }
        }

        //evaluate diagonal
        if(board[0][0] == board[1][1] && board[1][1] == board[2][2]){
            if(board[0][0] === maximizer){
                score = 10;
            } 

            if(board[0][0] === minimizer){
                score = -10;
            }
        }

        if(board[0][2] == board[1][1] && board[1][1] == board[2][0]){
            if(board[0][2] === maximizer){
                score = 10;
            } 

            if(board[0][2] === minimizer){
                score = -10;
            }
        }

        return score;
    }

    const findBestMove = () => {
        const board = GameBoard.getBoard();

        let player  = "circle";
        let bestValue = -1000;
        let bestMove = {
            row: -1,
            col: -1
        };

        for(let i = 0; i < 3; i++){
            for (let j = 0; j < 3; j++){
                if(board[i][j] == ""){
                    board[i][j] = player;

                    let moveValue = minimax(board, 0, false);

                    board[i][j] = "";

                    if(moveValue > bestValue){
                        bestValue = moveValue;
                        bestMove.row = i;
                        bestMove.col = j;
                    }
                }
            }
        }
        return bestMove;

    }

    const boardHasMoreMoves = (board) => {
        let result = false;
        for (let i = 0; i < 3; i++){
            for (let j = 0; j < 3; j++){
                if(board[i][j] == ""){
                    result = true;
                }
            }
        };
        return result;
    }

    const minimax = (board, depth, isMaximizer) => {
        let score = evaluateBoard(board);
        let maximizer = "circle";
        let minimizer = "cross";

        if(score == 10){
            return score;
        }

        if(score == -10){
            return score;
        }

        if(!boardHasMoreMoves(board)){
            return 0;
        }

        if(isMaximizer){
            let best = -1000;
            for (let i = 0; i < 3; i++){
                for (let j = 0; j < 3; j++){
                    // Check if cell is empty

                    if (board[i][j] == ""){
                        // Make the move
                        board[i][j] = maximizer;

                        // Call minimax recursively and choose
                        // the maximum value
                        best = Math.max(best, minimax(board, depth + 1, false));

    
                        // Undo the move
                        board[i][j] = "";
                    }
                }
            }

            return best;
        } else{
            let best = 1000;
            // Traverse all cells
            for (let i = 0; i < 3; i++){
                for (let j = 0; j < 3; j++){
                    // Check if cell is empty
                    if (board[i][j] == ""){
                        // Make the move
                        board[i][j] = minimizer;
    
                        // Call minimax recursively and choose
                        // the minimum value
                        best = Math.min(best, minimax(board, depth + 1, true));
    
                        // Undo the move
                        board[i][j] = "";
                    }
                }
            }

            return best;
        }
    }

    return {findBestMove}
})();


