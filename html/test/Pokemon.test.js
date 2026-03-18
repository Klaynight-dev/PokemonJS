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
    const learners = Class.Pokemon.all_pokemons.filter(p => p.getAttacks().some(a => a.name === attackName));

    if (learners.length === 0) {
        console.log("Aucun Pokémon ne peut apprendre l'attaque " + attackName);
        return;
    }

    for (const pokemon of learners) {
        console.log("- " + pokemon.name);
    }
}

/**
 * Affiche les attaques d'un type donné.
 * @param {string} typeName - Le nom du type d'attaque à rechercher (e.g., "Fire", "Water", etc.)
 * @returns {void}
 */
function getAttacksByType(typeName) {
    console.log("Attaques de type " + typeName + " :");
    const matches = Class.Attack.all_attacks.filter(attack => attack.type === typeName);
    if (matches.length === 0) {
        console.log("Aucune attaque de type " + typeName);
        return;
    }
    for (const attack of matches) {
        console.log("- " + attack.name);
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
    const pokemon = Class.Pokemon.all_pokemons.find(p => p.getAttacks().some(a => a.name === attackName));
    if (!pokemon) {
        console.log("Aucun Pokémon ne peut apprendre l'attaque " + attackName);
        return;
    }
    const weaknesses = [];
    for (const type of pokemon.getTypes()) {
        const effectiveness = Class.type_effectiveness[type];
        if (effectiveness) {
            for (const [enemyType, multiplier] of Object.entries(effectiveness)) {
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

/**
 * Affiche la meilleure attaque rapide contre un Pokémon ennemi donné.
 * @param {Boolean} print 
 * @param {String} pokemonName 
 */
function getBestFastAttackForEnemy(print, pokemonName) {
    if (print) {
        const pokemon = Class.Pokemon.all_pokemons.find(p => p.name === pokemonName);
        if (!pokemon) {
            console.log("Aucun Pokémon trouvé avec le nom " + pokemonName);
            return;
        }
        const weaknesses = [];
        for (const type of pokemon.getTypes()) {
            const effectiveness = Class.type_effectiveness[type];
            if (effectiveness) {
                for (const [enemyType, multiplier] of Object.entries(effectiveness)) {
                    if (multiplier > 1 && !weaknesses.includes(enemyType)) {
                        weaknesses.push(enemyType);
                    }
                }
            }
        }
    } else {
        return;
    }
}

Class.Attack.fill_attacks(Class.fast_moves);
// console.table(Class.Attack.all_attacks);
Class.Attack.fill_attacks(Class.charged_moves);
// console.table(Class.Attack.all_attacks);

/**
 * Function pour remplir la liste des Pokémons à partir des données importées, en associant les attaques correspondantes à chaque Pokémon en fonction de leurs noms.
 * Cette fonction utilise les données des Pokémons, des attaques rapides et des attaques chargées pour créer des instances de la classe Pokemon avec les attaques correspondantes.
 * @returns {void}
 */
function fillPokemons() {
    Class.Pokemon.all_pokemons.length = 0;

    const attackByName = new Map(Class.Attack.all_attacks.map(a => [a.name, a]));

    for (const poke of Class.pokemons) {
        const moves = Class.pokemon_moves.find(m => m.pokemon_id === poke.pokemon_id && m.form === poke.form);
        const moveNames = [
            ...(moves?.fast_moves ?? []),
            ...(moves?.charged_moves ?? [])
        ];
        const attacks = moveNames
            .map(name => attackByName.get(name))
            .filter(Boolean);

        new Class.Pokemon(
            poke.pokemon_id,
            poke.pokemon_name,
            poke.form,
            poke.base_attack,
            poke.base_defense,
            poke.base_stamina,
            attacks
        );
    }
}

fillPokemons();

// const attack1 = Class.Attack.all_attacks[0];
// console.log(attack1.toString());

// testPokemonToString();
getPokemonsByType("Fire");
getPokemonsByAttack("Flamethrower");
getAttacksByType("Fire");
sortPokemonsByTypeThenName();
getWeaknessesEnemies("Flamethrower");
getBestFastAttackForEnemy(true, "Bulbasaur");