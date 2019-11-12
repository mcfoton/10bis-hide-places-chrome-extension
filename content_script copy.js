setTimeout(function() {
	
	chrome.storage.local.get(['hiddenFeedItems'], function(result) {
		// console.log(result)
		// if (result.hiddenFeedItems === null) {
			// chrome.storage.local.set({hiddenFeedItems: []})
			// console.log('Initialised empty list');
		// }


		let hiddenItems = result.hiddenFeedItems
		let feedItems = document.querySelectorAll('div.feeditem');

		feedItems.forEach(function(feedItem, index) {
			let id = feedItem.firstElementChild.getAttribute('itemid');

			appendIdToMapItem(index, id)
			feedItem.setAttribute('id', id)

			if (hiddenItems.includes(id)) {
				hideApartment(null, feedItem)
			} else {
				addButtonToFeedItem(feedItem)
			}
		})
	});

	appendStorageReset()

}, 4000);

function addButtonToFeedItem(feedItem) {
	let id = feedItem.firstElementChild.getAttribute('itemid');
	feedItem.setAttribute("style", "position: relative;")

	let btn = document.createElement("button"); 
	btn.id = id
	btn.innerText="delete";
	btn.setAttribute("style", "position: absolute;top: 0;left: 0;background-color: salmon;");
	feedItem.appendChild(btn); 

	btn.addEventListener('click', hideApartment, false);
}

function hideApartment(e, _feedItem) {
	let feedItem = _feedItem
	if (feedItem === undefined) {
		feedItem = e.target.parentElement
	}
	let feedItems = childrenMatches(feedItem.parentNode, 'div.feeditem.table');
	let feedItemIndex = Array.prototype.indexOf.call(feedItems, feedItem);
	let feedItemId = feedItem.getAttribute('id');

	console.log(`deleting ${feedItemIndex}`)

	hideFeedItem(feedItem)
	hideMapItem(feedItemIndex)
	updateChromeStorage(feedItemId)
}

function hideFeedItem(feedItem) {
	feedItem.style.display = 'none';
}

function hideMapItem(index) {
	let mapItems = childrenMatches(document.querySelector('div.mapboxgl-canvas-container.mapboxgl-interactive').children, 'div.mapboxgl-marker')
	let mapItem = mapItems[index+1]
	console.log(mapItem)

	if (mapItem.innerText !== " נכסים מרובים") {
		mapItem.style.display = 'none'
	}
}

function updateChromeStorage(id) {
	chrome.storage.local.get(['hiddenFeedItems'], function(result) {
		console.log(result.hiddenFeedItems)
		let _result = result.hiddenFeedItems.concat(id)
		chrome.storage.local.set({hiddenFeedItems: _result})
	})
}

function appendStorageReset() {
	let btn = document.createElement("button"); 
	btn.onclick = resetStorage
	btn.innerText = "reset";
	document.body.appendChild(btn);
}

function resetStorage() {
	console.log('resetting storage')
	chrome.storage.local.set({hiddenFeedItems: []})
	let feedItems = document.querySelectorAll('div.feeditem');
	feedItems.forEach(function(feedItem, index) {
		feedItem.style.display = 'block'
	})
}

function appendIdToMapItem(index, id) {
	let mapItems = childrenMatches(document.querySelector('div.mapboxgl-canvas-container.mapboxgl-interactive'), 'div.mapboxgl-marker')
	let mapItem = mapItems.children[index+1]
	mapItem.setAttribute('id', id)
}

function childrenMatches (elem, selector) {
	return Array.prototype.filter.call(elem.children, function (child) {
		return child.matches(selector);
	});
};