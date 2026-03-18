/**
 * Ce fichier contient des fonctions de test pour la classe Pokemon, en utilisant les données importées depuis les fichiers de données.
 * Il inclut des fonctions pour afficher les attaques, les Pokémons par type, les Pokémons par attaque, les attaques par type, trier les Pokémons par type puis par nom, et afficher les faiblesses des Pokémons contre une attaque donnée.
 * Les fonctions utilisent les données importées depuis les fichiers de données pour effectuer les tests et afficher les résultats dans la console.
 * @module pokemonjs
 * @requires ../data/Class.js
 * @requires ../data/type_effectiveness.js
 * @requires ../data/fast_moves.js
 * @requires ../data/charged_moves.js
 * @requires ../data/pokemons.js
 * @requires ../data/pokemon_moves.js
 * @requires ../data/pokemon_types.js
 * @import import.test.js
 */

import * as Class from './import.test.js';

/**
 * Affiche les attaques avec leurs détails, en indiquant si elles sont des attaques critiques ou non, et le nombre de Pokémons pouvant les apprendre.
 * Les attaques sont affichées dans l'ordre où elles ont été ajoutées à la classe Attack.
 * @returns {void}
 */
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

/**
 * Affiche les Pokémons d'un type donné.
 * @param {string} typeName - Le nom du type de Pokémon à rechercher.
 * @returns {void}
 */
function getPokemonsByType(typeName) {
    console.log("Pokémons de type " + typeName + " :");
    for (const pokemon of Class.Pokemon.all_pokemons) {
        if (pokemon.getTypes().includes(typeName)) {
            console.log("- " + pokemon.name);
        }
    }
}

/**
 * Affiche les Pokémons pouvant apprendre une attaque donnée.
 * @param {string} attackName - Le nom de l'attaque à rechercher.
 * @returns {void}
 */
function getPokemonsByAttack(attackName) {
    console.log("Pokémons pouvant apprendre l'attaque " + attackName + " :");
    for (const pokemon of Class.Pokemon.all_pokemons) {
        if (pokemon.getAttacks().includes(attackName)) {
            console.log("- " + pokemon.name);
        }
    }
}

/**
 * Affiche les attaques d'un type donné.
 * @param {string} typeName - Le nom du type d'attaque à rechercher (e.g., "Fire", "Water", etc.)
 * @returns {void}
 */
function getAttacksByType(typeName) {
    console.log("Attaques de type " + typeName + " :");
    for (const attack of Class.Attack.all_attacks) {
        if (attack.type === typeName) {
            console.log("- " + attack.name);
        }
    }
}

/**
 * Affiche les Pokémons triés par type puis par nom.
 * Les Pokémons sans type sont affichés en premier, suivis des Pokémons triés par ordre alphabétique de leur type, puis par ordre alphabétique de leur nom.
 * @returns {void}
 */
function sortPokemonsByTypeThenName() {
    const sortedPokemons = [...Class.Pokemon.all_pokemons].sort((a, b) => {
        const typeA = a.getTypes()[0] || "";
        const typeB = b.getTypes()[0] || "";
        if (typeA === typeB) {
            return a.name.localeCompare(b.name);
        }
        return typeA.localeCompare(typeB);
    });
    console.log("Pokémons triés par type puis par nom :");
    for (const pokemon of sortedPokemons) {
        console.log("- " + pokemon.name);
    }
}

/**
 * Affiche les types de Pokémon qui sont faibles contre une attaque donnée.
 * @param {string} attackName - Le nom de l'attaque pour laquelle trouver les faiblesses.
 * @returns {void}
 */
function getWeaknessesEnemies(attackName) {
    const pokemon = Class.Pokemon.all_pokemons.find(p => p.getAttacks().includes(attackName));
    if (!pokemon) {
        console.log("Aucun Pokémon ne peut apprendre l'attaque " + attackName);
        return;
    }
    const weaknesses = [];
    for (const type of pokemon.getTypes()) {
        const typeData = Class.type_effectiveness.find(t => t.type === type);
        if (typeData) {
            for (const [enemyType, multiplier] of Object.entries(typeData.effectiveness)) {
                if (multiplier > 1 && !weaknesses.includes(enemyType)) {
                    weaknesses.push(enemyType);
                }
            }
        }
    }
    console.log("Types vulnérables à l'attaque " + attackName + " :");
    for (const weakness of weaknesses) {
        console.log("- " + weakness);
    }
}


testPokemonToString();