const _ = require('lodash');
const filterBehavior = require('./filter-behavior');
const tagExpression = require('./tagExpression');

/**
 *
 * @param oldTag
 * @param newTag
 * @param tagColorMap
 * @description Utility method to update tagColorMap with new tag sourceKey,
 * mainly used in class template scenario.
 */
function updateTagColorMap(oldTag, newTag, tagColorMap) {
	_.forEach(tagColorMap, (tagStyle, tagSourceKey) => {
		if (tagSourceKey === oldTag.sourceKey) {
			tagColorMap[newTag.sourceKey] = tagStyle;
		}
	});
	// delete old source key for tag if it is different
	if (oldTag.sourceKey !== newTag.sourceKey) {
		delete tagColorMap[oldTag.sourceKey];
	}
}

module.exports = {
	updateTagColorMap: updateTagColorMap,
	filterBehavior,
	tagExpression
};
