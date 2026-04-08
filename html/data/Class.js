export class Attack {
    static all_attacks = {};

    constructor(critical_chance=0, duration, energy_delta, move_id, name, power, stamina_loss_scaler, type) {
        /**
         * @property {int}    id                   - The unique identifier for the move
         * @property {string} name                 - The name of the move
         * @property {string} type                 - The type of the move (e.g., "Fire", "Water", etc.)
         * @property {int}    power                - The base power of the move
         * @property {int}    duration             - The duration of the move in milliseconds
         * @property {int}    energy_delta         - The amount of energy gained or lost when using the move
         * @property {float}  critical_chance      - The chance of landing a critical hit with the move (between 0 and 1)
         * @property {float}  stamina_loss_scaler  - The scaler for stamina loss when using the move
         * @property {boolean} isCriticalAttack    - Indicates whether the move is a critical attack
         * @function Attack.fill_attacks(data)     - A static method to fill the list of all attacks from a data array
         */
        this._id = move_id;
        this._name = name;
        this._type = type;
        this._power = power;
        this._duration = duration;
        this._energy_delta = energy_delta;
        this._critical_chance = critical_chance;
        this._stamina_loss_scaler = stamina_loss_scaler;
        this.isCriticalAttack = critical_chance > 0;
        Attack.all_attacks[move_id] = this;
    }

    toString() {
        return this.name + " : #" + this.id + ", " + this.type + ", "
        + this.power + ", " + this.duration + "ms";
    }

    static fill_attacks(data) {
        if (!data || typeof data[Symbol.iterator] !== 'function') {
            console.error('fill_attacks attend un itérable mais a reçu :', data);
            return;
        }

        for (const attack_data of data) {
            new Attack(attack_data.critical_chance, attack_data.duration, attack_data.energy_delta,
                attack_data.move_id, attack_data.name, attack_data.power, attack_data.stamina_loss_scaler,
                attack_data.type);
        }
    }

    static attack_by_name(attackName){
        return Object.values(Attack.all_attacks).filter(attack => attack.name.toLowerCase() === attackName?.toLowerCase())[0];
    }

    // Getters
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    get type() {
        return this._type;
    }
    get power() {
        return this._power;
    }
    get duration() {
        return this._duration;
    }
    get energy_delta() {
        return this._energy_delta;
    }
    get critical_chance() {
        return this._critical_chance;
    }
    get stamina_loss_scaler() {
        return this._stamina_loss_scaler;
    }
}

export class Pokemon {
    static all_pokemons = [];

    constructor(pokemon_id, pokemon_name, form, base_attack, base_defense, base_stamina, charged_attacks, fast_attacks, types = []) {
        this._id = pokemon_id;
        this._name = pokemon_name;
        this._form = form;
        this._base_attack = base_attack;
        this._base_defense = base_defense;
        this._base_stamina = base_stamina;
        this._charged_attacks = charged_attacks;
        this._fast_attacks = fast_attacks;
        this._types = Array.isArray(types) ? types : [];
        this._types.sort()
        Pokemon.all_pokemons.push(this);
    }

    toString() {
        return this.name + " : #" + this.id + ", " + this.getTypesStyled()
        + ", [STA: " + this.base_stamina + ', ATK: ' + this.base_attack + ', DEF: ' + this.base_defense + 
        "], Rapides = " + this.getAttacksStyled(this.fast_attacks)
        + ", Chargées = " + this.getAttacksStyled(this.charged_attacks);

        

    }

    getTypes() {
        if (Array.isArray(this._types) && this._types.length > 0) {
            return this._types;
        }
    }

    getTypesLowerCase(){
        let lowerCase = []
        this.getTypes().forEach(type => {
            lowerCase.push(type.type_name.toLowerCase());
        });
        return lowerCase;
    }

    getTypesStyled() {
        let types = this.getTypes();
        if (types.length < 2){
            return '[' + types[0].type_name + ']';
        }else{
            return '[' + types[0].type_name + ', ' + types[1].type_name + ']';
        }
    }

    getAttacks() {
        const attacks = [];
        for (const attack of this.charged_attacks) {
            if (!attacks.includes(attack)) {
                attacks.push(attack);
            }
        }
        for (const attack of this.fast_attacks) {
            if (!attacks.includes(attack)) {
                attacks.push(attack);
            }
        }
        return attacks;
    }

