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
    public score1: number = 0;
    public score2: number = 0;

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

    public changeScore(ball: Ball) {
        if (ball.lastHitBy === this.player1) {
            this.score2++;
        } else if (ball.lastHitBy === this.player2) {
            this.score1++;
        } else {
            // If ball goes out of bounds without being hit (e.g., serve fault)
            // The point goes to the non-serving player
            if (this.servingPlayer === this.player1) {
                this.score2++;
            } else {
                this.score1++;
            }
        }
        console.log(`Score: ${this.score1} - ${this.score2}`);

        // Switch server for the next point
        this.servingPlayer = (this.servingPlayer === this.player1) ? this.player2 : this.player1;

        this.resetBall();
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
