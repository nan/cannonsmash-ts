import { Ball } from './Ball';
import { Player } from './Player';
import { HumanController } from './controllers/HumanController';
import { ComController } from './controllers/ComController';

export class PlayGame {
    private static instance: PlayGame;

    public player1: Player;
    public player2: Player;
    public ball: Ball;

    public servingPlayer: Player;

    private constructor() {
        this.player1 = new Player(1);
        this.player1.controller = new HumanController();

        this.player2 = new Player(-1);
        this.player2.controller = new ComController();

        this.ball = new Ball();

        // Player 1 serves first
        this.servingPlayer = this.player1;

        this.resetBall();
    }

    public static getInstance(): PlayGame {
        if (!PlayGame.instance) {
            PlayGame.instance = new PlayGame();
        }
        return PlayGame.instance;
    }

    public update() {
        this.player1.move(this.ball);
        this.player2.move(this.ball);
        this.ball.move();
    }

    public resetBall() {
        const server = this.servingPlayer;
        const serverSide = server.side;

        // Position the ball in front of the server
        // This logic is from C++ Ball::Reset
        const swingType = Player.swingTypes.get(server.swingType);
        const hitX = swingType ? swingType.hitX : 0.3;
        const hitY = swingType ? swingType.hitY : 0.0;

        if (serverSide > 0) {
            this.ball.position.x = server.position.x + hitX;
            this.ball.position.y = server.position.y + hitY;
        } else {
            this.ball.position.x = server.position.x - hitX;
            this.ball.position.y = server.position.y + hitY;
        }

        this.ball.position.z = 1.4; // A safe height above the table
        this.ball.velocity.set(0, 0, 0);
        this.ball.spin.set(0, 0);

        this.ball.status = 8; // "Until player serve" status
    }
}
