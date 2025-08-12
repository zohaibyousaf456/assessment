// Online Javascript Editor for free
// Write, Edit and Run your Javascript code using JS Online Compiler
function flattenArray(arr, result= []){
    for (let i=0; i<arr.length;i++){
        if(Array.isArray(arr[i])){
            flattenArray(arr[i], result);
        }else {
            result[result.length] = arr[i];
        }
    }
    return result;
}

console.log(flattenArray([1, [2, 3], 4]));
console.log(flattenArray([1, [2, [3, 4], 5], 6]));
console.log(flattenArray([[1], [[2]], [[[3]]]]));