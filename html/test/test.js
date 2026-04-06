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











//=================================================================================\\

Class.Attack.fill_attacks(Class.fast_moves);
// console.table(Class.Attack.all_attacks);
Class.Attack.fill_attacks(Class.charged_moves);
// console.table(Class.Attack.all_attacks);


Class.Type.fillTypes(Class.type_effectiveness);

Class.Pokemon.fill_Pokemons(Class.pokemons, Class.pokemon_moves, Class.pokemon_types);

// getBestFastAttacksForEnemy(true, "Charizard");
// console.table(getPokemonsByType());
// console.table(Class.Pokemon.all_pokemons[0].getAttacks());
// console.table(Class.Pokemon.all_pokemons[0].charged_attacks);
// console.table(Class.Pokemon.all_pokemons[0].fast_attacks);


// fill_Pokemons();

// const attack1 = Class.Attack.all_attacks[0];
// console.table(attack1.toString());

// testPokemonToString();
// getPokemonsByType("Fire");
// getPokemonsByAttack("Flamethrower");
// getAttacksByType("Fire");
// sortPokemonsByTypeThenName();
// getWeakestEnemies("Flamethrower");
// console.table(Class.Pokemon.all_pokemons.find(p => p.name.toLowerCase() === "Charizard".toLowerCase()).getBestFastAttacksForEnemy(true, "Bulbasaur"));

//[0].getBestFastAttacksForEnemy(true, "Bulbasaur")
// fastFight("Bulbasaur", "Charizard");

// Class.Pokemon.getWeakestEnemies("Flamethrower");
// console.table(Class.Type.all_types[0]["_type_name"]);
// console.table(Class.Type.type_by_name("Water"));
// console.table(Class.Pokemon.all_pokemons[0].getTypes());
// console.table(Class.Pokemon.all_pokemons[0].getTypes()[0]);
// console.table(Class.Pokemon.all_pokemons[0].getTypes()[0][0].type_name);
// console.table(Class.Pokemon.all_pokemons[0].getTypesLowerCase());
// console.table(Class.Attack.all_attacks[0].toString());

// console.table(Class.Pokemon.getWeakestEnemies("Flamethrower"));

export {
  Class
};