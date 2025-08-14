import './style.css'
import { GameView } from './game/views/GameView';
import { FieldView } from './game/views/FieldView';
import { Ball } from './game/Ball';
import { BallView } from './game/views/BallView';
import { Player } from './game/Player';
import { PlayerView } from './game/views/PlayerView';
import * as CONST from './game/constants';
import { HumanController } from './game/controllers/HumanController';

class Game {
    private gameView: GameView;
    private fieldView: FieldView;
    private ball: Ball;
    private ballView: BallView;
    private player1: Player;
    private player1View: PlayerView;
    private player2: Player;
    private player2View: PlayerView;


    constructor() {
        const container = document.getElementById('app');
        if (!container) {
            throw new Error('Container #app not found');
        }

        this.gameView = new GameView(container);

        this.fieldView = new FieldView();
        this.fieldView.addToScene(this.gameView.scene);

        this.ball = new Ball();
        this.ball.position.set(0, -1.0, 1.5); // Start high and in front of player
        this.ballView = new BallView(this.ball);
        this.ballView.addToScene(this.gameView.scene);

        this.player1 = new Player(1);
        this.player1.controller = new HumanController();
        this.player1View = new PlayerView(this.player1);
        this.player1View.addToScene(this.gameView.scene);

        this.player2 = new Player(-1);
        this.player2View = new PlayerView(this.player2);
        this.player2View.addToScene(this.gameView.scene);

        this.setupCamera();
    }

    private setupCamera() {
        this.gameView.camera.position.set(0, -4, 3);
        this.gameView.camera.lookAt(0, 0, 0);
    }

    public start() {
        // A simple serve to get the ball moving
        this.ball.status = 6; // Toss status for player 1
        this.player1.swingType = CONST.SERVE_NORMAL;
        this.ball.toss(2.5);

        this.animate();
    }

    private animate() {
        requestAnimationFrame(this.animate.bind(this));

        // Update logic
        this.player1.move(this.ball);
        this.player2.move(this.ball);
        this.ball.move();

        // Update views
        this.ballView.update();
        this.player1View.update();
        this.player2View.update();

        // Render scene
        this.gameView.update();
    }
}

const game = new Game();
game.start();
