const fs = require('fs');
const os = require('os');
const LinkedList = require('./linkedList.js')


class Graph { // Classe Base para Grafos
    constructor(inputPath) {
        this.type = this.constructor.name;
        [this.n, this.m, this.degreeArray, this.degreeSum, this.struct] = this.readInput(inputPath);
        [this.maxDegree, this.minDegree, this.averageDegree, this.medianDegree] = this.getDegreeInfo();
    }
 
    writeOutput(textList) { // Função que escreve no arquivo output.txt
        fs.appendFileSync('output.txt', '\n');        
        for (let i = 0; i < textList.length; i++) {
            fs.appendFileSync('output.txt', `${textList[i]}`);
        }
    }

    buildInitialStruct(n) {
        let struct;
        switch(this.type) {
            case 'AdjacencyMatrix':
                // Inicializa matriz de zeros com 2 iterações (linha x Coluna)
                struct =  new Array(n);
                for (let i = 0 ; i < n ; i++){
                    struct[i] = new Array(n)
                    for (let j = 0 ; j < n ; j++){
                        struct[i][j] = 0;
                    } 
                }
                return [this.fillAdjacencyMatrix, struct];
            case 'AdjacencyList':
                struct = new Array(n);
                for (let i = 0 ; i < n ; i++){
                    struct[i] = new LinkedList();
                }
                return [this.fillAdjacencyList, struct];
            case 'AdjacencyVector':
                struct = new Array(n);
                for (let i = 0 ; i < n ; i++){
                    struct[i] = []
                }
                return [this.fillAdjacencyVector, struct];
        }
    }

    readInput(inputPath) {
        let data = fs.readFileSync(inputPath, 'utf8'); // Faz a leitura do arquivo de input
        data = data.split(/\n/); // Armazena cada linha do arquivo em um vetor
   
        // Define num. de vértices
        const n = parseInt(data[0]);
        // Define num. de arestas
        const m = data.length - 1; // O número de arestas será o tamanho do vetor menos 1 (linha que informa o número de vértices do grafo)
        
        // Inicializa variável com a soma dos graus
        let degreeSum = 0;
        // Inicializa vetor com o grau de cada vértice e variáveis com índice máximo e mínimo
        let degreeArray = new Array(n);
        for (let i = 0 ; i < n ; i++) {
            degreeArray[i] = 0;
        }

        // Constrói e retorna a estrutura inicial  e o método de preenchimento para cada uma das representações
        let [fillMethod, struct] = this.buildInitialStruct(n);

        // Preenche uma das tres Estruturas, vetor de graus e a soma dos graus
        for (let i = 1; i < m + 1 ; i++) {

            let [v1,v2] = this.getNumbers(data[i])
            
            
            struct = fillMethod(v1, v2, struct); // Cada estrutura de dados preenchida com um metodo proprio 
            
            degreeArray[v1] += 1;
            degreeArray[v2] += 1;
            degreeSum += 2;
        }

        return [n, m, degreeArray, degreeSum, struct]
    }
    
    getNumbers(Str){
        let [num1,num2] = ["",""]
        let flag = 0
        
        for (let i = 0; i < Str.length; i++){
            if (Str[i] == " ") flag = 1
            if (flag == 0) num1 = num1.concat(Str[i])
            else{ // Flag = 1
                num2 = num2.concat(Str[i])
            }
        }
        return [parseInt(num1) - 1 ,parseInt(num2) - 1] // Subtrai 1, pois vértice x equivale a (x-1) na matriz
    }

    getDegreeInfo() {
        // Tornar mais eficiente: https://stackoverflow.com/questions/1063007/how-to-sort-an-array-of-integers-correctly
        // Funcao usada para ordenacao (.sort(f)) utiliza algoritmo Timsort, com complexidade O (nlogn) 
        const sortedDegreeArray = this.degreeArray.sort(function(a, b) {
            return a - b;
        });

        const maxDegree = sortedDegreeArray[this.n - 1]; // Subtraimos 1 porque o índice da lista inicia pelo zero
        const minDegree = sortedDegreeArray[0];
        const averageDegree = this.degreeSum / this.n;

        let medianDegree;
        const i = Math.floor(sortedDegreeArray.length / 2); // Divide o comprimento do array por 2. Se for decimal, arredonda para baixo
        if (this.n % 2 === 0) { // Se o número de elementos é par
            // A mediana será a soma dos dois índices ao centro dividido por 2
            medianDegree = ((sortedDegreeArray[i]) + (sortedDegreeArray[i - 1])) / 2; 
        } else { // Se é ímpar
            medianDegree = sortedDegreeArray[i]; // A mediana será igual ao elemento do centro
        }; 

        return [maxDegree, minDegree, averageDegree, medianDegree]
    }

    fillAdjacencyMatrix(v1, v2, struct) {
        struct[v1][v2] = 1; // Seta v1 --> v2
        struct[v2][v1] = 1; // Seta v2 --> v1

        return struct;
    }

    fillAdjacencyList(v1, v2, struct) {
        struct[v1].append(v2 + 1); // Adiciona v2 a lista de Adj de v1
        struct[v2].append(v1 + 1); // Adiciona v1 a lista de Adj de v2

        return struct;
    }
    fillAdjacencyVector(v1, v2, struct) {
        struct[v1].push(v2 + 1); // Adiciona v2 a lista de Adj de v1
        struct[v2].push(v1 + 1); // Adiciona v1 a lista de Adj de v2

        return struct;
    }

