const _ = require('lodash');

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
	delete tagColorMap[oldTag.sourceKey];
}

module.exports = {
	updateTagColorMap: updateTagColorMap
};
