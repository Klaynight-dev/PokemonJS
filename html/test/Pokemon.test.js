import * as Class from './import.test';

function testPokemonToString() {
    Class.Attack.fill_attacks(Class.fast_moves);
    Class.Attack.fill_attacks(Class.charged_moves);
}

testPokemonToString();