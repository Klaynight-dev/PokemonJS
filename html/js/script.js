import * as Class from '../test/import.test.js';
import * as PokeFonctions from '../test/Pokemon.test.js';

function createPokemonTable(pokemons) {
    const table = document.createElement('table');
    table.className = 'pokemon-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = [
        'ID',
        'Nom',
        'Génération',
        'Types',
        'Endurance',
        'Attaque',
        'Défense',
        'Image'
    ];
    headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create tbody
    const tbody = document.createElement('tbody');
    pokemons.forEach(pokemon => {
        const row = document.createElement('tr');

        // ID
        const tdId = document.createElement('td');
        tdId.textContent = pokemon.id;
        row.appendChild(tdId);

        // Name
        const tdName = document.createElement('td');
        tdName.textContent = pokemon.name;
        row.appendChild(tdName);

        // Generation
        const tdGen = document.createElement('td');
        tdGen.textContent = pokemon.form ?? pokemon.generation ?? '';
        row.appendChild(tdGen);

        // Types
        const tdTypes = document.createElement('td');
        const types = (pokemon.types ?? (typeof pokemon.getTypes === 'function' ? pokemon.getTypes() : undefined)) || [];
        tdTypes.textContent = types.join(', ');
        row.appendChild(tdTypes);

        // Stamina
        const tdStamina = document.createElement('td');
        tdStamina.textContent = pokemon.base_stamina ?? pokemon.stamina ?? '';
        row.appendChild(tdStamina);

        // Attack
        const tdAttack = document.createElement('td');
        tdAttack.textContent = pokemon.base_attack ?? pokemon.attack ?? '';
        row.appendChild(tdAttack);

        // Defense
        const tdDefense = document.createElement('td');
        tdDefense.textContent = pokemon.base_defense ?? pokemon.defense ?? '';
        row.appendChild(tdDefense);

        // Image
        const tdImage = document.createElement('td');
        const img = document.createElement('img');
        img.src = "./imgs/webp/images/" + (pokemon.id < 10 ? "00" + pokemon.id : pokemon.id < 100 ? "0" + pokemon.id : pokemon.id) + ".webp";
        img.alt = pokemon.name;
        img.style.height = '40px'; // Adjust as needed
        img.style.objectFit = 'contain';
        tdImage.appendChild(img);
        row.appendChild(tdImage);

        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    return table;
}

document.addEventListener('DOMContentLoaded', () => {
    Class.Type.fillTypes(Class.type_effectiveness['type_effectiveness']);
    Class.Attack.fill_attacks(Class.fast_moves);
    Class.Attack.fill_attacks(Class.charged_moves);
    PokeFonctions.fill_Pokemons();
    const pokemons = Class.Pokemon.all_pokemons;
    const pokemonTable = createPokemonTable(pokemons);
    document.body.appendChild(pokemonTable);
}); 