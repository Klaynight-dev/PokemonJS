import * as Class from '../test/import.test.js';
import * as PokeFonctions from '../test/Pokemon.test.js';


/**
 * Crée une table HTML pour afficher les informations des Pokémon.
 * @param {Array} pokemons - Un tableau d'objets Pokémon à afficher.
 * @returns {HTMLElement} - Un élément <table> contenant les données des Pokémon.
 * @elements affichés : ID, Nom, Génération, Types, Endurance, Attaque, Défense, Image
 */
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

    // Regrouper les variantes par identifiant de Pokémon
    const groups = new Map();
    pokemons.forEach(p => {
        const id = p.id ?? p.pokemon_id ?? p.pokemonId ?? p.id_pokemon;
        const name = p.name ?? p.pokemon_name ?? p.pokemonName ?? '';
        if (id == null) return;
        const key = String(id) + '::' + name;
        if (!groups.has(key)) groups.set(key, { id, name, variants: [] });
        groups.get(key).variants.push(p);
    });

    const tbody = document.createElement('tbody');
    groups.forEach(group => {
        const row = document.createElement('tr');

        const tdId = document.createElement('td');
        tdId.textContent = group.id;
        row.appendChild(tdId);

        const tdName = document.createElement('td');
        tdName.textContent = group.name || (group.variants[0] && (group.variants[0].name ?? group.variants[0].pokemon_name)) || '';
        row.appendChild(tdName);

        // Generation
        const tdGen = document.createElement('td');
        const select = document.createElement('select');
        group.variants.forEach((v, idx) => {
            const opt = document.createElement('option');
            const form = v.form ?? v.forme ?? v.generation ?? v.variant ?? 'Normal';
            opt.value = String(idx);
            opt.textContent = form;
            select.appendChild(opt);
        });
        tdGen.appendChild(select);
        row.appendChild(tdGen);

        // Types
        const tdTypes = document.createElement('td');
        row.appendChild(tdTypes);

        // Stamina
        const tdStamina = document.createElement('td');
        row.appendChild(tdStamina);

        // Attack
        const tdAttack = document.createElement('td');
        row.appendChild(tdAttack);

        // Defense
        const tdDefense = document.createElement('td');
        row.appendChild(tdDefense);

        // Image
        const tdImage = document.createElement('td');
        const img = document.createElement('img');
        img.style.height = '40px';
        img.style.objectFit = 'contain';
        tdImage.appendChild(img);
        row.appendChild(tdImage);

        // Fonction pour appliquer une variante sur les cellules
        function applyVariant(variant) {
            const types = variant.types ?? (typeof variant.getTypes === 'function' ? variant.getTypes() : undefined) ?? variant.type ?? variant.types_list ?? [];
            tdTypes.textContent = Array.isArray(types) ? types.join(', ') : (types || '');

            const stamina = variant.base_stamina ?? variant.stamina ?? variant.hp ?? '';
            const attack = variant.base_attack ?? variant.attack ?? '';
            const defense = variant.base_defense ?? variant.defense ?? '';
            tdStamina.textContent = stamina;
            tdAttack.textContent = attack;
            tdDefense.textContent = defense;

            const idNum = Number(group.id);
            if (!Number.isNaN(idNum)) {
                const padded = idNum < 10 ? '00' + idNum : idNum < 100 ? '0' + idNum : String(idNum);
                img.src = './imgs/webp/images/' + padded + '.webp';
                img.alt = group.name || '';
            } else {
                img.src = '';
                img.alt = group.name || '';
            }
        }

        // initial: prefer la forme "Normal" si présente
        const normalIdx = group.variants.findIndex(v => (v.form ?? v.forme ?? '').toLowerCase() === 'normal');
        const initIdx = normalIdx >= 0 ? normalIdx : 0;
        select.selectedIndex = initIdx;
        applyVariant(group.variants[initIdx]);

        // changer la variante au changement du select
        select.addEventListener('change', e => {
            const idx = Number(e.target.value);
            if (!Number.isNaN(idx) && group.variants[idx]) applyVariant(group.variants[idx]);
        });

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