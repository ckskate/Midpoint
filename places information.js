// Initialize a ResultList to create a clickable
	// list of search results. When the user clicks
	// on a place name, the handler function gets the
	// corresponding place details and displays them
	// in the 'detail' div:
	var resultList = new nokia.places.widgets.ResultList ({
		targetNode: 'results',
		perPage: 5,
		events: [{
			rel: 'nokia-place-name',
			name: 'click',
			handler: function (jsonObj) {
				var pp = new nokia.places.Place ({
					placeId: jsonObj.placeId,
					targetNode: 'detail'
				});
			}
		}]
	})

	// Initialize search box:
	//will need to change to fit with our project
	var searchBox = new nokia.places.widgets.SearchBox ({
		targetNode: 'searchbox',
		searchCenter: function () {
			return {
				latitude: 52.516274,
				longitude: 13.377678
			}
		},
		onResults: function (data) {
			resultList.setData(data);
		}
	});
