const stakeFunction = (selectedNumbers, amount) => {
    const determiner = selectedNumbers - 1;
    const permTotal = (selectedNumbers * determiner) * amount;
    return permTotal / 2;
}


module.exports = {
    stakeFunction
}