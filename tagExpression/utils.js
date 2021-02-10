const _ = require('lodash');
const { LexerParser, LexerToken } = require('./LexerParser');

/**
 * Helper method to convert Tag expressions with tag names having special chars to
 * Lexer Parser safe format, and provide mapping back to tag names after parsing
 * @param formula - current formula to be parsed
 * @param tagNames - list of valid existing tags
 *
 * @returns {object} -> Contains LexParser safe tag expression and tagToUniqueID mapping
 *
 *  { 	
 * 		originalFormula: string,
 * 		lexSafeFormula: string,
 * 		tagNameToUniqueIDMap:Map<string, string>,
 * 		allTagsValid: boolean	
 *  }
 * tagNameToUniqueIDMap : key -> Tag Identifier is the special character trimmed in the original Tag
 * tagNameToUniqueIDMap : value -> Mapped TagName
 *
 * @private
 */
function getLexParserSafeTagFormula(formula, tagNames) {

    const assetTagRegex =
        // eslint-disable-next-line no-useless-escape
        /(?:(?:\$)(?:(?!\|).)*)(?:\|)((?:(?![\s\/\+\-\*\^\%\>\<\=\(\)\,][\$\&][\w].+?\|).)*\|)/gmi;
    const listOfMatchedGroups = [];
    while (null !== (matchTag = assetTagRegex.exec(formula))) {
        listOfMatchedGroups.push(matchTag);
    }
    const tagMapToUniqueTagID = new Map();
    let formulaForTheLexerParser = '';
    let lastIndexReplaced = 0;

    // eslint-disable-next-line no-useless-escape
    const specialCharRegex = /[\#\$\.\,\+\?\|\&\-\_\=\>\^\@\(\)\[\]\\\/\'\%\!\*\`\{\}\~\<\"\:\;]/g;

    const lengthOfMatchedGroups = listOfMatchedGroups.length;

    let allTagsValid = true;
    // At least one asset-tag match exists in the expression
    if (lengthOfMatchedGroups > 0) {
        listOfMatchedGroups.every((currentValue, currentIndex) => {
    
            if (Array.isArray(currentValue) && currentValue.length > 0 && currentValue[0]) {
            const curParsedAssetTag = (currentValue[0]);
            const firstIndexOfPipe = curParsedAssetTag.indexOf(LexerToken.SPECIALCHAR.TAG);
            const lastIndexOfPipe = curParsedAssetTag.lastIndexOf(LexerToken.SPECIALCHAR.TAG);
            const extractedCurTag = curParsedAssetTag.slice(firstIndexOfPipe + 1, lastIndexOfPipe);
            const findExtractedTagInListOfTagNamesIndex = _.findIndex(tagNames,
                tagName => tagName === extractedCurTag);
            if (findExtractedTagInListOfTagNamesIndex > -1) { // tag is valid
    
                let trimmedExtractedCurrentTag = extractedCurTag.replace(specialCharRegex, '\\$&');
                trimmedExtractedCurrentTag = trimmedExtractedCurrentTag.replace(specialCharRegex, '');
    
                const currentRegexMatchIndexInTagExprString = currentValue.index;
                const uniqueTagNameWithMatchIndex =
                    trimmedExtractedCurrentTag + currentRegexMatchIndexInTagExprString;
                // set the tagName to unique tag Identifier lookup map
                // key - tagName trimmed with no special chars + assetTagRegex match index
                // value - original tagName in the formula
                tagMapToUniqueTagID.set(uniqueTagNameWithMatchIndex, extractedCurTag);
    
                // Till the first pipe of current tag from the whole formula text
                const lastIndexPriorToReplace = currentRegexMatchIndexInTagExprString + firstIndexOfPipe + 1;
                formulaForTheLexerParser = formulaForTheLexerParser +
                    formula.slice(lastIndexReplaced, lastIndexPriorToReplace) + uniqueTagNameWithMatchIndex;
                // Till the last pipe current tag from the whole formula text
                lastIndexReplaced = (currentRegexMatchIndexInTagExprString + curParsedAssetTag.length) - 1;
    
                // End of Matches, last match, add rest of remaining string
                if (currentIndex === lengthOfMatchedGroups - 1) {
                    formulaForTheLexerParser += formula.slice(lastIndexReplaced);
                }
    
                } else {
                    // One of the tags is not valid
                    allTagsValid = false;
                }
            }
            return allTagsValid;
        });

    } else {
        // No matches
        allTagsValid = false;
    }

    return { originalFormula: formula,
        lexSafeFormula: formulaForTheLexerParser,
        tagNameToUniqueIDMap: tagMapToUniqueTagID,
        isValidExpression: allTagsValid };
}

/**
 * getParsedSrcKeyFormula
 * Get parsed 'srcKeyFormula' - using 'LexerParser' includes support for special characters in tag names
 * created this fn to address 'DE146572'
 * @param formula, tagNames
 * @returns srcKeyFormula (parsed Formula)
 */
function getParsedSrcKeyFormula(formula, tagNames) {
    let srcKeyFormula = formula;
    try {
        if (LexerParser && !_.isEmpty(formula)) {
            const { lexSafeFormula, tagNameToUniqueIDMap, isValidExpression } =
                getLexParserSafeTagFormula(formula, tagNames);

            const trimmedTagsFormula = isValidExpression && lexSafeFormula ? lexSafeFormula : formula;
            const parser = new LexerParser();

            const tokens = parser.lex(trimmedTagsFormula);

            srcKeyFormula = _.reduce(tokens, (res, token) => {
                // Start: Handle Special Characters
                if (token.t === LexerToken.TYPE.TAG && isValidExpression) {
                // Replace the tag token with the original tag name
                const tagTokenObject = parser.getTagTokens(token.c);
                // e.g tagTokenObject.tag -> |DWATT80|
                const uniqueTrimmedTagNameWithPipes = tagTokenObject.tag;
                // e.g uniqueTrimmedTagName-> DWATT80
                const uniqueTrimmedTagName = uniqueTrimmedTagNameWithPipes
                    && uniqueTrimmedTagNameWithPipes.slice(1, uniqueTrimmedTagNameWithPipes.length - 1);
                const actualTagName = tagNameToUniqueIDMap &&
                    tagNameToUniqueIDMap.get(uniqueTrimmedTagName);
                if (actualTagName) {
                    const actualTagNameWithPipes =
                        `${LexerToken.SPECIALCHAR.TAG}${actualTagName}${LexerToken.SPECIALCHAR.TAG}`;
                    // e.g token.c $assetName|DWATT80| replace |DWATT80| WITH |DWATT|
                    // eslint-disable-next-line no-param-reassign
                    token.c = token.c.replace(uniqueTrimmedTagNameWithPipes, () => actualTagNameWithPipes);
                }
            }
            // End: Handle Special Characters				
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

