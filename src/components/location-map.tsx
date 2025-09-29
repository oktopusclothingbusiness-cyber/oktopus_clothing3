
'use client';

import * as React from 'react';
import { Map, Marker, type MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pin } from 'lucide-react';
import { createRef } from 'react';

const MAPBOX_TOKEN = "pk.eyJ1Ijoib2t0b3B1c2MiLCJhIjoiY21keGUyNjU0MXhwYjJsc2FrcGZsd290eCJ9.mEjrHNxJYljQLhjVslo_iw";

interface LocationMapProps {
    latitude: number;
    longitude: number;
}

export default function LocationMap({ latitude, longitude }: LocationMapProps) {
    const mapRef = createRef<MapRef>();
    const [mapLib, setMapLib] = React.useState<any>();

    React.useEffect(() => {
        import('mapbox-gl').then(mapLib => {
            setMapLib(mapLib.default);
        }).catch(err => console.error(err));
    }, []);

    if (!mapLib) {
        return <div>Loading map...</div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Location Map</CardTitle>
            </CardHeader>
            <CardContent className="h-64 w-full p-0 overflow-hidden rounded-b-lg">
                <Map
                    ref={mapRef}
                    mapLib={mapLib}
                    mapboxAccessToken={MAPBOX_TOKEN}
                    initialViewState={{
                        longitude: longitude,
                        latitude: latitude,
                        zoom: 14
                    }}
                    mapStyle="mapbox://styles/mapbox/streets-v9"
                >
                    <Marker longitude={longitude} latitude={latitude}>
                        <Pin className="h-8 w-8 text-red-500" fill="red" />
                    </Marker>
                </Map>
            </CardContent>
        </Card>
    );
}
