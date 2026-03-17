class Type{
    static all_types=[]
    constructor(type_name, efficiency){
        this.type_name = type_name;
        this.efficiency = efficiency;
    }

    toString(){

    }

//     Bug : 1.6 = [Dark, Grass, Psychic], 1.0 = [Bug, Dragon, Electric,
// Ground, Ice, Normal, Rock, Water], 0.625 = [Fairy, Fighting, Fire,
// Flying, Ghost, Poison, Steel]
}

import type_effectiveness from '../data/type_effectiveness.js';

console.log(type_effectiveness);