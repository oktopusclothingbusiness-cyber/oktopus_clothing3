
'use client';

import * as React from 'react';
import { Map, Marker } from 'react-map-gl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';

// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('mapbox-gl/dist/mapbox-gl-csp-worker').default;

const MAPBOX_TOKEN = "pk.eyJ1Ijoib2t0b3B1c2MiLCJhIjoiY21keGUyNjU0MXhwYjJsc2FrcGZsd290eCJ9.mEjrHNxJYljQLhjVslo_iw";

interface LocationMapProps {
    latitude: number;
    longitude: number;
}

export default function LocationMap({ latitude, longitude }: LocationMapProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Location Map</CardTitle>
            </CardHeader>
            <CardContent className="h-64 w-full p-0 overflow-hidden rounded-b-lg">
                <Map
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
