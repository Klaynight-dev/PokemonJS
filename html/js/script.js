import * as Class from '../test/import.test.js';

/** Variables partagées utilisées par les fonctions :
 * Fonction de tri : currentSortKey, currentSortDir
 * Pagination : groupsArray, filteredGroups, pageSize, currentPage, totalPages
 * Références DOM : container, prevBtn, nextBtn, pageInfo, typeSelect, fastSelect, nameInput, preview, detailsOverlay
 */
let groupsArray = [];
let filteredGroups = [];
let pageSize = 25;
let currentPage = 1;
let totalPages = 1;
let container = null;
let prevBtn = null;
let nextBtn = null;
let pageInfo = null;
let typeSelect = null;
let fastSelect = null;
let nameInput = null;
let preview = null;
let detailsOverlay = null;
let currentSortKey = null;
let currentSortDir = 1; // 1 = croissant, -1 = décroissant

/**
 * Récupère la variante principale d'un groupe de variantes, en privilégiant la forme "Normal" si elle existe.
 * @param {Object} group - Un groupe de variantes, contenant un tableau de variantes dans la propriété "variants".
 * @returns {Object} - La variante principale du groupe, ou une variante par défaut si aucune n'est trouvée.
 */
function getPrimaryVariant(group) {
    const normalIdx = group.variants.findIndex(v => (v.form ?? v.forme ?? '').toLowerCase() === 'normal');
    const idx = normalIdx >= 0 ? normalIdx : 0;
    return group.variants[idx] || group.variants[0] || {};
}

/**
 * Retourne un tableau de noms de types pour une variante (robuste aux différents formats).
 * @param {Object} variant
 * @returns {string[]}
 */
function getVariantTypeNames(variant) {
    const types = variant?.types ?? (typeof variant?.getTypes === 'function' ? variant.getTypes() : undefined) ?? variant?.type ?? variant?.types_list ?? [];
    if (Array.isArray(types)) {
        return types.map(t => {
            if (typeof t === 'string') return t;
            if (t && typeof t.type_name === 'string') return t.type_name;
            if (t && typeof t.type === 'string') return t.type;
            return '';
        }).filter(Boolean);
    }
    if (typeof types === 'string') return [types];
    return [];
}

/**
 * Récupère la valeur de tri d'un groupe de variantes en fonction de la clé de tri spécifiée.
 * La fonction tente d'extraire la valeur de tri à partir de la variante principale du groupe, en utilisant différentes propriétés selon la clé.
 * @param {Object} group - Groupe de variantes à partir duquel extraire la valeur de tri.
 * @param {string} key - La clé de tri, qui peut être [ID, Nom, Génération, Types, "Endurance, Attaque, Défense].
 * @returns {number|string} - La valeur de tri extraite du groupe, ou une valeur par défaut si elle ne peut pas être déterminée.
 */
function getSortValue(group, key) {
    const v = getPrimaryVariant(group);
    switch (key) {
        case 'ID': return Number(group.id) || 0;
        case 'Nom': return String(group.name || '').toLowerCase();
        case 'Génération': return String(v.form ?? v.forme ?? v.generation ?? v.variant ?? '').toLowerCase();
        case 'Types': {
            const typeNames = getVariantTypeNames(v);
            return typeNames.join(', ').toLowerCase();
        }
        case 'Endurance': return Number(v.base_stamina ?? v.stamina ?? v.hp) || 0;
        case 'Attaque': return Number(v.base_attack ?? v.attack) || 0;
        case 'Défense': return Number(v.base_defense ?? v.defense) || 0;
        default: return '';
    }
}


/**
 * Bascule l'ordre de tri pour une colonne donnée.
 * @param {string} key - La clé de tri pour laquelle basculer l'ordre.
 */
function toggleSort(key) {
    if (currentSortKey === key) currentSortDir = -currentSortDir;
    else { currentSortKey = key; currentSortDir = 1; }
    if (Array.isArray(filteredGroups)) {
        filteredGroups.sort((a, b) => {
            const va = getSortValue(a, currentSortKey);
            const vb = getSortValue(b, currentSortKey);
            if (va === vb) return 0;
            if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * currentSortDir;
            const sa = String(va).toLowerCase();
            const sb = String(vb).toLowerCase();
            if (sa < sb) return -1 * currentSortDir;
            if (sa > sb) return 1 * currentSortDir;
            return 0;
        });
    }
    renderPage(1);
}

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

