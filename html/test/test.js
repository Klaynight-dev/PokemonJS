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
        console.table(attack.toString() + (attack.isCriticalAttack ? " (Critical Attack)" : "")
        + " du " + index + "e Pokemon(s)");
    }
}

/**
 * Affiche les Pokémons d'un type donné.
 * @param {string} typeName - Le nom du type de Pokémon à rechercher.
 * @returns {void}
 */
function getPokemonsByType(typeName) {
    const temp = [];
    let toPrint = [];
    for (const pokemon of Class.Pokemon.all_pokemons) {
        if (pokemon.getTypesLowerCase().includes(typeName?.toLowerCase())) {
            if (!temp.includes(pokemon.id)) {
                temp.push(pokemon.id);
                toPrint.push(pokemon.toString());
            }
        }
    }
    console.table("Liste des " + toPrint.length + " Pokémons de type " + typeName + " :");
    toPrint.forEach(pokemon => {
        console.table(pokemon);
    });
}

/**
 * Affiche les Pokémons pouvant apprendre une attaque donnée.
 * @param {string} attackName - Le nom de l'attaque à rechercher.
 * @returns {void}
 */
function getPokemonsByAttack(attackName) {
    const temp = [];
    let toPrint = [];
    console.table("Pokémons pouvant apprendre l'attaque " + attackName + " :");
    const learners = Class.Pokemon.all_pokemons.filter(p => p.getAttacks().some(a => a.name?.toLowerCase() === attackName?.toLowerCase()));

    if (learners.length === 0) {
        console.table("Aucun Pokémon ne peut apprendre l'attaque " + attackName);
        return;
    }

    for (const pokemon of learners) {
        if (!temp.includes(pokemon.id)) {
            temp.push(pokemon.id);
            toPrint.push(pokemon.toString());
        }
    }
    console.table("Liste des " + toPrint.length + " Pokémons pouvant apprendre l'attaque " + attackName + " :");
    toPrint.forEach(pokemon => {
        console.table(pokemon);
    });
}

/**
 * Affiche les attaques d'un type donné.
 * @param {string} typeName - Le nom du type d'attaque à rechercher (e.g., "Fire", "Water", etc.)
 * @returns {void}
 */
function getAttacksByType(typeName) {
    let toPrint = [];
    const matches = Class.Attack.all_attacks.filter(attack => attack.type.toLowerCase === typeName.toLowerCase);
    if (matches.length === 0) {
        console.table("Aucune attaque de type " + typeName);
        return;
    }
    for (const attack of matches) {
        toPrint.push(attack.toString());
    }
    console.table("Liste des " + toPrint.length + " attaques de type " + typeName + " :");
    toPrint.forEach(attack => {
        console.table(attack);
    });
}

/**
 * Affiche les Pokémons triés par type puis par nom.
 * Les Pokémons sans type sont affichés en premier, suivis des Pokémons triés par ordre alphabétique de leur type (si un Pokémon a plusieurs types, ceux-ci sont renvoyés dans un tableau trié par ordre alphabétique, si les deux Pokémons ont chacun deux types ont compare alors ces seconds types), puis par ordre alphabétique de leur nom.
 * @returns {void}
 */
function sortPokemonsByTypeThenName() {
    const sortedPokemons = [...Class.Pokemon.all_pokemons].sort((a, b) => {
        const typeA = a.getTypes()[0] || "";
        const typeB = b.getTypes()[0] || "";
        if (typeA === typeB) {
            if (a.getTypes().length == b.getTypes().length == 2){
                return a.getTypes()[1].localeCompare(b.getTypes()[1]);
            }
            return a.name.localeCompare(b.name);
        }
        return typeA.localeCompare(typeB);
    });
    console.table("Liste de tous les pokémons (" + sortedPokemons.length + ") triés par type puis par nom :");
    for (const pokemon of sortedPokemons) {
        console.table(pokemon.toString());
    }
}

/**
 * Affiche les types de Pokémon qui sont faibles contre une attaque donnée.
 * @param {string} attackName - Le nom de l'attaque pour laquelle trouver les faiblesses.
 * @returns {void}
 */
