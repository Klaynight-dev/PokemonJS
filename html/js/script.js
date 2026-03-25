import * as truc from './import.test.js';

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
        tdGen.textContent = pokemon.generation;
        row.appendChild(tdGen);

        // Types
        const tdTypes = document.createElement('td');
        tdTypes.textContent = pokemon.types.join(', ');
        row.appendChild(tdTypes);

        // Stamina
        const tdStamina = document.createElement('td');
        tdStamina.textContent = pokemon.stamina;
        row.appendChild(tdStamina);

        // Attack
        const tdAttack = document.createElement('td');
        tdAttack.textContent = pokemon.attack;
        row.appendChild(tdAttack);

        // Defense
        const tdDefense = document.createElement('td');
        tdDefense.textContent = pokemon.defense;
        row.appendChild(tdDefense);

        // Image
        const tdImage = document.createElement('td');
        const img = document.createElement('img');
        img.src = pokemon.image;
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
    const pokemons = ;
    const pokemonTable = createPokemonTable(pokemons);
    document.getElementById('pokemon-table-container').appendChild(pokemonTable);
});