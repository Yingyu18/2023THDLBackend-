function rawTable (data) {
    data = data.split('\n')
   
    var sli = 0;
    if(data[4][0].substring(0,1) == '"'){sli=0}
    for (let i=0; i<data.length; i++){
        let row =data[i].split(',')
        if(sli !=0 && i>=3){
            row.forEach(function(ele, index, row){
                row[index] = row[index].slice(sli, -sli)
            })
        }
        result[i] = row
    }
    return result
}
