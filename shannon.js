const inputView = document.getElementById("input");
const outputView = document.getElementById("output");
const encodeButton = document.getElementById("encode-button");
const errorDialog = new bootstrap.Modal(document.getElementById('modal'), {});
const tableWrapper = document.getElementById("table-wrapper");
const tableView = document.getElementById("table");
const downloadBar = document.getElementById("download-bar");
var jsonForDecompress = new Object();
var encoded;


inputView.addEventListener("keyup", event => {
    let inputString = filterSpaces(event.target.value);
});

encodeButton.addEventListener("click", () => {
    let inputString = inputView.value;

    inputString = filterSpaces(inputString);
    
    if (inputString === "") {
        errorDialog.show();
        return;
    }
    
    
    let frequencyTable = buildFrequencyTable(inputString);
    let huffmanTree = buildTree(frequencyTable, inputString);
    let codeTable = buildCodeTable(huffmanTree);
    let encodedString = encode(inputString, codeTable);
    
    hamming(encodedString);
    encoded = encodedString;

    outputView.textContent = encodedString;

    displayTree(huffmanTree);   

    displayTable(codeTable, frequencyTable);

});


function displayTree (root = {}) {
    let graph = new dagreD3.graphlib.Graph().setGraph({});
    console.log(root)

    dfs(root);

    function dfs (node) {
        if (node.leftChild == null && node.rightChild == null) {
            graph.setNode(node.value, {label: node.value, shape: "circle" });
            return node;
        }
        graph.setNode(node.value, { label: "", shape: "circle" });
        if (node.leftChild != null) {
            let child = dfs(node.leftChild);
            graph.setEdge(node.value, child.value, { label: "0" });
        }

        if (node.rightChild != null) {
            let child = dfs(node.rightChild);
            graph.setEdge(node.value, child.value, { label: "1" });
        }

        return node;
    }

    let svg = d3.select("svg"),
        inner = svg.select("g");

    let zoom = d3.zoom().on("zoom", event => inner.attr("transform", event.transform));
    svg.call(zoom);

    let render = new dagreD3.render();

    render(inner, graph);

    let initialScale = 0.75;
    svg.call(zoom.transform, d3.zoomIdentity.translate((parseInt(svg.style("width")) - graph.graph().width * initialScale) / 2, 20).scale(initialScale));

    svg.attr('height', graph.graph().height * initialScale + 40);
}

function displayTable (codeTable = {}, frequencyTable = {}) {
    let rows = [];
    for (const [char, code] of Object.entries(codeTable)) {
        rows.push({
            char: char,
            freq: frequencyTable[char],
            code: code,
            length: code.length
        });
    }


    rows.sort((a, b) => {
        if (a.length < b.length) return -1;
        if (a.length > b.length) return 1;
        return 0;
    });

    tableView.innerHTML = "";
    let sumSpaceS = 0;
    rows.forEach(row => {
        spaceSaving = row.freq * 8 - row.freq * row.length;
        sumSpaceS += spaceSaving;
        let html = `
            <tr>
                <td>${row.char}</td>
                <td>${row.freq.toFixed(5)}</td>
                <td>${row.code}</td>
            </tr>
        `;
        
        tableView.innerHTML += html;
        jsonForDecompress['' + row.code] = row.char;
    });

    let htmlDowload = `
    <div>Download: </div> 
    <a id="downloadFile" onclick="downloadFile()">
        <button class="btn btn-secondary">Binary Sequence</button>
    </a>
    <a id="downloadDecompressJson" onclick="downloadDecompressJson()">
        <button class="btn btn-secondary">JSON For Decrypt</button>
    </a>
    `;
downloadBar.innerHTML += htmlDowload;

    tableWrapper.style.display = "block";
}


function encode (inputString = "", codeTable = {}) {
    let ans = "";
    let n = inputString.length;
    for (let i = 0; i < n; i++) {
        ans += codeTable[ inputString[i] ];
    }
    return ans;
}


function buildCodeTable (root = {}) {
    let codeTable = {};
    dfs(root, "");
    function dfs (node, code) {
        if (node.leftChild === null && node.rightChild === null) {
            codeTable[node.value] = code;
            return;
        }

        if (node.leftChild !== null) dfs(node.leftChild, code + "0");
        if (node.rightChild !== null) dfs(node.rightChild, code + "1");
    }
    return codeTable;
}

function buildTree (table = {}, inputString = '') {
    let unique = Array.from(new Set(inputString));

    let node = new Node(inputString, table[inputString]);
    if (inputString.length <= 1) {
        return node;
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
          let j = Math.floor(Math.random() * (i + 1)); 
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    



    unique = shuffle(unique); // Fisher-Yates Shuffle (randomize element of array)



    // for (let i = 0; i < unique.length; i++) {      //sorting by frequency
    //     for (let j = 0; j < unique.length; j++) {
    //         if (table[unique[j]] > table[unique[j + 1]]) {
    //             let temp = unique[j];
    //             unique[j] = unique[j + 1];
    //             unique[j + 1] = temp; 
    //         }
    //     }
    // }


    let sum = 0;
    for (let i = 0; i < unique.length; i++) {
        sum += table[unique[i]];
    }

    let s = 0;
    
    let t = -1;
    
    for (let i = 0; i < unique.length; i++) {
        s += table[unique[i]]
        if (s > (0.499999 * sum)) {
            t = i + 1;
            break;
        }
    }

    let tableLeft = {};
    let tableRight = {};
    if (Object.keys(table).length == 2) {
        tableLeft[unique[0]] = table[unique[0]];
        tableRight[unique[1]] = table[unique[1]];
    } else {
        for (let i = 0; i < unique.length; i++) {
            let char = unique[i];
            if (i < t) {
                tableLeft[char] = table[char];
            }
            else {
                tableRight[char] = table[char]
            }
        }
    }
    

    node = new Node(unique, sum);
    if (unique.length == 2) {
        node.leftChild = buildTree(tableLeft, unique.join('').slice(0, 1));
        node.rightChild = buildTree(tableRight, unique.join('').slice(1, 2));
    } else {
    node.leftChild = buildTree(tableLeft, unique.join('').slice(0, t));
    node.rightChild = buildTree(tableRight, unique.join('').slice(t, unique.length));
    }

    return node;


}

function buildFrequencyTable (inputString = "") {
    let table = {};
    let n = inputString.length;
    for (let i = 0; i < n; i++) {
        let char = inputString[i];
        if (!table.hasOwnProperty(char)) table[char] = 0;
        table[char]++;
    }
    let table1 = table;
    for (let i = 0; i < n; i++) {
        let char = inputString[i];
        if (table[char] >= 1) table[char] = table[char] / n
    }
    return table;
}


function filterSpaces (inputString = "") {
    let ans = "";
    let n = inputString.length;
    for (let i = 0; i < n; i++) {
        let char = inputString[i];
        if (char !== " " && char !== "\n") ans += char;
    }
    return ans;
}


function downloadFile() {
    var link = document.getElementById('downloadFile')
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(encoded)
    link.setAttribute('download', 'shannon-fano')
}

function downloadDecompressJson() {
    var link = document.getElementById('downloadDecompressJson')
    link.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonForDecompress))
    link.setAttribute('download', 'decrypt')
}
