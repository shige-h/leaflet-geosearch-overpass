import * as L from 'leaflet';
import * as GeoSearch from 'leaflet-geosearch';
import { type Map } from 'leaflet';
import type { EndpointArgument, ParseArgument, ProviderOptions, SearchResult, SearchArgument} from 'leaflet-geosearch/dist/providers/provider.js';
export interface overpassProviderOptions extends ProviderOptions {
    map: Map;
    url?: string;
}

export interface ContextMenuOptions extends L.MarkerOptions {
    contextmenu: boolean;
    contextmenuItems: Array<{
        text?: string;
        index?: number;
        callback?: (e: L.LeafletMouseEvent) => void;
        separator?: boolean;
    }>;
}
export interface RawResultElements {
    type: string;
    id: number;
    lat: string;
    lon: string;
    tags: {
        [key: string]: string;
    };
}

export interface RawResult {
    version: number;
    generator: string;
    osm3s: {
        timestamp_osm_base: string;
        copyright: string;
    };
    elements: RawResultElements[];
    remark?: string;
}

export class overpassProvider extends GeoSearch.JsonProvider<RawResultElements[], RawResultElements> {
    map: Map;
    url: string;
    markersLayer: any;
    markerContextMenu: ContextMenuOptions;
    records: Array<RawResultElements> = [];

    constructor(options: overpassProviderOptions = {} as overpassProviderOptions) {
        super(<ProviderOptions>options);

        this.map = options.map;
    	this.url = options.url || "https://overpass-api.de/api/interpreter";

        this.markersLayer = new L.LayerGroup();
        this.map.addLayer(this.markersLayer);

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
        
    }

    showMarkerInfo(e: L.LeafletMouseEvent): void {
        var params = {
            q: e.latlng.lat + "," + e.latlng.lng
        };
        var url: string = this.getUrl(this.url, params);
        window.open(url, '_blank');
    }

    endpoint(options: EndpointArgument): string {
        throw new Error('Method not implemented.');
    }

    parse(response: ParseArgument<RawResultElements[]>): SearchResult<RawResultElements>[] {
		this.records = Array.isArray(response.data)
			? response.data
			: [response.data];

		this.map.removeLayer(this.markersLayer);
		this.markersLayer = new L.LayerGroup();
		this.map.addLayer(this.markersLayer);

		var marker;
		this.records.map( (r: RawResultElements) => {
			marker = L.marker([parseFloat(r.lat), parseFloat(r.lon)], this.markerContextMenu).addTo(this.markersLayer);
            return {
                x: Number(r.lon),
                y: Number(r.lat),
                label: r.tags.name || "No name",
                bounds: [
                    [parseFloat(r.lat), parseFloat(r.lon)], // s, w
                    [parseFloat(r.lat), parseFloat(r.lon)], // n, e
                ],
                raw: r,
            };
		});
        return [];
    }

    async search(options: SearchArgument): Promise<SearchResult<RawResultElements>[]> {
		var bounds = this.map.getBounds();
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
        if (!request.ok) {
            throw new Error(`HTTP error! status: ${request.status}`);
        }
		const json: RawResult = await request.json();
        if (json.remark) {
            throw new Error(`remark: ${json.remark}`);
        }
		return this.parse({ data: json.elements });
    }
}