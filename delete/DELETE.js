//Problem Statement:
// Write a function in JavaScript that accepts an array of integers and a number X as parameters, when invoked, returns an array of unique indices of two numbers whose sum is equal to X.
// For example: [1, 3, 4, 5, 6, 8, 10, 11, 13], Sum: 14
// Pairs of indices: [0, 8], [1, 7], [2, 6], [4, 5]

const testArray = [1, 3, 4, 5, 6, 8, 10, 11, 13];
const testSum = 14;

// @param {number[]} arr
// @param {number} sum
// @return {number[]}
const findIndicesOfSummands = (arr, sum) => {

    const indices = [];
    const map = {};
    
    //using brute force method as requested, iterate through every possible combination of numbers in the array
    // O(n squared) time complexity, and O(n) space complexity. Definitely could be optimized.
    for(let i = 0; i < arr.length; i++) {
        if(map[arr[i]] !== undefined) {
            map[sum - arr[i]] = i;
            indices.push([map[arr[i]], i]);
        } else {
            map[sum - arr[i]] = i;
        }
    }
    console.log(map)

    return indices;
}

console.log(findIndicesOfSummands(testArray, testSum));