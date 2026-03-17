export class Attack {
    static all_attacks = [];

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
        this.id = move_id;
        this.name = name;
        this.type = type;
        this.power = power;
        this.duration = duration;
        this.energy_delta = energy_delta;
        this.critical_chance = critical_chance;
        this.stamina_loss_scaler = stamina_loss_scaler;
        this.isCriticalAttack = critical_chance > 0;
        Attack.all_attacks.push(this);
    }

    toString() {
        return this.name + " : #" + this.id + ", " + this.type + ", "
        + this.power + ", " + this.duration + "ms";
    }

    static fill_attacks(data) {
        for (const attack_data of data) {
            new Attack(attack_data.critical_chance, attack_data.duration, attack_data.energy_delta,
                attack_data.move_id, attack_data.name, attack_data.power, attack_data.stamina_loss_scaler,
                attack_data.type);
        }
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

    constructor(pokemon_id, pokemon_name, form, base_attack, base_defense, base_stamina, charged_attacks) {
        this.id = pokemon_id;
        this.name = pokemon_name;
        this.form = form;
        this.base_attack = base_attack;
        this.base_defense = base_defense;
        this.base_stamina = base_stamina;
        this.charged_attacks = charged_attacks;
        Pokemon.all_pokemons.push(this);
    }

    toString() {
        return this.name + " : #" + this.id + ", " + this.form
        + ", [" + this.base_attack + " ATK, " + this.base_defense + " DEF, "
        + this.base_stamina + " STA], Rapides = " + this.rapidity
        + ", Chargés = " + this.charged_attacks.length;
    }

    getTypes() {
        const types = [];
        for (const attack of this.charged_attacks) {
            if (!types.includes(attack.type)) {
                types.push(attack.type);
            }
        }
        return types;
    }

    getAttacks() {
        const attacks = [];
        for (const attack of this.charged_attacks) {
            if (!attacks.includes(attack)) {
                attacks.push(attack);
            }
        }
        return attacks;
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
}

export class Type{
    static all_types = [];
    constructor(type_name, efficiency){
        this.type_name = type_name;
        this.efficiency = efficiency;
        Type.all_types.push([type_name, efficiency]);
    }

    toString(){
        return this.type_name + ' : '
    }

    get type_name() {
        return this._type_name;
    }
    get efficiency() {
        return this._efficiency;
    }
}
