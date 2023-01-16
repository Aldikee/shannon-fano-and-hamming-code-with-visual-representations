function Node (value = null, frequency = 0) {
    this.value = value;           
    this.frequency = frequency;   
    this.leftChild = null;        
    this.rightChild = null;       
}

function compareNodes (a, b) {
    if (a.frequency > b.frequency) return -1;
    if (a.frequency < b.frequency) return 1;
    return 0;
}