    getGraphInfo() {
        this.writeOutput(['--- Informações sobre o Grafo ---'])
        this.writeOutput([`Número de vértices: ${this.n}`])
        this.writeOutput([`Número de arestas: ${this.m}`])
        this.writeOutput([`Grau mínimo: ${this.minDegree}`])
        this.writeOutput([`Grau máximo: ${this.maxDegree}`])
        this.writeOutput([`Grau médio: ${this.averageDegree}`])
        this.writeOutput([`Mediana de grau: ${this.medianDegree}`])
    }

    bfs(s) {
        this.writeOutput(['--- Ouput BFS ---'])
        // Desmarcar todos os vértices com o valor de -1. Isso porque o markupVector receberá o nível de cada vértice
        let markupVector = new Array(this.n);
        for (let i = 0 ; i < this.n ; i++){
            markupVector[i] = Infinity;
        }
        //Definir maxLayer, que será a maior camada gerada na Busca.
        let maxLayer = 0
        // Definir fila Q vazia
        let q = [];
        // Marcar s e inserir s na fila Q
        markupVector[s - 1] = 0; // Subtraimos 1 porque o índice do vetor começa em zero
        q.push(s - 1); // Subtraimos 1 porque o índice dos vértices na matriz começa em zero

        this.writeOutput([`Nível ${markupVector[s - 1]}: `, `Vértice ${s} (raíz)`]) // Imprime o nó raíz

        // O loop funciona de forma distinta para cada uma das estruturas, por isso estão definidos em cada uma das subclasses
        return [q, markupVector, maxLayer];
    }

    dfs(s){
        this.writeOutput(['--- Ouput DFS ---'])
        // Desmarcar todos os vértices com o valor de -1. Isso porque o markupVector receberá o nível de cada vértice
        let markupVector = new Array(this.n);
        for (let i = 0 ; i < this.n ; i++){
            markupVector[i] = Infinity;
        }
        //Definir maxLayer, que será a maior camada gerada na Busca.
        let maxLayer = 0
        // Definir pilha Q vazia
        let q = [];
        // Marcar s e inserir s na pilha Q
        markupVector[s - 1] = 0; // Subtraimos 1 porque o índice do vetor começa em zero
        q.push(s - 1); // Subtraimos 1 porque o índice dos vértices na matriz começa em zero

        this.writeOutput([`Nível ${markupVector[s - 1]}: `, `Vértice ${s} (raíz)`]) // Imprime o nó raíz
        
        // O loop funciona de forma distinta para cada uma das estruturas, por isso estão definidos em cada uma das subclasses
        return [q, markupVector, maxLayer];
    }

    distance(u, v) {
        const layers = this.bfs(u)[0]; // Definindo origem como vértice "u" (poderia ser "v" também)
        return layers[v - 1]; // Vértices pertencentes a camada Li têm distância i da origem
    }

    diameter() {
        // O diâmetro será maior distância entre qualquer par de vértices do grafo, sendo que a maior distância entre v e um vértice qualquer é retornada pela BFS.
        // Então, realizamos uma BFS em cada vértice, e escolhemos a maior distância (v,u) como diâmetro
        let max = 0;
        for (let v = 1 ; v <= this.n ; v++) { // É necessário executar a bfs para cada vértice 
            let currentMax = this.bfs(v)[1]
            max = (currentMax > max) ? currentMax : max 
        }
        return max;
    }

    estimateDiameter(k) {
        let max = 0;
        for (let i = 1; i <= k; i++) {
            let v = Math.floor(Math.random() * this.n) + 1; // Escolhe vértice aleatório do grafo

            let currentMax = this.bfs(v)[1]; // Executa bfs para cada vértice aleatório
            max = currentMax > max ? currentMax : max;
        }
        return max;
    }

    connectedComponents() {
        // Vetor de marcação para vértices que já estão em uma componente conexa já identificada
        let markupVector = new Array(this.n);
        for (let i = 0 ; i < this.n ; i++){
            markupVector[i] = Infinity;
        }
        // Vetor que armazena um objeto tamanhos das componentes conexas e a marcação correspondente
        let componentSizes = [];
        // Variável de marcação 
        let mark = 0;
        // Declaração dos vetores para armazenar o vetor de marcação da bfs e o tamanho de cada componente
        let layers;
        let size;

        // Itera sobre o vetor de marcação
        for (let i = 0; i < markupVector.length; i++) {
            if (markupVector[i] === Infinity) {
                size = 0;
                layers = this.bfs(i + 1)[0];

                // Iteramos sobre o vetor de marcação da bfs
                for (let k = 0; k < layers.length; k++) {
                    if (layers[k] !== Infinity) { // Se o vértice estiver marcado da bfs
                        size ++;
                        markupVector[k] = mark; // Marca os vetores com marcações distintas
                    }
                }

                componentSizes.push({ size, mark }); // Armazena o objeto no vetor
                mark++; // Incrementa a variável de marcação
            }
        }

        // Ordena o vetor de tamanhos
        componentSizes = componentSizes.sort(function(a, b){
            return b.size - a.size;
        });
        // Retorna em ordem decrescente cada uma das componentes
        for (let i = 0; i < componentSizes.length; i++) {
            let vertexes = [];
            for (let k = 0; k < markupVector.length; k++) {
                if (markupVector[k] === componentSizes[i].mark) {
                    vertexes.push(k);
                }
            }

            this.writeOutput([`Componente de tamanho ${componentSizes[i].size}: ` , vertexes]);
        }
    }
}

module.exports = Graph; // Export class