    getAttacksStyled(attackToStyle){
        let attacks = "[";
        let count = 0;
        attackToStyle.forEach(attack => {
            if (attackToStyle.length != ++count){
                attacks+= attack.name + ", ";
            }else{
                attacks+= attack.name;
            }
        });
        return attacks + "]";
    }

    // Getters
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    get form() {
        return this._form;
    }
    get base_attack() {
        return this._base_attack;
    }
    get base_defense() {
        return this._base_defense;
    }
    get base_stamina() {
        return this._base_stamina;
    }
    get charged_attacks() {
        return this._charged_attacks;
    }
    get fast_attacks() {
        return this._fast_attacks;
    }



    /**
 * Function pour remplir la liste des Pokémons à partir des données importées, en associant les attaques correspondantes à chaque Pokémon en fonction de leurs noms.
 * Cette fonction utilise les données des Pokémons, des attaques rapides et des attaques chargées pour créer des instances de la classe Pokemon avec les attaques correspondantes.
 * @returns {void}
 */
    static fill_Pokemons(dataPokemons, dataMoves, dataTypes) {
        Pokemon.all_pokemons.length = 0;

        const attackByName = new Map(Object.values(Attack.all_attacks).map(a => [a.name, a]));

        for (const poke of dataPokemons) {
            const moves = dataMoves.find(m => m.pokemon_id === poke.pokemon_id && m.form === poke.form);
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
            const typeEntry = (dataTypes || []).find(t => t.pokemon_id === poke.pokemon_id && t.form === poke.form);
            const speciesTypes = typeEntry ? typeEntry.type : [];
            var speciesObjectTypes = [];
            speciesTypes.forEach(element => {
                speciesObjectTypes.push(Type.type_by_name(element));
            });

            new Pokemon(
                poke.pokemon_id,
                poke.pokemon_name,
                poke.form,
                poke.base_attack,
                poke.base_defense,
                poke.base_stamina,
                chargedAttacks,
                fastAttacks,
                speciesObjectTypes
            );
        }
    }

