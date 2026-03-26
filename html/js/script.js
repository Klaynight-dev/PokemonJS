import * as Class from '../test/import.test.js';
import * as PokeFonctions from '../test/test.js';

/**
 * Construit des groupes de variantes à partir d'un tableau de Pokémon.
 * Les variantes sont regroupées par identifiant et nom de Pokémon.
 * @param {Array} pokemons - Un tableau d'objets Pokémon à regrouper.
 * @returns {Array} - Un tableau de groupes, chaque groupe contenant un id, un nom et un tableau de variantes.
 */
function buildGroupsFromPokemons(pokemons) {
    const groups = new Map();
    pokemons.forEach(p => {
        const id = p.id ?? p.pokemon_id ?? p.pokemonId ?? p.id_pokemon;
        const name = p.name ?? p.pokemon_name ?? p.pokemonName ?? '';
        if (id == null) return;
        const key = String(id) + '::' + name;
        if (!groups.has(key)) groups.set(key, { id, name, variants: [] });
        groups.get(key).variants.push(p);
    });
    return Array.from(groups.values());
}

function createPokemonTableFromGroups(groups) {
    const table = document.createElement('table');
    table.className = 'pokemon-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = [
        'ID', 'Nom', 'Génération', 'Types', 'Endurance', 'Attaque', 'Défense', 'Image'
    ];
    headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    groups.forEach(group => {
        const row = document.createElement('tr');
        row.dataset.pokemonId = String(group.id);
        row.dataset.pokemonName = group.name || '';
        row.tabIndex = 0;

        const tdId = document.createElement('td');
        tdId.textContent = group.id;
        tdId.setAttribute('data-label', 'ID');
        row.appendChild(tdId);

        const tdName = document.createElement('td');
        tdName.textContent = group.name || (group.variants[0] && (group.variants[0].name ?? group.variants[0].pokemon_name)) || '';
        tdName.setAttribute('data-label', 'Nom');
        row.appendChild(tdName);

        const tdGen = document.createElement('td');
        tdGen.setAttribute('data-label', 'Génération');
        const select = document.createElement('select');
        group.variants.forEach((v, idx) => {
            const opt = document.createElement('option');
            const form = v.form ?? v.forme ?? v.generation ?? v.variant ?? 'Normal';
            opt.value = String(idx);
            opt.textContent = form;
            opt.title = form;
            select.appendChild(opt);
        });
        tdGen.appendChild(select);
        row.appendChild(tdGen);

        const tdTypes = document.createElement('td');
        tdTypes.setAttribute('data-label', 'Types');
        row.appendChild(tdTypes);
        const tdStamina = document.createElement('td');
        tdStamina.setAttribute('data-label', 'Endurance');
        row.appendChild(tdStamina);
        const tdAttack = document.createElement('td');
        tdAttack.setAttribute('data-label', 'Attaque');
        row.appendChild(tdAttack);
        const tdDefense = document.createElement('td');
        tdDefense.setAttribute('data-label', 'Défense');
        row.appendChild(tdDefense);

        const tdImage = document.createElement('td');
        tdImage.setAttribute('data-label', 'Image');
        const img = document.createElement('img');
        img.className = 'pokemon-image';
        tdImage.appendChild(img);
        row.appendChild(tdImage);

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
                img.src = './imgs/webp/thumbnails/' + padded + '.webp';
                img.alt = group.name || '';
                img.onerror = () => {
                    img.src = './imgs/webp/thumbnails-none.webp';
                    img.alt = group.name || '';
                }
            } else {
                img.src = './imgs/webp/thumbnails-none.webp';
                img.alt = group.name || '';
            }
        }

        const normalIdx = group.variants.findIndex(v => (v.form ?? v.forme ?? '').toLowerCase() === 'normal');
        const initIdx = normalIdx >= 0 ? normalIdx : 0;
        select.selectedIndex = initIdx;
        const initialOption2 = select.options[select.selectedIndex];
        if (initialOption2) select.title = initialOption2.textContent;
        applyVariant(group.variants[initIdx]);

        select.addEventListener('change', e => {
            const idx = Number(e.target.value);
            if (!Number.isNaN(idx) && group.variants[idx]) applyVariant(group.variants[idx]);
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    return table;
}

document.addEventListener('change', e => {
    if (e.target && e.target.tagName && e.target.tagName.toLowerCase() === 'select') {
        const select = e.target;
        const option = select.options[select.selectedIndex];
        if (option) {
            select.title = option.textContent || option.title || '';
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    Class.Type.fillTypes(Class.type_effectiveness['type_effectiveness']);
    Class.Attack.fill_attacks(Class.fast_moves);
    Class.Attack.fill_attacks(Class.charged_moves);
    PokeFonctions.fill_Pokemons();
    const pokemons = Class.Pokemon.all_pokemons;

    const groupsArray = buildGroupsFromPokemons(pokemons);
    const pageSize = 25;
    let currentPage = 1;
    const totalPages = Math.max(1, Math.ceil(groupsArray.length / pageSize));

    const container = document.getElementById('pokemon-container') || document.body;
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');

    const preview = document.createElement('div');
    preview.id = 'image-preview';
    preview.style.display = 'none';
    preview.innerHTML = '<img alt="" />';
    document.body.appendChild(preview);

    function getLargeSrcFromSmall(src) {
        try {
            return src.replace('/thumbnails/', '/images/');
        } catch (e) {
            return src;
        }
    }

    function attachPreviewHandlers(root) {
        const imgs = root.querySelectorAll('img');
        imgs.forEach(img => {
            if (img.__previewAttached) return;
            img.__previewAttached = true;

            img.addEventListener('mouseenter', (ev) => {
                const largeSrc = getLargeSrcFromSmall(img.src || '');
                const pj = preview.querySelector('img');
                pj.src = largeSrc;
                pj.alt = img.alt || '';
                preview.style.display = 'block';
            });

            img.addEventListener('mousemove', (ev) => {
                const offsetX = 12;
                const offsetY = 18;
                const pj = preview.querySelector('img');
                const rect = preview.getBoundingClientRect();
                let pw = rect.width || parseInt(getComputedStyle(pj).maxWidth) || 260;
                let ph = rect.height || parseInt(getComputedStyle(pj).maxHeight) || 260;

                let desiredX = ev.clientX + offsetX;
                let desiredY = ev.clientY - offsetY - ph;

                const margin = 8;
                if (desiredX + pw > window.innerWidth - margin) {
                    desiredX = window.innerWidth - pw - margin;
                }
                if (desiredX < margin) desiredX = margin;

                if (desiredY < margin) {
                    desiredY = ev.clientY + offsetY;
                    if (desiredY + ph > window.innerHeight - margin) {
                        desiredY = window.innerHeight - ph - margin;
                    }
                }

                preview.style.left = Math.max(margin, Math.round(desiredX)) + 'px';
                preview.style.top = Math.max(margin, Math.round(desiredY)) + 'px';
            });

            img.addEventListener('mouseleave', () => {
                preview.style.display = 'none';
                const pj = preview.querySelector('img');
                pj.src = '';
            });
        });
    }

    const detailsOverlay = document.createElement('div');
    detailsOverlay.id = 'pokemon-details-overlay';
    detailsOverlay.style.display = 'none';
    detailsOverlay.innerHTML = `
        <div class="pokemon-details">
            <button class="pokemon-details-close" aria-label="Fermer">×</button>
            <div class="pokemon-details-body">
                <div class="pokemon-details-image"><img alt=""/></div>
                <div class="pokemon-details-info">
                    <h2 class="pokemon-details-title"></h2>
                    <div class="pokemon-details-stats"></div>
                    <div class="pokemon-details-variants"></div>
                    <div class="pokemon-details-attacks">
                        <h3>Attaques</h3>
                        <div class="pokemon-attacks-table"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(detailsOverlay);

    function closeDetails() {
        detailsOverlay.style.display = 'none';
        const img = detailsOverlay.querySelector('.pokemon-details-image img');
        if (img) img.src = '';
        document.body.style.overflow = '';
    }

    detailsOverlay.addEventListener('click', (ev) => {
        if (ev.target === detailsOverlay) closeDetails();
    });
    detailsOverlay.querySelector('.pokemon-details-close').addEventListener('click', closeDetails);
    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeDetails(); });

    function showDetailsForRow(row) {
        document.body.style.overflow = 'hidden';
        console.debug('showDetailsForRow called for row', row && row.dataset && row.dataset.pokemonId);
        const id = row.dataset.pokemonId;
        const name = row.dataset.pokemonName || '';
            const group = groupsArray.find(g => String(g.id) === String(id) && (g.name || '') === name);
        if (!group) return;
        const select = row.querySelector('select');
        const idx = select ? Number(select.value || select.selectedIndex || 0) : 0;
        const variant = group.variants[idx] || group.variants[0] || {};

        const imgEl = detailsOverlay.querySelector('.pokemon-details-image img');
        const titleEl = detailsOverlay.querySelector('.pokemon-details-title');
        const statsEl = detailsOverlay.querySelector('.pokemon-details-stats');
        const variantsEl = detailsOverlay.querySelector('.pokemon-details-variants');
        const attacksContainer = detailsOverlay.querySelector('.pokemon-attacks-table');

        // stocker l'identité affichée pour permettre des mises à jour externes
        detailsOverlay.dataset.pokemonId = String(group.id);
        detailsOverlay.dataset.pokemonName = group.name || '';

        const idNum = Number(group.id);
        if (!Number.isNaN(idNum)) {
            const padded = idNum < 10 ? '00' + idNum : idNum < 100 ? '0' + idNum : String(idNum);
            imgEl.src = './imgs/webp/images/' + padded + '.webp';
            imgEl.alt = group.name || '';
        } else {
            imgEl.src = '';
            imgEl.alt = group.name || '';
        }

        titleEl.textContent = `${group.id} — ${group.name || ''}`;

        const types = variant.types ?? (typeof variant.getTypes === 'function' ? variant.getTypes() : undefined) ?? variant.type ?? variant.types_list ?? [];
        const stamina = variant.base_stamina ?? variant.stamina ?? variant.hp ?? '';
        const attack = variant.base_attack ?? variant.attack ?? '';
        const defense = variant.base_defense ?? variant.defense ?? '';

        statsEl.innerHTML = `
            <table class="details-stats">
                <tr><th>Types</th><td>${Array.isArray(types) ? types.join(', ') : (types || '')}</td></tr>
                <tr><th>Endurance</th><td>${stamina}</td></tr>
                <tr><th>Attaque</th><td>${attack}</td></tr>
                <tr><th>Défense</th><td>${defense}</td></tr>
            </table>
        `;

        // Afficher le tableau des attaques pour la variante sélectionnée
        if (attacksContainer) {
            attacksContainer.innerHTML = '';
            const attacks = (typeof variant.getAttacks === 'function') ? variant.getAttacks() : [];
            if (attacks && attacks.length > 0) {
                const table = document.createElement('table');
                table.className = 'details-attacks';
                const thead = document.createElement('thead');
                thead.innerHTML = '<tr><th>Nom</th><th>Type</th><th>Puissance</th><th>Durée (ms)</th><th>Énergie</th><th>Catégorie</th></tr>';
                table.appendChild(thead);
                const tbodyAtk = document.createElement('tbody');

                const fastSet = new Set((variant.fast_attacks || []).map(a => a && a.name));
                const chargedSet = new Set((variant.charged_attacks || []).map(a => a && a.name));

                attacks.forEach(a => {
                    if (!a) return;
                    const tr = document.createElement('tr');
                    const nameTd = document.createElement('td'); nameTd.textContent = a.name || '';
                    const typeTd = document.createElement('td'); typeTd.textContent = a.type || '';
                    const powerTd = document.createElement('td'); powerTd.textContent = a.power ?? '';
                    const durTd = document.createElement('td'); durTd.textContent = a.duration ?? '';
                    const engTd = document.createElement('td'); engTd.textContent = a.energy_delta ?? '';
                    const catTd = document.createElement('td');
                    const isFast = fastSet.has(a.name);
                    const isCharged = chargedSet.has(a.name);
                    catTd.textContent = isCharged && !isFast ? 'Chargée' : (isFast && !isCharged ? 'Rapide' : (isFast && isCharged ? 'Les deux' : ''));

                    tr.appendChild(nameTd);
                    tr.appendChild(typeTd);
                    tr.appendChild(powerTd);
                    tr.appendChild(durTd);
                    tr.appendChild(engTd);
                    tr.appendChild(catTd);
                    tbodyAtk.appendChild(tr);
                });

                table.appendChild(tbodyAtk);
                attacksContainer.appendChild(table);
            } else {
                attacksContainer.textContent = 'Aucune attaque renseignée.';
            }
        }

        // variantes disponibles
        variantsEl.innerHTML = '';
        if (group.variants && group.variants.length > 1) {
            const ul = document.createElement('ul');
            ul.className = 'details-variants-list';
            group.variants.forEach((v, i) => {
                const li = document.createElement('li');
                const label = v.form ?? v.forme ?? v.generation ?? v.variant ?? ('Variant ' + i);
                li.textContent = label;
                if (i === idx) li.classList.add('active');
                li.addEventListener('click', () => {
                    // simuler changement de select dans la table pour garder la cohérence
                    const targetSelect = row.querySelector('select');
                    if (targetSelect) {
                        targetSelect.selectedIndex = i;
                        const ev = new Event('change');
                        targetSelect.dispatchEvent(ev);
                    }
                    showDetailsForRow(row);
                });
                ul.appendChild(li);
            });
            variantsEl.appendChild(ul);
        }

        detailsOverlay.style.display = 'flex';
    }

    function attachRowClickHandlers(root) {
        const rows = root.querySelectorAll('tbody tr');
        console.debug('attachRowClickHandlers found rows:', rows.length);
        rows.forEach(r => {
            if (r.__detailsAttached) return;
            r.__detailsAttached = true;
            r.addEventListener('click', (ev) => {
                console.debug('row click', { id: r.dataset.pokemonId, target: ev.target && ev.target.tagName });
                // ignorer si on clique sur le select lui-même ou l'image (prévisualisation gérée séparément)
                if (ev.target && (ev.target.tagName === 'SELECT' || ev.target.tagName === 'OPTION' || ev.target.tagName === 'IMG')) return;
                showDetailsForRow(r);
            });
            r.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); showDetailsForRow(r); } });
        });
    }

    // Met à jour l'overlay de détails si la variante d'une ligne affichée change
    document.addEventListener('pokemonVariantChanged', (ev) => {
        const row = ev && ev.detail && ev.detail.row;
        if (!row) return;
        if (!detailsOverlay || detailsOverlay.style.display === 'none') return;
        const id = detailsOverlay.dataset.pokemonId;
        const name = detailsOverlay.dataset.pokemonName || '';
        if (String(row.dataset.pokemonId) === String(id) && (row.dataset.pokemonName || '') === name) {
            showDetailsForRow(row);
        }
    });

    function renderPage(page) {
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;
        currentPage = page;
        const start = (page - 1) * pageSize;
        const slice = groupsArray.slice(start, start + pageSize);
        const table = createPokemonTableFromGroups(slice);
        container.innerHTML = '';
        container.appendChild(table);
        attachPreviewHandlers(table);
        attachRowClickHandlers(table);
        if (pageInfo) pageInfo.textContent = `Page ${currentPage} / ${totalPages}`;
        if (prevBtn) prevBtn.disabled = currentPage <= 1;
        if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
    }

    if (prevBtn) prevBtn.addEventListener('click', () => renderPage(currentPage - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => renderPage(currentPage + 1));

    renderPage(1);


}); 

