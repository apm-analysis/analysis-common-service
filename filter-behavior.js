// Consolidated Filter Logic moved from Analysis Data Service

const _ = require('lodash');
const DEFAULT_CBF_MIN_MAX = -999999999990;

/**
 * Apply CBFs and VBFs
 *
 * @param data - TS response data
 * @param data.queries - array of results to filter
 * @param data.queries[].results[] - array of results (typically one)
 * @param data.queries[].results[].name - sourceKey
 * @param data.queries[].results[].cbfOnly - (optional) boolean - true if this result is included for CBF only
 * @param data.queries[].results[].values - array of data values
 * @param filters - array of filter specs
 * @param filters[].sourceKey -{String} tag source key
 * @param filters[].conditional -{Boolean} true if CBF
 * @param filters[].muted - boolean TRUE if filter is muted (optional)
 * @param filters[].inverted - {Boolean} true if filter is inverted
 * @param filters[].selectedStringValue - {Object} - empty if number filter, { val: <String> } for cbf string filter
 * @param filters[].min - {number} min value filter range
 * @param filters[].max - {number} max value filter range
 *
 * @private
 */
function _filterData(data, filters) {

	// create a map of results for easier processing
	// also get the min and max timestamp for all datasets
	let filteredChartData;
	const tsMinMax = { min: undefined, max: undefined };
	const unfilteredDataMap = {};
	_.forEach(data.queries, (query) => {
		unfilteredDataMap[query.results[0].name] = query.results[0];
	_.forEach(query.results, (result) => {
		_.forEach(result.values, (value) => {
		tsMinMax.min = tsMinMax.min ? Math.min(tsMinMax.min, value[0]) : value[0];
	tsMinMax.max = tsMinMax.max ? Math.max(tsMinMax.max, value[0]) : value[0];
});
});
});



	// if there are no filters that apply to these results, skip the filtering.
	if (!_.isEmpty(filters)) {

		const conditionalFilters = _.filter(filters, 'conditional');
		const valueFilters = _.filter(filters, { 'conditional': false });

		// process conditional filters - sets up an array of date ranges that we want to keep
		let excludedRanges = [];
		let excludedRangesForString = [];
		_.forEach(conditionalFilters, (filter) => {
			if (_.isEmpty(filter.selectedStringValue)) {
			_collectExcludedRanges(excludedRanges, filter, unfilteredDataMap[filter.sourceKey]);
		} else {
			_collectExcludedRangesForString(excludedRangesForString, filter,
				unfilteredDataMap[filter.sourceKey], tsMinMax);
		}

	});

		// sort ranges by ascending timestamps
		excludedRanges = _.sortBy(excludedRanges, ['from']);
		excludedRangesForString = _.sortBy(excludedRangesForString, ['from']);

		filteredChartData = _.clone(unfilteredDataMap);

		// now, remove all the data points where we want to exclude timestamps outside those ranges
		if (!_.isEmpty(conditionalFilters)) {
			_.forEach(filteredChartData, (nextTagData, nextTag) => {
				if (!_.isEmpty(nextTagData) && !_.isEmpty(nextTagData.values) && !nextTagData.cbfOnly) {
				filteredChartData[nextTag] = { NO_DATA: false, name: nextTag };
				filteredChartData[nextTag].values = unfilteredDataMap[nextTag].values;
				if (!_.isEmpty(excludedRanges)) {
					_.forEach(filteredChartData[nextTag].values, (point) => {
						if (_isInRange(excludedRanges, point[0])) {
						point[1] = undefined;	// eslint-disable-line no-param-reassign
					}
				});
				}

				if (!_.isEmpty(excludedRangesForString)) {
					_.forEach(filteredChartData[nextTag].values, (point) => {
						if (_isInRange(excludedRangesForString, point[0])) {
						point[1] = undefined;	// eslint-disable-line no-param-reassign
					}
				});
				}
			}
		});
		}

		// now do value filters, applying timestampMap
		_.forEach(valueFilters, (filter) => {
			const nextTag = filter.sourceKey;
		const nextTagData = unfilteredDataMap[nextTag];

		// if filter is muted dont apply it to chart
		if (!_.isEmpty(nextTagData) && !_.isEmpty(nextTagData.values) && !filter.muted && !nextTagData.cbfOnly) {
			filteredChartData[nextTag] = { NO_DATA: false, name: nextTag };
			filteredChartData[nextTag].values = unfilteredDataMap[nextTag].values;
			_.forEach(filteredChartData[nextTag].values, (point) => {
				if (!_isValueFiltered(filter, point[1])) {
				point[1] = undefined; // eslint-disable-line no-param-reassign
			}
		});
		}
	});
	} else {
		filteredChartData = unfilteredDataMap;
	}

	// set the values back in the original data structure
	for (let i = 0; i < data.queries.length; i++) {
		const sourceKey = data.queries[i].results[0].name;
		data.queries[i].results[0] = filteredChartData[sourceKey]; // eslint-disable-line no-param-reassign
	}
	// filter out cbfOnly results from response
	data.queries = _.filter(data.queries, q => !q.results[0].cbfOnly); // eslint-disable-line no-param-reassign
	return data;
}

