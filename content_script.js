var loader = document.querySelectorAll('[class^="CentralLoading"]')

function waitForLoaderToDisappear () {
   setTimeout(function () {
      loader = document.querySelectorAll('[class^="CentralLoading"]')
      if (loader.length > 0) {
         waitForLoaderToDisappear();
      } else {
		processFeed()
		appendStorageReset()
      }
   }, 1000)
}

waitForLoaderToDisappear()




function processFeed() {

	let rows = document.querySelectorAll('[role="row"]');
	rows.forEach(function (row) {
		row.setAttribute("style", "position: relative; top: unset; margin-bottom: 15px;")	
	})


	chrome.storage.local.get(['hiddenFeedItems'], function(result) {

		let hiddenItems = result.hiddenFeedItems
		let feedItems = document.querySelectorAll('[data-test="restaurant-item"]');

		feedItems.forEach(function(feedItem, index) {
			let id = feedItem.getAttribute('href')

			feedItem.setAttribute('id', id)
			addButtonToFeedItem(feedItem)

			if (hiddenItems.includes(id)) {
				hideApartment(null, feedItem)
			}
		})
	});	
}


MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function(mutationsList, observer) {
    for(let mutation of mutationsList) {
        if (mutation.type === 'childList' ){
        	if (mutation.target.getAttribute('role') === 'rowgroup' && mutation.addedNodes.length !== 0) {
        		let addedNode = mutation.addedNodes[0]
        		if (addedNode.tagName !== 'BUTTON') {
        			processFeed()
        		}
        	}
        }
    }
});

// define what element should be observed by the observer
// and what types of mutations trigger the callback
observer.observe(document, {
  subtree: true,
  childList: true
});

function addButtonToFeedItem(feedItem) {
	let id = feedItem.firstElementChild.getAttribute('itemid');
	feedItem.setAttribute("style", "position: relative;")

	let btn = document.createElement("button"); 
	btn.id = id
	btn.innerText="hide";
	btn.setAttribute("style", "position: absolute;top: 0;left: 15px;background-color: salmon; z-index: 1000;");
	feedItem.appendChild(btn); 

	btn.addEventListener('click', hideApartment, false);
}

function hideApartment(e, _feedItem) {
	if (e !== null) {
		e.stopImmediatePropagation();
		e.stopPropagation();
		e.preventDefault();
	}
	let feedItem = _feedItem
	if (feedItem === undefined) {
		feedItem = e.target.parentElement
	}
	let feedItemId = feedItem.getAttribute('id');

	hideFeedItem(feedItem)
	updateChromeStorage(feedItemId)
	return false
}

function hideFeedItem(feedItem) {
	// feedItem.style.display = 'none';
	if (feedItem.parentNode.childNodes.length === 1) {
		let rowgroup = feedItem.parentNode.parentNode
		rowgroup.parentNode.removeChild(rowgroup);
	} else {
		feedItem.parentNode.removeChild(feedItem);
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
	btn.setAttribute("style", "z-index: 1000;");
	// document.body.appendChild(btn);
	document.body.insertBefore(btn, document.body.firstChild)
}

function resetStorage() {
	console.log('resetting storage')
	chrome.storage.local.set({hiddenFeedItems: []})
	let feedItems = document.querySelectorAll('[data-test="restaurant-item"]');
	feedItems.forEach(function(feedItem, index) {
		feedItem.style.display = 'block'
	})
}