var byteSequence
var decompressJson

function decode () {
    var fr = new FileReader()
    fr.onload = function() {
        var data = fr.result
        alert(data)
    }
    fr.readAsText($('#inputField').prop('files')[0])
    fr.onload = function() {
        byteSequence = fr.result


        var jsonFile = document.getElementById('decryptJson').files[0]

        fr = new FileReader()

        fr.onload = function() {
            fileContent = JSON.parse(fr.result)
        }
        fr.readAsText(jsonFile)
        fr.onload = function() {
            decompressJson = JSON.parse(fr.result)
            
            var cur = ""
            var answer = ""


            for (var i = 0; i < byteSequence.length; i++) {
                cur += byteSequence[i]
                if (cur in decompressJson) {
                    if( decompressJson[cur] == "<span class='aliasedChar'>space</span>") {
                        answer += " "
                    } else {
                        answer += decompressJson[cur]
                    }
                    cur = ""
                }
            }
            var answerBlob = new Blob([answer], {type: "text/plain;charset=utf-8"})
            var link = document.getElementById('downloadAnswer')
            link.href = window.URL.createObjectURL(answerBlob)
            link.download = 'decompressedFile'
            link.click()
        }
    }
}
