import { Player } from '../Player';

export interface Controller {
    /**
     * Updates the player's state based on input.
     * @param player The player to control.
     */
    update(player: Player): void;
}