function getWeakestEnemies(attackName) {
    const pokemon = Class.Pokemon.all_pokemons.find(p => p.getAttacks().some(a => a.name.toLowerCase() === attackName.toLowerCase()));
    if (!pokemon) {
        console.table("Aucun Pokémon ne peut apprendre l'attaque " + attackName);
        return;
    }
    const weakTypes = [];
    for (const type of pokemon.getTypes()) {
        const effectiveness = Class.type_effectiveness[type];
        if (effectiveness) {
            for (const [enemyType, multiplier] of Object.entries(effectiveness)) {
                if (multiplier > 1) {
                    weakTypes.push(enemyType.toLowerCase());
                }
            }
        }
    }
    const weakPokemons = Class.Pokemon.all_pokemons.filter(p => p.getTypes().some(a => weakTypes.includes(a.toLowerCase())));
    console.table("Liste des " + weakPokemons.length + " pokémons faibles face à l'attaque " + attackName + " (ceux ayant les types " + weakTypes + ") :");
    weakPokemons.forEach(weakToString => {
        console.table(weakToString.toString());
    });
}

/**
 * Affiche la meilleure attaque rapide contre un Pokémon ennemi donné.
 * @param {Boolean} print 
 * @param {String} pokemonName
 * @return {Object} Un objet contenant l'attaque rapide la plus efficace, les points de dégâts par seconde (DPS) et le multiplicateur d'efficacité contre le Pokémon ennemi. 
 */
function getBestFastAttacksForEnemy(print, pokemonName) {
    const pokemon = Class.Pokemon.all_pokemons.find(p => p.name === pokemonName);
    if (!pokemon) {
        if (print) {
            console.table("Aucun Pokémon trouvé avec le nom " + pokemonName);
        }
        return;
    }

    const fastMoveIds = new Set(Class.fast_moves.map(m => m.move_id));
    const fastMoves = Class.Attack.all_attacks.filter(a => fastMoveIds.has(a.id)).sort();
    if (fastMoves.length === 0) {
        if (print) {
            console.table("Aucune attaque rapide disponible.");
        }
        return;
    }

    const defenderTypes = pokemon.getTypes();
    const best = fastMoves.reduce((bestSoFar, attack) => {
        let multiplier = 1;
        for (const defType of defenderTypes) {
            const effectiveness = Class.type_effectiveness[defType];
            if (effectiveness && typeof effectiveness[attack.type] === 'number') {
                multiplier *= effectiveness[attack.type];
            }
        }
        const dps = (attack.power * multiplier) / (attack.duration / 1000);
        if (!bestSoFar || dps > bestSoFar.dps) {
            return { attack, multiplier, dps };
        }
        return bestSoFar;
    }, null);

    if (!best) {
        if (print) {
            console.table("Impossible de déterminer la meilleure attaque rapide.");
        }
        return;
    }

    if (print) {
        console.table(`Meilleure attaque rapide contre ${pokemonName} : ${best.attack.name} (${best.attack.type})`);
        console.table(`  Puissance: ${best.attack.power}, Multiplicateur: ${best.multiplier.toFixed(2)}, DPS: ${best.dps.toFixed(2)}`);
    }

    return { atk: best.attack, pts: best.dps, eff: best.multiplier };
}

/**
 * Simule un combat entre deux Pokémons en utilisant des attaques rapides.
 * Affiche dans la console le déroulement du combat sous la forme d'un tableau.
 *
 * @param {string} pokemonNameA - Nom du premier Pokémon (commence le combat).
 * @param {string} pokemonNameB - Nom du second Pokémon.
 * @returns {void}
 */
