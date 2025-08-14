export class ScoreView {
    private scoreElement: HTMLElement;

    constructor() {
        const element = document.getElementById('score');
        if (!element) {
            throw new Error('Score element #score not found');
        }
        this.scoreElement = element;
        this.styleElement();
    }

    private styleElement() {
        this.scoreElement.style.position = 'absolute';
        this.scoreElement.style.top = '10px';
        this.scoreElement.style.left = '10px';
        this.scoreElement.style.color = 'white';
        this.scoreElement.style.fontFamily = 'monospace';
        this.scoreElement.style.fontSize = '24px';
        this.scoreElement.style.zIndex = '100';
    }

    public update(score1: number, score2: number) {
        this.scoreElement.innerHTML = `Player 1: ${score1} - Player 2: ${score2}`;
    }
}
