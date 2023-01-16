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
    let huffmanTree = buildTree(frequencyTable);
    let codeTable = buildCodeTable(huffmanTree);
    let encodedString = encode(inputString, codeTable);
    hamming(encodedString);
    encoded = encodedString;

    outputView.textContent = encodedString;

    displayTree(huffmanTree);

    displayTable(codeTable, frequencyTable);

});


function displayTree (root = {}) {
    console.log(root)
    let graph = new dagreD3.graphlib.Graph().setGraph({});

    dfs(root);

    function dfs (node) {
        if (node.leftChild === null && node.rightChild === null) {
            graph.setNode(node.value, { label: node.value, shape: "circle" });
            return node;
        }

        graph.setNode(node.value, { label: "", shape: "circle" });

        if (node.leftChild !== null) {
            let child = dfs(node.leftChild);
            graph.setEdge(node.value, child.value, { label: "0" });
        }

        if (node.rightChild !== null) {
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
                <td>${row.freq}</td>
                <td>${row.code}</td>
                <td>${row.freq} * 8 - ${row.freq} * ${row.length} = ${spaceSaving}</td>
            </tr>
        `;
        tableView.innerHTML += html;
        jsonForDecompress['' + row.code] = row.char;
    });
    let html = `
    <tr>
        <td></td>
        <td></td>
        <td></td>
        <td>${sumSpaceS}</td>
    </tr>
`;
    tableView.innerHTML += html;



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

function buildTree (table = {}) {
    let queue = buckets.PriorityQueue(compareNodes);
    let entries = Object.entries(table);
    for (const [char, freq] of entries) {
        queue.add(new Node(char, freq));
    }
    
    while (queue.size() > 1) {
        let smallerNode = queue.dequeue(),
            biggerNode = queue.dequeue();
        
        let root = new Node(
            biggerNode.value + smallerNode.value,
            smallerNode.frequency + biggerNode.frequency
        );
        root.rightChild = smallerNode;
        root.leftChild = biggerNode;

        queue.enqueue(root);
    }

    let root = queue.peek();
    if (root.leftChild === null && root.rightChild === null) {
        let ans = new Node(root.value, root.frequency);
        ans.leftChild = root;
        return ans;
    }

    return queue.peek();
}

function buildFrequencyTable (inputString = "") {
    let table = {};
    let n = inputString.length;
    for (let i = 0; i < n; i++) {
        let char = inputString[i];
        if (!table.hasOwnProperty(char)) table[char] = 0;
        table[char]++;
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
    link.setAttribute('download', 'huffmanEncoded')
}

function downloadDecompressJson() {
    var link = document.getElementById('downloadDecompressJson')
    link.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonForDecompress))
    link.setAttribute('download', 'decrypt')
}
