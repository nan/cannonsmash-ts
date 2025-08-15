import './style.css'
import { GameView } from './game/views/GameView';
import { FieldView } from './game/views/FieldView';
import { BallView } from './game/views/BallView';
import { PlayerView } from './game/views/PlayerView';
import { ScoreView } from './game/views/ScoreView';
import { PlayGame } from './game/PlayGame';

class Game {
    private gameView: GameView;
    private fieldView: FieldView;
    private ballView: BallView;
    private player1View: PlayerView;
    private player2View: PlayerView;
    private scoreView: ScoreView;

    private playGame: PlayGame;

    constructor() {
        const container = document.getElementById('app');
        if (!container) {
            throw new Error('Container #app not found');
        }

        // Initialize the game state manager
        this.playGame = PlayGame.getInstance();

        // Initialize the main view
        this.gameView = new GameView(container);

        // Create views for the game objects
        this.fieldView = new FieldView();
        this.fieldView.addToScene(this.gameView.scene);

        this.ballView = new BallView(this.playGame.ball);
        this.ballView.addToScene(this.gameView.scene);

        this.player1View = new PlayerView(this.playGame.player1);
        this.player1View.addToScene(this.gameView.scene);

        this.player2View = new PlayerView(this.playGame.player2);
        this.player2View.addToScene(this.gameView.scene);

        this.scoreView = new ScoreView();

        this.setupCamera();
    }

    private setupCamera() {
        // Position camera to see the player's side
        const player = this.playGame.player1;
        this.gameView.camera.position.copy(player.eye);
        this.gameView.camera.position.add(player.position);
        this.gameView.camera.lookAt(player.lookAt);
    }

    public start() {
        this.animate();
    }

    private animate() {
        requestAnimationFrame(this.animate.bind(this));

        // Update game logic
        this.playGame.update();

        // Update views to reflect model changes
        this.ballView.update();
        this.player1View.update();
        this.player2View.update();
        this.scoreView.update(this.playGame.score1, this.playGame.score2);

        // Render scene
        this.gameView.update();
    }
}

const game = new Game();
game.start();
