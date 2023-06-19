window.onload = function () {
    let canvasWidth = 900;
    let canvasHeight = 600;
    let blockSize = 30;
    let ctx;
    let delay = 200;
    let snakee;
    let applee;
    let widthInBlocks = canvasWidth / blockSize;
    let heightInBlocks = canvasHeight / blockSize;
    let score;
    let timeout;

    init();

    function init() {
        let canvas = document.getElementById('snakeCanvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = '30px solid gray';
        ctx = canvas.getContext('2d');
        snakee = new Snake([[6, 4], [5, 4], [4, 4]], 'right');
        applee = new Apple([10, 10]);
        score = 0;
        refreshCanvas();
    }

    function refreshCanvas() {
        snakee.advance();
        if (snakee.checkcollision()) {
            gameOver();
        } else {
            if (snakee.isEatingApple(applee)) {
                score++;
                snakee.ateApple = true;
                do {
                    applee.setNewPosition();
                } while (applee.isOnSnake(snakee));
            }
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            drawScore();
            snakee.draw();
            applee.draw();
            timeout = setTimeout(refreshCanvas, delay);
        }
    }

    function gameOver() {
        clearTimeout(timeout);
        ctx.save();
        ctx.font = 'bold 70px sans-serif';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 5;
        let centreX = canvasWidth / 2;
        let centreY = canvasHeight / 2;
        ctx.strokeText('Game Over', centreX, centreY - 180);
        ctx.fillText('Game Over', centreX, centreY - 180);
        ctx.font = 'bold 30px sans-serif';
        ctx.strokeText('Appuyer sur la touche Espace pour rejouer', centreX, centreY - 120);
        ctx.fillText('Appuyer sur la touche Espace pour rejouer', centreX, centreY - 120);
        ctx.restore();
    }

    function restart() {
        snakee = new Snake([[6, 4], [5, 4], [4, 4]], 'right');
        applee = new Apple([10, 10]);
        score = 0;
        clearTimeout(timeout);
        refreshCanvas();
    }

    function drawScore() {
        ctx.save();
        ctx.font = 'bold 200px sans-serif';
        ctx.fillStyle = 'gray';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let centreX = canvasWidth / 2;
        let centreY = canvasHeight / 2;
        ctx.fillText(score.toString(), centreX, centreY);
        ctx.restore();
    }

    function drawBlock(ctx, position) {
        let x = position[0] * blockSize;
        let y = position[1] * blockSize;
        ctx.fillRect(x, y, blockSize, blockSize);
    }

    function Snake(body, direction) {
        this.body = body;
        this.direction = direction;
        this.ateApple = false;
        this.draw = function () {
            ctx.save();
            ctx.fillStyle = '#ff0000';
            for (const block of this.body) {
                drawBlock(ctx, block);
            }
            ctx.restore();
        };
        this.advance = function () {
            let nextPosition = this.body[0].slice();
            switch (this.direction) {
                case 'left':
                    nextPosition[0] -= 1;
                    break;
                case 'right':
                    nextPosition[0] += 1;
                    break;
                case 'down':
                    nextPosition[1] += 1;
                    break;
                case 'up':
                    nextPosition[1] -= 1;
                    break;
                default:
                    throw new Error('Invalid direction');
            }

            this.body.unshift(nextPosition);
            if (!this.ateApple) {
                this.body.pop();
            } else {
                this.ateApple = false;
            }
        };

        this.setDirection = function (newDirection) {
            let allowedDirection;
            switch (this.direction) {
                case 'left':
                case 'right':
                    allowedDirection = ['up', 'down'];
                    break;
                case 'down':
                case 'up':
                    allowedDirection = ['left', 'right'];
                    break;
                default:
                    throw new Error('Invalid direction');
            }
            if (allowedDirection.indexOf(newDirection) > -1) {
                this.direction = newDirection;
            }
        };

        this.checkcollision = function () {
            let wallCollision = false;
            let snakeCollision = false;
            let head = this.body[0];
            let rest = this.body.slice(1);
            let snakeX = head[0];
            let snakeY = head[1];
            let minX = 0;
            let minY = 0;
            let maxX = widthInBlocks - 1;
            let maxY = heightInBlocks - 1;
            let isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
            let isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;

            if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls) {
                wallCollision = true;
            }

            for (const segment of rest) {
                if (snakeX === segment[0] && snakeY === segment[1]) {
                    snakeCollision = true;
                }
            }

            return wallCollision || snakeCollision;
        };
        this.isEatingApple = function (appleToEat) {
            let head = this.body[0];
            return head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1];
        };
    }

    function Apple(position) {
        this.position = position;
        this.draw = function () {
            ctx.save();
            ctx.fillStyle = '#33cc33';
            ctx.beginPath();
            let radius = blockSize / 2;
            let x = this.position[0] * blockSize + radius;
            let y = this.position[1] * blockSize + radius;
            ctx.arc(x, y, radius, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.restore();
        };
        this.setNewPosition = function () {
            let newX = Math.round(Math.random() * (widthInBlocks - 1));
            let newY = Math.round(Math.random() * (heightInBlocks - 1));
            this.position = [newX, newY];
        };
        this.isOnSnake = function (snakeToCheck) {
            let isOnSnake = false;

            for (let segment of snakeToCheck.body) {
                if (this.position[0] === segment[0] && this.position[1] === segment[1]) {
                    isOnSnake = true;
                    break;
                }
            }
            return isOnSnake;
        };
    }

    document.onkeydown = function handleKeydown(e) {
        e.preventDefault();
        let key = e.key;
        let newDirection;
        switch (key) {
            case 'ArrowLeft':
                newDirection = 'left';
                break;
            case 'ArrowUp':
                newDirection = 'up';
                break;
            case 'ArrowRight':
                newDirection = 'right';
                break;
            case 'ArrowDown':
                newDirection = 'down';
                break;
            case ' ':
                restart();
                return;
            default:
                return;
        }
        snakee.setDirection(newDirection);
    };
};
