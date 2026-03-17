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