const { LexerParser } = require('./LexerParser');

/**
 * getParsedSrcKeyFormula
 * Get parsed 'srcKeyFormula' - using 'LexerParser'
 * created this fn to address 'DE146572'
 * @param formula
 * @private
 */
function getParsedSrcKeyFormula(formula) {
    let srcKeyFormula = formula;
    try {
        if (LexerParser && !_.isEmpty(formula)) {
            const tokens = new LexerParser().lex(formula);
            srcKeyFormula = _.reduce(tokens, (res, token) => {
                // eslint-disable-next-line no-param-reassign
                res += token.c;
                return res;
            }, '');
        }

        // 'formula' or 'LexerParser' is not available
        // return 'formula' as 'srcKeyFormula'
        return srcKeyFormula;
    } catch (err) {
        // Failed to parse 'srcKeyFormula'
        // return 'formula' as 'srcKeyFormula'
        return srcKeyFormula;
    }
}


module.exports = {
    getParsedSrcKeyFormula
};

