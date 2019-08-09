//input
const candidates = [
    ["Name","Health","Damage"],
    ["Tom Cruise",136,6],
    ["Sponge Bob",110,4],
    ["James Earl Jones",175,8],
    ["Bob Barker",112,2],
    ["Tonya Harding",108,7],
    ["Charles Barkley",220,12],
    ["Peter Piper",116,4],
    ["Harry Potter",96,16],
    ["Shamu",280,24],
    ["Bill Gates",124,6],
    ];

class Candidate = {
    constructor(name, health, damage) {
        this.name = name;
        this.health = health;
        this.damage = damage;
    }

    slap () {

    }

    static fight (c1, c2) {

    }
}


// @param {} candidate1
// @return {[name(str), wins(num)]} sorted winners
const candidateBattles = (candidates) => {

    const candidateWins = {};

    for(let i = 1; i < candidates.length; i++) {
        //fill object with candidate names as the keys and wins as the value, initialized to 0
        candidateWins[candidates[i][0]] = 0;
    }

    for(let i = 1; i < candidates.length - 1; i++) {
        for(let j = i + 1; j < candidates.length; j++) {
            
            const winner = fight(candidates[i], candidates[j]);
            // console.log(candidates[i][0], "vs", candidates[j][0], "winner: ", winner);
            candidateWins[winner] += 1;
        }
    }

    return Object.entries(candidateWins).sort((a,b) => b[1] - a[1]);
}


// @param {[name(str), health(num), damage(num)]} candidate1
// @param {[name(str), health(num), damage(num)]} candidate2
// @return {string} winner
const fight = (candidate1, candidate2) => {

    let [c1Name, c1Health, c1Dmg] = candidate1;
    let [c2Name, c2Health, c2Dmg] = candidate2;
    const c1MovesFirst = Math.random() < 0.5;
    let round = 1;

    while(c1Health > 0 && c2Health > 0) {

        //c1 moves first and on odd rounds if random is < 0.5, otherwise they move on even turns
        if ((c1MovesFirst && round % 2 === 1) || (!c1MovesFirst && round % 2 === 0)) {
            c2Health -= c1Dmg;
        } else {
            c1Health -= c2Dmg;
        }
        round++;
    }

    return c1Health > 0 ? c1Name : c2Name;
}

//FIGHT!!!!!!!!!!!!!!!!!!!!!!!!!!!
console.log(candidateBattles(candidates));