const errorView = document.getElementById("withError");
const explView = document.getElementById('explanation');
const correctView = document.getElementById('correct');

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

function hamming(encodedString) {
    let data = encodedString;

    let m = data.length;
    
    let r = calcRedundantBits(m);
    
    let arr = posRedundantBits(data, r);
    console.log(data)
    
    arr = calcParityBits(arr, r);
    
    console.log("Data transferred is " + arr);
    
    arr = arr.split('');

    let rand = getRandomInt(arr.length - 1);
    if (parseInt(arr[rand]) == 0) {
        arr[rand] = '1'
    } else {
        arr[rand] = '0'
    }

    arr = arr.join('');
    

    errorView.textContent = arr;

    console.log("Error Data is " + arr);
    let correction = detectError(arr, r);
    if(correction==0) {
        console.log("There is no error in the received message.");
        explView.textContent = "There is no error in the received message.";
    }
    else {
        let correctArr = arr.split("");
        if (parseInt(correctArr[arr.length-correction]) == 0) {
            correctArr[arr.length-correction] = '1'
        } else {
            correctArr[arr.length-correction] = '0'
        }
        let expl = "The position of error is " + (arr.length-correction+1).toString() + " from the left";
        explView.textContent = expl;
        correctView.textContent = correctArr.join('');
        console.log("The position of error is ",arr.length-correction+1,"from the left\nData should be " + correctArr.join(''));
    }
}


function reverseString(str) {
    return str.split("").reverse().join("");
}

function calcRedundantBits(m) {
    for (let i = 0; i < m; i++) {
        if (Math.pow(2, i) >= m + i + 1) {
            return i;
        }
    }
}

function posRedundantBits(data, r) {
    let j, k, m, res;
    let dataReverse = reverseString(data);
    j = 0;
    k = 0;
    m = data.length;
    res = '';
    
    for (let i = 1; i < (m + r + 1); i++) {
        if (i == Math.pow(2, j)) {
            res += '0';
            j++;
        } else {
            res += dataReverse[k];
            k++;
        }
    }
    
    let reverseRes = reverseString(res)
    // console.log(res)
    return reverseRes;
}


function calcParityBits(arr, r) {
    let n = arr.length;
    for (let i = 0; i < r; i++) {
        val = 0;
        for (let j = 1; j < n + 1; j++) {
            if ((j & Math.pow(2, i)) == Math.pow(2, i)) {
                let reverseArr = reverseString(arr);
                val ^= parseInt(reverseArr[j - 1]);
            }
        }
        arr = arr.slice(0, n - Math.pow(2, i)) + val.toString() + arr.slice(n - Math.pow(2, i) + 1);
    }
    return arr;
}

function detectError(arr, nr) {
    let n, res;
    let reverseArr = reverseString(arr);
    n = arr.length;
    res = 0;

    for (let i = 0; i < nr; i++) {
        val = 0;
        for (let j = 1; j < n + 1; j++) {
            if ((j & Math.pow(2, i)) == Math.pow(2, i)) {
                val ^= parseInt(reverseArr[j - 1]);
            }
        }
        res += val * Math.pow(10, i);
    }
    return parseInt(res, 2);
}



