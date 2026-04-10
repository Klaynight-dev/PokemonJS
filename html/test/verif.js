console.table("Tous les Pokemons");
console.table(Pokemon.all_pokemons);
console.table("-------------------");
console.table("Pokemon 1 (Bulbasaur)");
console.table(Pokemon.all_pokemons[1].toString());
console.table("-------------------");
console.table("Pokemons Grass");
console.table(getPokemonsByType('Grass'))
console.table("-------------------");
console.table("Attaque 210 (Wing Attack)");
console.table(Pokemon.all_attacks[210].toString());
console.table("-------------------");
console.table("Type Bug");
console.table(Pokemon.all_types['Bug'].toString());
console.table("-------------------");
