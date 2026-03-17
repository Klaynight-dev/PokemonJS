import * as type_effectiveness from '../data/type_effectiveness.js';

function fillTypes(data){
    let tab = [];
    for (let nType in data){
        tab.push(new Type(Object.keys(type_effectiveness['type_effectiveness'])[nType], Object.values(Object.values(type_effectiveness['type_effectiveness']))[nType]));
    }
    return tab;
}
console.log(fillTypes(type_effectiveness['type_effectiveness']));
