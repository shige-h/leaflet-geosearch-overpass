class overpassProvider extends GeoSearch.JsonProvider {
	map;
	markersLayer;
	markerContextMenu;
	host;

	constructor(options = {}) {
		super(options);

    	this.map = map
    	this.url = "https://overpass-api.de/api/interpreter" || url

		this.markersLayer = new L.LayerGroup();
		this.markerContextMenu = {contextmenu: true,
			contextmenuItems: [{
				text: 'Google MAP',
				index: 0,
				callback: this.showMarkerInfo
			}, {
				separator: true,
				index: 1
			}]
		};
		
		this.map.addLayer(this.markersLayer);
	}

	showMarkerInfo(e){
		var url = "https://www.google.com/maps?q=" + e.latlng.lat + "," + e.latlng.lng;
		window.open(url, '_blank');
	}

    endpoint({ query, type }) {
        throw new Error('Method not implemented.');
    }

    parse(response) {
		const records = Array.isArray(response.json.elements)
			? response.json.elements
			: [response.json.elements];

		this.map.removeLayer(this.markersLayer);
		this.markersLayer = new L.LayerGroup();
		this.map.addLayer(this.markersLayer);

		var marker;
		records.map(function(r){
			marker = L.marker([r.lat, r.lon], this.markerContextMenu).addTo(this.markersLayer)
		}.bind(this));
		return []
    }
	async search(options){
		var bounds = map.getBounds();
		var south = bounds.getSouth();
		var west = bounds.getWest();
		var north = bounds.getNorth();
		var east = bounds.getEast();
		var params=`[out:json];
(
  node
  	[highway=traffic_signals][name="${options.query}"](${south},${west},${north},${east});
  node
  	[traffic_signals=signal][name="${options.query}"](${south},${west},${north},${east});
);
out;
`;
		const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' });
		var body = new URLSearchParams(`data=${params}`);

		const request = await fetch(this.url, {
			method: 'POST',
			body: body,
			headers: headers
		});
		const json = await request.json();
		return this.parse({ json });
	}
}
