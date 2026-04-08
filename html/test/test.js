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

console.log("---------");
Class.Attack.fill_attacks(Class.fast_moves);
Class.Attack.fill_attacks(Class.charged_moves);


Class.Type.fillTypes(Class.type_effectiveness);
// console.log(Class.Type.all_types['Bug'].effectiveness('Bug'));
// console.log(Class.Type.all_types.Bug);

Class.Pokemon.fill_Pokemons(Class.pokemons, Class.pokemon_moves, Class.pokemon_types);

// Class.Pokemon.getWeakestEnemies("Flamethrower");
console.log(Object.values(Class.Pokemon.all_pokemons));


export {
  Class
};