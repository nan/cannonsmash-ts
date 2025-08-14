import './style.css'
import { GameView } from './game/views/GameView';
import { FieldView } from './game/views/FieldView';
import { Ball } from './game/Ball';
import { BallView } from './game/views/BallView';
import { Player } from './game/Player';
import { PlayerView } from './game/views/PlayerView';
import * as CONST from './game/constants';

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
        // Set ball high above the table to make it visible for debugging
        this.ball.position.set(0, 0, 3);
        this.ballView = new BallView(this.ball);
        this.ballView.addToScene(this.gameView.scene);

        this.player1 = new Player(1);
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
        // Set a valid status for the ball so it moves, but don't toss it
        this.ball.status = 0;

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

        // Log ball's Z position for debugging
        console.log(`Ball Z: ${this.ball.position.z}`);

        // Render scene
        this.gameView.update();
    }
}

const game = new Game();
game.start();