function fastFight(pokemonNameA, pokemonNameB) {
    const pokemonA = Class.Pokemon.all_pokemons.find(p => p.name === pokemonNameA);
    const pokemonB = Class.Pokemon.all_pokemons.find(p => p.name === pokemonNameB);

    if (!pokemonA || !pokemonB) {
        console.table(`Pokémon introuvable : ${!pokemonA ? pokemonNameA : pokemonNameB}`);
        return;
    }

    const initialHpA = pokemonA.base_stamina;
    const initialHpB = pokemonB.base_stamina;

    let hpA = initialHpA;
    let hpB = initialHpB;
    const log = [];

    const damageCalc = (attacker, defender, attack, multiplier) => {
        const raw = 0.5 * attacker.base_attack * attack.power / defender.base_defense * multiplier;
        return Math.max(1, Math.floor(raw) + 1);
    };

    let turn = 1;
    let attacker = pokemonA;
    let defender = pokemonB;
    let attackerHp = hpA;
    let defenderHp = hpB;

    while (turn <= 100 && attackerHp > 0 && defenderHp > 0) {
        const bestAttack = getBestFastAttacksForEnemy(false, defender.name);
        if (!bestAttack || !bestAttack.atk) {
            console.table("Impossible de déterminer l'attaque rapide pour le combat.");
            break;
        }

        const damage = damageCalc(attacker, defender, bestAttack.atk, bestAttack.eff);
        defenderHp = Math.max(0, defenderHp - damage);

        log.push({
            Tour: turn,
            Attaquant: attacker.name,
            ATK: attacker.base_attack,
            Défenseur: defender.name,
            DEF: defender.base_defense,
            "Nom Attaque": bestAttack.atk.name,
            Effect: bestAttack.eff.toFixed(2),
            Dégâts: damage,
            Reste: defenderHp   
        });

        if (defenderHp <= 0) {
            break;
        }

        [attacker, defender] = [defender, attacker];
        [attackerHp, defenderHp] = [defenderHp, attackerHp];
        turn += 1;
    }

    console.table(log);
}





//=================================================================================\\

Class.Attack.fill_attacks(Class.fast_moves);
// console.table(Class.Attack.all_attacks);
Class.Attack.fill_attacks(Class.charged_moves);
// console.table(Class.Attack.all_attacks);

/**
 * Function pour remplir la liste des Pokémons à partir des données importées, en associant les attaques correspondantes à chaque Pokémon en fonction de leurs noms.
 * Cette fonction utilise les données des Pokémons, des attaques rapides et des attaques chargées pour créer des instances de la classe Pokemon avec les attaques correspondantes.
 * @returns {void}
 */
function fill_Pokemons() {
    Class.Pokemon.all_pokemons.length = 0;

    const attackByName = new Map(Class.Attack.all_attacks.map(a => [a.name, a]));

    for (const poke of Class.pokemons) {
        const moves = Class.pokemon_moves.find(m => m.pokemon_id === poke.pokemon_id && m.form === poke.form);
        const chargedMoveNames = [
            ...(moves?.charged_moves ?? [])
        ];
        const chargedAttacks = chargedMoveNames
            .map(name => attackByName.get(name))
            .filter(Boolean);

        const fastMoveNames = [
            ...(moves?.fast_moves ?? [])
        ];
        const fastAttacks = fastMoveNames
            .map(name => attackByName.get(name))
            .filter(Boolean);

        // Cherche les types d'espèce correspondants dans les données `pokemon_types`
        const typeEntry = (Class.pokemon_types || []).find(t => t.pokemon_id === poke.pokemon_id && t.form === poke.form);
        const speciesTypes = typeEntry ? typeEntry.type : [];

        new Class.Pokemon(
            poke.pokemon_id,
            poke.pokemon_name,
            poke.form,
            poke.base_attack,
            poke.base_defense,
            poke.base_stamina,
            chargedAttacks,
            fastAttacks,
            speciesTypes
        );
    }
}

fill_Pokemons();

getBestFastAttacksForEnemy(true, "Charizard");
// console.table(getPokemonsByType());
// console.table(Class.Pokemon.all_pokemons[0].getAttacks());
// console.table(Class.Pokemon.all_pokemons[0].charged_attacks);
// console.table(Class.Pokemon.all_pokemons[0].fast_attacks);


// Class.Type.fillTypes(Class.type_effectiveness['type_effectiveness']);
// fill_Pokemons();

// const attack1 = Class.Attack.all_attacks[0];
// console.table(attack1.toString());

// testPokemonToString();
// getPokemonsByType("Fire");
// getPokemonsByAttack("Flamethrower");
// getAttacksByType("Fire");
// sortPokemonsByTypeThenName();
// getWeakestEnemies("Flamethrower");
// getBestFastAttacksForEnemy(true, "Bulbasaur");
// fastFight("Bulbasaur", "Charmander");

export {
  testPokemonToString,
  getPokemonsByType,
  getPokemonsByAttack,
  getAttacksByType,
  sortPokemonsByTypeThenName,
  getWeakestEnemies,
  getBestFastAttacksForEnemy,
  fastFight,
  fill_Pokemons
};