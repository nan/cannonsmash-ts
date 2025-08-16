import { Player } from '../Player';
import { Ball } from '../Ball';

export interface Controller {
    /**
     * Updates the player's state based on input.
     * @param player The player to control.
     */
    update(player: Player, ball: Ball): void;
}
