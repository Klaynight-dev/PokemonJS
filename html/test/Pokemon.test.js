import * as Class from './import.test.js';

function testPokemonToString() {
    Class.Attack.fill_attacks(Class.fast_moves);
    // console.table(Class.Attack.all_attacks);
    Class.Attack.fill_attacks(Class.charged_moves);
    // console.table(Class.Attack.all_attacks);

    // const attack1 = Class.Attack.all_attacks[0];
    // console.log(attack1.toString());

    let index=0;
    for (const attack of Class.Attack.all_attacks) {
        index++;
        console.log(attack.toString() + (attack.isCriticalAttack ? " (Critical Attack)" : "")
        + " du " + index + "e Pokemon(s)");
    }
}

function getPokemonsByType(typeName) {
    console.log("Pokémons de type " + typeName + " :");
    for (const pokemon of Class.Pokemon.all_pokemons) {
        if (pokemon.getTypes().includes(typeName)) {
            console.log("- " + pokemon.name);
        }
    }
}

function getPokemonsByAttack(attackName) {
    console.log("Pokémons pouvant apprendre l'attaque " + attackName + " :");
    for (const pokemon of Class.Pokemon.all_pokemons) {
        if (pokemon.getAttacks().includes(attackName)) {
            console.log("- " + pokemon.name);
        }
    }
}


testPokemonToString();