/**
 * Crée une <table> à partir d'un tableau de groupes de variantes.
 * Chaque groupe correspond à une ligne de la table, avec des colonnes pour l'ID, le nom, la génération, les types, les statistiques et l'image.
 * @param {*} groups 
 * @returns 
 */
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
        th.dataset.key = text;
        if (text !== 'Image') {
            th.style.cursor = 'pointer';
            th.tabIndex = 0;
            th.addEventListener('click', () => toggleSort(text));
            th.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSort(text); }});
        }
        if (currentSortKey === text) {
            th.classList.add('sorted', currentSortDir === 1 ? 'asc' : 'desc');
        }
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
        select.className = 'btn';
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

        /**
         * Applique les propriétés d'une variante donnée aux éléments de la ligne.
         * @param {*} variant - La variante à appliquer.
         */
        function applyVariant(variant) {
            const typeNames = getVariantTypeNames(variant);
            tdTypes.textContent = typeNames.join(', ');
            const stamina = variant.base_stamina ?? variant.stamina ?? variant.hp ?? '';
            const attack = variant.base_attack ?? variant.attack ?? '';
            const defense = variant.base_defense ?? variant.defense ?? '';
            tdStamina.textContent = stamina;
            tdAttack.textContent = attack;
            tdDefense.textContent = defense;
            const idNum = Number(group.id);
            if (!Number.isNaN(idNum)) {
                const padded = idNum < 10 ? '00' + idNum : idNum < 100 ? '0' + idNum : String(idNum);
                img.src = './webp/thumbnails/' + padded + '.webp';
                img.alt = group.name || '';
                img.onerror = () => {
                    img.src = './webp/thumbnails-none.webp';
                    img.alt = group.name || '';
                }
            } else {
                img.src = './webp/thumbnails-none.webp';
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

/**
 * Affiche les détails pour une ligne donnée.
 * @param {HTMLElement} row - La ligne pour laquelle afficher les détails.
 * @returns {void}
 */
function showDetailsForRow(row) {
    document.body.style.overflow = 'hidden';
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

    detailsOverlay.dataset.pokemonId = String(group.id);
    detailsOverlay.dataset.pokemonName = group.name || '';

    const tabButtons = detailsOverlay.querySelectorAll('.tab-button');
    tabButtons.forEach(b => {
        const isOverview = b.dataset.tab === 'overview';
        b.classList.toggle('active', isOverview);
        b.setAttribute('aria-selected', isOverview ? 'true' : 'false');
    });
    const panels = detailsOverlay.querySelectorAll('.tab-panel');
    panels.forEach(p => {
        if (p.dataset.panel === 'overview') p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
    });

    const idNum = Number(group.id);
    if (!Number.isNaN(idNum)) {
        const padded = idNum < 10 ? '00' + idNum : idNum < 100 ? '0' + idNum : String(idNum);
        imgEl.src = './webp/images/' + padded + '.webp';
        imgEl.alt = group.name || '';
    } else {
        imgEl.src = '';
        imgEl.alt = group.name || '';
    }

    titleEl.textContent = `${group.id} — ${group.name || ''}`;

    const typeNames = getVariantTypeNames(variant);
    const stamina = variant.base_stamina ?? variant.stamina ?? variant.hp ?? '';
    const attack = variant.base_attack ?? variant.attack ?? '';
    const defense = variant.base_defense ?? variant.defense ?? '';

    statsEl.innerHTML = `
        <table class="details-stats">
            <tr><th>Types</th><td>${typeNames.join(', ')}</td></tr>
            <tr><th>Endurance</th><td>${stamina}</td></tr>
            <tr><th>Attaque</th><td>${attack}</td></tr>
            <tr><th>Défense</th><td>${defense}</td></tr>
        </table>
    `;

    try {
        const statRows = statsEl.querySelectorAll('tr');
        statRows.forEach(r => {
            const th = r.querySelector('th');
            const td = r.querySelector('td');
            if (th && td) {
                td.setAttribute('data-label', th.textContent || '');
            }
        });
    } catch (e) {
        console.warn('Error setting data-labels for stats table:', e);
    }

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

                nameTd.setAttribute('data-label', 'Nom');
                typeTd.setAttribute('data-label', 'Type');
                powerTd.setAttribute('data-label', 'Puissance');
                durTd.setAttribute('data-label', 'Durée (ms)');
                engTd.setAttribute('data-label', 'Énergie');
                catTd.setAttribute('data-label', 'Catégorie');

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

    variantsEl.innerHTML = '';
    if (group.variants && group.variants.length > 1) {
        const title = document.createElement('h3');
        title.textContent = 'Variantes';
        variantsEl.appendChild(title);
        const ul = document.createElement('ul');
        ul.className = 'details-variants-list';
        group.variants.forEach((v, i) => {
            const li = document.createElement('li');
            li.className = 'btn';
            const label = v.form ?? v.forme ?? v.generation ?? v.variant ?? ('Variant ' + i);
            li.textContent = label;
            if (i === idx) li.classList.add('active');
            li.addEventListener('click', () => {
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

/**
 * Attache les gestionnaires d'événements pour les clics sur les lignes de la table.
 * @param {HTMLElement} root - Le conteneur racine contenant les lignes.
 */
function attachRowClickHandlers(root) {
    const rows = root.querySelectorAll('tbody tr');
    rows.forEach(r => {
        if (r.__detailsAttached) return;
        r.__detailsAttached = true;
        r.addEventListener('click', (ev) => {
            if (ev.target && (ev.target.tagName === 'SELECT' || ev.target.tagName === 'OPTION' || ev.target.tagName === 'IMG')) return;
            showDetailsForRow(r);
        });
        r.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); showDetailsForRow(r); } });
    });
}

/**
 * Récupère la source de l'image en taille grande à partir de la source en taille réduite.
 * @param {string} src - La source de l'image en taille réduite.
 * @returns {string} - La source de l'image en taille grande.
 */
function getLargeSrcFromSmall(src) {
    try {
        return src.replace('/thumbnails/', '/images/');
    } catch (e) {
        return src;
    }
}

/**
 * Attache les gestionnaires d'événements pour les aperçus d'images.
 * @param {HTMLElement} root - Le conteneur racine contenant les images.
 */
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

/**
 * Remplit les sélecteurs de filtres avec les options disponibles.
 * @returns {void}
 */
function populateFilters() {
    if (!typeSelect || !fastSelect) return;
    const typeSet = new Set();
    const fastSet = new Set();
    groupsArray.forEach(g => {
        g.variants.forEach(v => {
            const typeNames = getVariantTypeNames(v);
            typeNames.forEach(t => t && typeSet.add(t));
            (v.fast_attacks || []).forEach(a => { if (a && a.name) fastSet.add(a.name); });
        });
    });

    /**
     * Remplit un sélecteur avec les options données.
     * @param {HTMLElement} sel - Le sélecteur à remplir.
     * @param {Set} items - L'ensemble des options à ajouter.
     */
    function fillSelect(sel, items) {
        sel.innerHTML = '';
        const empty = document.createElement('option'); empty.value = ''; empty.textContent = 'Tous'; sel.appendChild(empty);
        Array.from(items).sort().forEach(it => { const o = document.createElement('option'); o.value = it; o.textContent = it; sel.appendChild(o); });
    }
    fillSelect(typeSelect, typeSet);
    fillSelect(fastSelect, fastSet);
}

/**
 * Vérifie si un groupe correspond à un type donné.
 * @param {Object} group - Le groupe à vérifier.
 * @param {string} type - Le type à rechercher.
 * @returns {boolean} - true si le groupe correspond au type, false sinon.
 */
function matchesType(group, type) {
    if (!type) return true;
    return group.variants.some(v => {
        const typeNames = getVariantTypeNames(v);
        return typeNames.includes(type);
    });
}

/**
 * Vérifie si un groupe correspond à une attaque rapide donnée.
 * @param {Object} group - Le groupe à vérifier.
 * @param {string} fast - L'attaque rapide à rechercher.
 * @returns {boolean} - true si le groupe correspond à l'attaque rapide, false sinon.
 */
function matchesFast(group, fast) {
    if (!fast) return true;
    return group.variants.some(v => (v.fast_attacks || []).some(a => (a && a.name) === fast));
}

/**
 * Applique les filtres sélectionnés et met à jour l'affichage en conséquence.
 */
function applyFilters() {
    const t = (typeSelect && typeSelect.value) ? typeSelect.value.trim() : '';
    const f = (fastSelect && fastSelect.value) ? fastSelect.value.trim() : '';
    const name = (nameInput && nameInput.value) ? nameInput.value.trim().toLowerCase() : '';
    filteredGroups = groupsArray.filter(g => {
        if (name) {
            const n = String(g.name || '').toLowerCase();
            if (!n.includes(name)) return false;
        }
        if (!matchesType(g, t)) return false;
        if (!matchesFast(g, f)) return false;
        return true;
    });
    if (currentSortKey) {
        filteredGroups.sort((a, b) => {
            const va = getSortValue(a, currentSortKey);
            const vb = getSortValue(b, currentSortKey);
            if (va === vb) return 0;
            if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * currentSortDir;
            const sa = String(va).toLowerCase();
            const sb = String(vb).toLowerCase();
            if (sa < sb) return -1 * currentSortDir;
            if (sa > sb) return 1 * currentSortDir;
            return 0;
        });
    }
    totalPages = Math.max(1, Math.ceil(filteredGroups.length / pageSize));
    renderPage(1);
}

/**
 * Ferme la fenêtre de détails et réinitialise son contenu.
 */
function closeDetails() {
    detailsOverlay.style.display = 'none';
    const img = detailsOverlay.querySelector('.pokemon-details-image img');
    if (img) img.src = '';
    document.body.style.overflow = '';
}

/**
 * Affiche les éléments d'une page donnée.
 * @param {number} page - Le numéro de la page à afficher.
 */
function renderPage(page) {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;
    const start = (page - 1) * pageSize;
    const slice = filteredGroups.slice(start, start + pageSize);
    const table = createPokemonTableFromGroups(slice);
    container.innerHTML = '';
    container.appendChild(table);
    attachPreviewHandlers(table);
    attachRowClickHandlers(table);
    if (pageInfo) pageInfo.textContent = `Page ${currentPage} / ${totalPages}`;
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
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
    Class.Type.fillTypes(Class.type_effectiveness);
    Class.Attack.fill_attacks(Class.fast_moves);
    Class.Attack.fill_attacks(Class.charged_moves);
    Class.Pokemon.fill_Pokemons(Class.pokemons, Class.pokemon_moves, Class.pokemon_types);
    const pokemons = Class.Pokemon.all_pokemons;

    groupsArray = buildGroupsFromPokemons(pokemons);
    filteredGroups = groupsArray.slice();
    pageSize = 25;
    currentPage = 1;
    totalPages = Math.max(1, Math.ceil(filteredGroups.length / pageSize));

    container = document.getElementById('pokemon-container') || document.body;
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    pageInfo = document.getElementById('pageInfo');
    const filterContainer = document.getElementById('filter-container');
    typeSelect = document.getElementById('filterType');
    fastSelect = document.getElementById('filterFast');
    nameInput = document.getElementById('filterName');

    preview = document.createElement('div');
    preview.id = 'image-preview';
    preview.style.display = 'none';
    preview.innerHTML = '<img alt="" />';
    document.body.appendChild(preview);

    if (typeSelect && fastSelect && nameInput) {
        populateFilters();
        typeSelect.addEventListener('change', () => applyFilters());
        fastSelect.addEventListener('change', () => applyFilters());
        nameInput.addEventListener('input', () => applyFilters());
    }

    detailsOverlay = document.createElement('div');
    detailsOverlay.id = 'pokemon-details-overlay';
    detailsOverlay.style.display = 'none';
    detailsOverlay.innerHTML = `
        <div class="pokemon-details" role="dialog" aria-modal="true">
            <button class="pokemon-details-close" aria-label="Fermer">×</button>
            <div class="pokemon-details-body">
                <div class="pokemon-details-image"><img alt=""/></div>
                <div class="pokemon-details-info">
                    <header class="details-header">
                        <h2 class="pokemon-details-title"></h2>
                        <nav class="details-tabs" role="tablist">
                            <button class="btn tab-button active" role="tab" data-tab="overview" aria-selected="true">Overview</button>
                            <button class="btn tab-button" role="tab" data-tab="attacks" aria-selected="false">Attaques</button>
                        </nav>
                    </header>
                    <section class="tab-panel" data-panel="overview">
                        <div class="pokemon-details-stats"></div>
                        <div class="pokemon-details-variants"></div>
                    </section>
                    <section class="tab-panel" data-panel="attacks" hidden>
                        <div class="pokemon-details-attacks">
                            <div class="pokemon-attacks-table"></div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(detailsOverlay);

    detailsOverlay.addEventListener('click', (ev) => {
        if (ev.target === detailsOverlay) closeDetails();
    });
    detailsOverlay.querySelector('.pokemon-details-close').addEventListener('click', closeDetails);
    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeDetails(); });

    detailsOverlay.addEventListener('click', (ev) => {
        const btn = ev.target && ev.target.closest && ev.target.closest('.tab-button');
        if (!btn) return;
        const tab = btn.dataset.tab;
        if (!tab) return;
        const tabButtons = detailsOverlay.querySelectorAll('.tab-button');
        tabButtons.forEach(b => {
            const active = b === btn;
            b.classList.toggle('active', active);
            b.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        const panels = detailsOverlay.querySelectorAll('.tab-panel');
        panels.forEach(p => {
            const show = p.dataset.panel === tab;
            if (show) p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
        });
    });

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

    if (prevBtn) prevBtn.addEventListener('click', () => renderPage(currentPage - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => renderPage(currentPage + 1));

    renderPage(1);
}); 

