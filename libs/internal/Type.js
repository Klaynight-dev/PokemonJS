class Type{
    static all_types = [];
    constructor(type_name, efficiency){
        this.type_name = type_name;
        this.efficiency = efficiency;
        Type.all_types.push([type_name, efficiency]);
    }

    toString(){
        return this.type_name + ' : '
    }

//     Bug : 1.6 = [Dark, Grass, Psychic], 1.0 = [Bug, Dragon, Electric,
// Ground, Ice, Normal, Rock, Water], 0.625 = [Fairy, Fighting, Fire,
// Flying, Ghost, Poison, Steel]
}

import * as type_effectiveness from '../data/type_effectiveness.js';

function fillTypes(data){
    let tab = [];
    for (let nType in data){
        tab.push(new Type(Object.keys(type_effectiveness['type_effectiveness'])[nType], Object.values(Object.values(type_effectiveness['type_effectiveness']))[nType]));
    }
    return tab;
}
console.log(fillTypes(type_effectiveness['type_effectiveness']));
