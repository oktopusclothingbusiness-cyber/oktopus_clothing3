
'use client';

import * as React from 'react';
import { Map, Marker } from 'react-map-gl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pin } from 'lucide-react';

const MAPBOX_TOKEN = "pk.eyJ1Ijoib2t0b3B1c2MiLCJhIjoiY21keGUyNjU0MXhwYjJsc2FrcGZsd290eCJ9.mEjrHNxJYljQLhjVslo_iw";

interface LocationMapProps {
    latitude: number;
    longitude: number;
}

export default function LocationMap({ latitude, longitude }: LocationMapProps) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Location Map</CardTitle>
                </CardHeader>
                <CardContent className="h-64 w-full p-0 overflow-hidden rounded-b-lg flex items-center justify-center bg-secondary">
                    <p className="text-muted-foreground">Loading map...</p>
                </CardContent>
            </Card>
        );
    }

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
