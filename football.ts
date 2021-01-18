interface Score {
    name: string;
    score: number;
}

class Game {
    scores: Score[] = [];
    constructor(scores: Score[] = []) {
        this.scores = scores;
    }
    get numScores() {
        return this.scores.length;
    }
    get score() {
        return this.scores.length && this.scores.map(t => t.score).reduce((a, b) => a + b) || 0;
    }
    toString() {
        return `Score: ${this.score}, ScoringPlays: ${this.numScores}`;
    }
}

const scores: Score[] = [
    // { name: "safety", score: 2 },
    { name: "field goal", score: 3 },
    { name: "touchdown + miss", score: 6 },
    { name: "touchdown + xp", score: 7 },
    { name: "touchdown + 2pc", score: 8 }
];

const aggregateScores = (games: Game[]) => {
    const scores = games.map(t => t.score);
    const uniqueScores = [...Array.from(new Set(scores))].sort((a, b) => a - b);
    return uniqueScores.map(t => ({
        score: t,
        occurrences: scores.filter(s => s === t).length
    }));
}

const gamesWithNumScores = (numScores: number, game = new Game(), games: Game[] = []): Game[] => {
    if (game.numScores >= numScores) {
        games.push(game);
        return games;
    }
    for (let score of scores) {
        const newGame = new Game([...game.scores, score]);
        gamesWithNumScores(numScores, newGame, games);
    }
    return games;
}

const filterUniqueGames = (games: Game[]): Game[] => {
    const uniqueGameScores = games.reduce(
        (unique, item) => {
            // map to scores, and sort, convert to string, check for duplicates
            const orderedScores = item.scores.map(t=>t.score).sort((a,b) => a > b ? 1 : -1).join(',');
            return (unique.includes(orderedScores) ? unique : [...unique, orderedScores])
        },
        [],
    );
    const result = uniqueGameScores.map(t => {
        // create a new game from the uniqueGameScores
        const _scores = t
        .split(',') // make array
        .map((s: string | number) => +s) // convert string to num
        .map((s: any) => scores.find((score:any) => score.score === s)); // get scores
        return new Game(_scores);
    });
    return result;
}

const waysToScore = (points: number, game = new Game(), games: Game[] = []): Game[] => {
    if (game.score >= points) {
        if (game.score === points) {
            games.push(game);
        }
        return;
    }
    for (let score of scores) {
        const newGame = new Game([...game.scores, score]);
        waysToScore(points, newGame, games);
    }
    return games;
}

let action = process.argv[2];
let value = +process.argv[3];

switch (action) {
    case "numScores": {
        const games = gamesWithNumScores(value);
        const uniqueGames = filterUniqueGames(games);
        const scores = games.map(t => t.scores);
        const finalScores = games.map(t => t.score).sort((a, b) => a - b);
        const aggScores = aggregateScores(games);

        console.log('total games: ', games.length);
        console.log('unique games: ', uniqueGames.length);
        console.log(aggScores);
    }
        break;
    case "waysToScore": {
        const games = waysToScore(value);
        const uniqueGames = filterUniqueGames(games);
        const x = uniqueGames.map(t => t.scores.map(s => s.name));

        console.log('total games: ', games.length);
        console.log('unique games: ', uniqueGames.length);

        // console.log(`${action} ${value}: ${x.length}`, x);
    }
        break;
    case "analyze": {
        const analysis = [];
        for (let i = 2; i <= value; i++) {
            const result = waysToScore(i);
            const uniqueGames = filterUniqueGames(result);
            analysis.push({ score: i, waysToScore: uniqueGames.length });
        }
        console.log('x', analysis.map(t => t.score));
        console.log('y', analysis.map(t => t.waysToScore));
        console.log(`${action} up to ${value} points:`, analysis);
    }
        break;
}