    /**
     * Simule un combat entre deux Pokémons en utilisant des attaques rapides.
     * Affiche dans la console le déroulement du combat sous la forme d'un tableau.
     *
     * @param {string} pokemonNameA - Nom du premier Pokémon (commence le combat).
     * @param {string} pokemonNameB - Nom du second Pokémon.
     * @returns {void}
     */
    static fastFight(pokemonNameA, pokemonNameB) {
        const pokemonA = Pokemon.all_pokemons.find(p => p.name.toLowerCase() === pokemonNameA.toLowerCase());
        const pokemonB = Pokemon.all_pokemons.find(p => p.name.toLowerCase() === pokemonNameB.toLowerCase());

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
            const bestAttack = attacker.getBestFastAttacksForEnemy(false, defender.name);
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

    /**
     * Affiche la meilleure attaque rapide contre un Pokémon ennemi donné.
     * @param {Boolean} print 
     * @param {String} pokemonName
     * @return {Object} Un objet contenant l'attaque rapide la plus efficace, les points de dégâts par seconde (DPS) et le multiplicateur d'efficacité contre le Pokémon ennemi. 
     */
    getBestFastAttacksForEnemy(print, pokemonName) {
        const pokemon = Pokemon.all_pokemons.find(p => p.name.toLowerCase() === pokemonName.toLowerCase());
        if (!pokemon) {
            if (print) {
                console.table("Aucun Pokémon trouvé avec le nom " + pokemonName);
            }
            return;
        }

        
        const best = this.fast_attacks.reduce((bestSoFar, attack) => {
            let multiplier = 1;
            for (const defType of pokemon.getTypes()) {
                const effectiveness = Type.type_by_name(attack.type).efficiency[defType];
                if (effectiveness) {
                    multiplier *= effectiveness;
                }
            }
            const dps = (attack.power * multiplier) * (this.base_attack / pokemon.base_defense);
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
            console.table(`Meilleure attaque rapide de ${this.name} contre ${pokemonName} : ${best.attack.name} (${best.attack.type})`);
            console.table(`  Puissance: ${best.attack.power}, Multiplicateur: ${best.multiplier.toFixed(2)}, DPS: ${best.dps.toFixed(2)}`);
        }

        return { atk: best.attack, pts: best.dps, eff: best.multiplier };
    }

    /**
     * Affiche les types de Pokémon qui sont faibles contre une attaque donnée.
     * @param {string} attackName - Le nom de l'attaque pour laquelle trouver les faiblesses.
     * @returns {void}
     */
    static getWeakestEnemies(attackName) {
        const weakTypes = [];
        const effectiveness = Type.type_by_name(Attack.attack_by_name(attackName).type).efficiency;
        if (effectiveness) {
            for (const [enemyType, multiplier] of Object.entries(effectiveness)) {
                if (multiplier > 1) {
                    weakTypes.push(enemyType.toLowerCase());
                }
            }
        }
        const weakPokemons = Pokemon.all_pokemons.filter(p => p.getTypesLowerCase().some(a => weakTypes.includes(a.toLowerCase())));
        console.table("Liste des " + weakPokemons.length + " pokémons faibles face à l'attaque " + attackName + " (ceux ayant les types " + weakTypes + ") :");
        weakPokemons.forEach(weakToString => {
            console.table(weakToString.toString());
        });
    }

    /**
     * Affiche les Pokémons triés par type puis par nom.
     * Les Pokémons sans type sont affichés en premier, suivis des Pokémons triés par ordre alphabétique de leur type (si un Pokémon a plusieurs types, ceux-ci sont renvoyés dans un tableau trié par ordre alphabétique, si les deux Pokémons ont chacun deux types ont compare alors ces seconds types), puis par ordre alphabétique de leur nom.
     * @returns {void}
     */
    static sortPokemonsByTypeThenName() {
        const sortedPokemons = [...Pokemon.all_pokemons].sort((a, b) => {
            const typeA = a.getTypesLowerCase()[0] || "";
            const typeB = b.getTypesLowerCase()[0] || "";
            if (typeA === typeB) {
                if (a.getTypesLowerCase().length == b.getTypesLowerCase().length == 2){
                    return a.getTypesLowerCase()[1].localeCompare(b.getTypesLowerCase()[1]);
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
     * Affiche les attaques avec leurs détails, en indiquant si elles sont des attaques critiques ou non, et le nombre de Pokémons pouvant les apprendre.
     * Les attaques sont affichées dans l'ordre où elles ont été ajoutées à la classe Attack.
     * @returns {void}
     */
    static testPokemonToString() {
        let index=0;
        for (const attack of Attack.all_attacks) {
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
    static getPokemonsByType(typeName) {
        const temp = [];
        let toPrint = [];
        for (const pokemon of Pokemon.all_pokemons) {
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
    static getPokemonsByAttack(attackName) {
        const temp = [];
        let toPrint = [];
        const learners = Pokemon.all_pokemons.filter(p => p.getAttacks().some(a => a.name?.toLowerCase() === attackName?.toLowerCase()));

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
    static getAttacksByType(typeName) {
        let toPrint = [];
        const matches = Object.values(Attack.all_attacks).filter(attack => attack.type.toLowerCase() === typeName.toLowerCase());
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
}

export class Type{
    static all_types = {};
    constructor(type_name, efficiency){
        this._type_name = type_name;
        this._efficiency = efficiency;
        Type.all_types[type_name] = this;
    }

    toString(){
        return this._type_name + ' : ' + this.sortEfficencies();
    }

    sortEfficencies(){
        let result = [];
        let finalResult = [];
        let temp=[];
        for (const [key, value] of Object.entries(this._efficiency)) {
             if (!temp.includes(value)){
                result[temp.length] = [];
                result[temp.length][1] = key;
                result[temp.length][0] = value;
                temp.push(value);
            }else{
                result[temp.indexOf(value)][1]+= ', ' + key;
            }
        }
        finalResult = '';
        for (let elem in result){
            if (elem != 0){
                finalResult+= ', ';
            }
            finalResult+= result.sort().reverse()[elem][0] + ' = [' + result.sort().reverse()[elem][1] + ']'
        }
        return finalResult;
    }

    static fillTypes(data){
        for (const [key, value] of Object.entries(data)) {
            new Type(key, value);
        }
    }

    static get all_types(){
        for (let nType in Type.all_types){
            nType.toString();
        }
    }

    static type_by_name(typeName){
        return Type.all_types[typeName];
    }

    get type_name() {
        return this._type_name;
    }
    get efficiency() {
        return this._efficiency;
    }

    static get all_types() {
        return Type.all_types;
    }
}