/**
 * Collect time ranges where filtered values should be excluded
 *
 * @param timestampRanges - An array of ranges to exclude
 * @param filter - Condition based filter
 * @param nextTagData - Unfitered Data map
 *
**/

function _collectExcludedRanges(timestampRanges, filter, nextTagData) {
	if (!_.isEmpty(nextTagData) && !_.isEmpty(nextTagData.values) && !filter.muted) {
		let lastRange = {};
		_.forEach(nextTagData.values, (v) => {
			const thisValue = _isValueFiltered(filter, v[1]);
		if (!_.isEmpty(lastRange) && !thisValue) {
			lastRange.to = v[0];
		} else if (!thisValue) {
			lastRange = { from: v[0], to: v[0] };
		} else if (!_.isEmpty(lastRange)) {
			timestampRanges.push(lastRange);
			lastRange = {};
		}
	});
		if (!_.isEmpty(lastRange)) {
			timestampRanges.push(lastRange);
		}
	}
}

/**
 * Collect time ranges where filtered values should be excluded String data type tags
 *
 * @param timestampRanges - An array of ranges to exclude for String data type tags
 * @param filter - Condition Based Filter with String data type tags
 * @param nextTagData -  Unfiltered data map
 * @param tsMinMax - Min and Max timestamps
 *
 **/


function _collectExcludedRangesForString(excludedRanges, filter, nextTagData, tsMinMax) {
	let filterInRanges = [];

	if (!_.isEmpty(nextTagData) && !_.isEmpty(nextTagData.values) && !filter.muted) {
		// get user selected date range from and to
		const dFrom = tsMinMax.min;
		const dTo = tsMinMax.max;
		let lastRange = {};
		_.forEach(nextTagData.values, (v) => {
			const thisValue = _isValueFiltered(filter, v[1]);
		if (!_.isEmpty(lastRange) && !thisValue) {
			lastRange.to = v[0];
			filterInRanges.push(lastRange);
			lastRange = {};
		} else if (_.isEmpty(lastRange) && thisValue) {
			lastRange = { from: v[0], to: v[0] };
		} else if (thisValue) {
			lastRange.to = v[0];
		}
	});
		if (!_.isEmpty(lastRange)) {
			if (lastRange.from === lastRange.to && !_.isEqual(lastRange.to, dTo)) {
				lastRange.to = dTo;
			}
			filterInRanges.push(lastRange);
		}

		// sort ranges by ascending filterInRanges
		filterInRanges = _.sortBy(filterInRanges, ['from']);

		// ###To fix multiple string filters intersection issue,
		// getting included ranges first, from that calculating excluded ranges ###

		if (!_.isEmpty(filterInRanges) && filterInRanges.length > 0) {
			// get excluded ranges

			let prevTimeStamp = filterInRanges[0].to - 1000;
			for (let i = 0; i < filterInRanges.length; i++) {
				let range = {};
				if (i === 0) {
					if (dFrom !== filterInRanges[i].from) {
						range = { from: dFrom, to: filterInRanges[i].from - 1000 };
					}
				} else {
					range = { from: prevTimeStamp, to: filterInRanges[i].from - 1000 };
				}
				prevTimeStamp = filterInRanges[i].to - 1000;
				excludedRanges.push(range);
			}
			if (filterInRanges[filterInRanges.length - 1].to !== dTo) {
				excludedRanges.push({ from: prevTimeStamp, to: dTo });
			}
		} else {
			// if there was nothing in range, then everything is out of range
			excludedRanges.push({ from: dFrom, to: dTo });
		}

	}
}

/**
 * Return strings for string CBF and add all strings to a set
 *
 * @param values - Strings to filter for unique values
 *
 **/
