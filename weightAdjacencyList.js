const WeightGraph = require('./weightGraph');
const LinkedList = require('./linkedList.js')

class WeightAdjacencyList extends WeightGraph { // Classe Base para Grafos
    constructor(inputPath) {
        super(inputPath);
    }; 
    
    fillStruct(v1, v2, weight, struct) {
        // Cada elemento da lista de vértices adjacentes será um array onde o primeiro elemento será o 
        // vértice vizinho e o segundo elemento será o peso da aresta (element: [adj vertex, weight])
        struct[v1 - 1].append([v2, weight]); // Adiciona v2 e o peso da aresta a lista de Adj de v1
        struct[v2 - 1].append([v1, weight]); // Adiciona v1 e o peso da aresta a lista de Adj de v2

        return struct;
    };

    buildInitialStruct(n) {
        // Vértices associados a um vetor de dimensão n (número de vértices no grafo)
        let struct = new Array(n);
        for (let i = 0 ; i < n ; i++) {
            struct[i] = new LinkedList(); // Cada vértice possui uma lista de vértices adjacentes
        };
        return [this.fillStruct, struct];
    };
};

module.exports = WeightAdjacencyList; // Export class