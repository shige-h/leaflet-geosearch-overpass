import * as L from 'leaflet';
import * as GeoSearch from 'leaflet-geosearch';
import { type Map } from 'leaflet';
import type { EndpointArgument, ParseArgument, ProviderOptions, SearchResult, SearchArgument } from 'leaflet-geosearch/dist/providers/provider.js';
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
export declare class overpassProvider extends GeoSearch.JsonProvider<RawResultElements[], RawResultElements> {
    map: Map;
    url: string;
    markersLayer: any;
    markerContextMenu: ContextMenuOptions;
    records: Array<RawResultElements>;
    constructor(options?: overpassProviderOptions);
    showMarkerInfo(e: L.LeafletMouseEvent): void;
    endpoint(options: EndpointArgument): string;
    parse(response: ParseArgument<RawResultElements[]>): SearchResult<RawResultElements>[];
    search(options: SearchArgument): Promise<SearchResult<RawResultElements>[]>;
}
//# sourceMappingURL=overpassProvider.d.ts.map