function _getUniqueStrings(values) {
	const set = new Set();
	const numRegex = /^-?\d*[.]?\d+e?\d*$/; // allows floats, exponentials

	_.forEach(values, (nextValue) => {
		// try to parse it as a number - if we get a number, ignore it
		if (!numRegex.test(nextValue[1])) {
		set.add(nextValue[1]);
	}
});
	return Array.from(set);
}

/**
 * Return min/max for VBF and number CBF
 *
 * @param values - Filters with numeric values
 *
 **/


function _getMinMax(values) {
	const result = { min: undefined, max: undefined };
	const numRegex = /^-?\d*[.]?\d+e?\d*$/; // allows floats, exponentials

	_.forEach(values, (nextValue) => {
		if (!_.isUndefined(nextValue[1]) && !_.isNull(nextValue[1])) {
		const iss = _.isString(nextValue[1]);
		if (!iss || numRegex.test(nextValue[1])) {
			const nv = iss ? parseFloat(nextValue[1]) : nextValue[1];
			if (_.isUndefined(result.min) || nv < result.min) {
				result.min = nv;
			}
			if (_.isUndefined(result.max) || nv > result.max) {
				result.max = nv;
			}
		}
	}
});


	return result;
}


/**
 * Returns true if value argument passes the filter
 *
 * @param filter - Value based filters
 * @param values - Unfiltered data map with unmuted tags
 *
 **/

function _isValueFiltered(filter, value) {
	// check if it is a string based filter
	if (!_.isEmpty(filter.selectedStringValue)) {

		return (filter.inverted ?
			filter.selectedStringValue.val !== value :
			filter.selectedStringValue.val === value);
	}
	// if cbf is just added filter.min and filter.max will be -999999999990
	// we dont need to apply any filter for this range. So always return true.
	if (filter.min === DEFAULT_CBF_MIN_MAX && filter.max === DEFAULT_CBF_MIN_MAX) {
		return true;
	}

	// DE156034: If saved template filter min value is changed and max value is not changed,
	// it is considering maxValue - even though max filter is not applied.
	// use: 'minChanged' or 'maxChanged' property - to know filter is applied or not
	// if: inverted
	if (filter.inverted) {
		const isMinOk = filter.minChanged ? value <= filter.min : true;
		const isMaxOk = filter.maxChanged ? value >= filter.max : true;
		return isMinOk || isMaxOk;
	}
	// else:
	const isMinOk = filter.minChanged ? value >= filter.min : true;
	const isMaxOk = filter.maxChanged ? value <= filter.max : true;
	return isMinOk && isMaxOk;
}

/**
 * Returns if the passed timestamp is inside one of the ranges
 *
 * @param ranges - Excluded Ranges
 * @param timestamp - Timestamp
 *
 **/

function _isInRange(ranges, timestamp) {
	return _.reduce(ranges,
		(soFar, nextRange) => soFar || ((timestamp >= nextRange.from) && (timestamp <= nextRange.to)),
		false);
}


/*************************************************** PREFETCH FILTER LOGIC ********************************************/

/**
 * Resolves the filters from viewContext with the sourceKey of selected Asset
 * @param tag from asset service
 * @param filters array
 */
function updateFilter(tag, filters, assetName) {
	// Tag name will be same for Value based and condition based filter
	// So we need to iterate through each filter and resolve
	_.forEach(filters, (filter) => {
		if (filter.tagName === tag.name) {
		resolveFilterWithTagProperties(filter, tag, assetName);
	}
});
}

/**
 * Resolves the filters from viewContext with the sourceKey of selected Asset
 * @param filter object from viewContext filter
 * @param tag from asset service
 */
function resolveFilterWithTagProperties(filter, tag, assetName) {
	const tempFilter = filter;
	tempFilter.sourceKey = tag.sourceKey;
	if (!tag.notConfigured) {
		tempFilter.assetName = tag.monitoredEntityName;
	} else {
		tempFilter.assetName = assetName;
	}
}

module.exports = {
	_filterData: _filterData,
	_getUniqueStrings: _getUniqueStrings,
	_getMinMax: _getMinMax,
	updateFilter: updateFilter,
	collectExcludedRanges: _collectExcludedRanges,
	collectExcludedRangesForString: _collectExcludedRangesForString,
	isInRange: _isInRange,
	isValueFiltered: _isValueFiltered
};
