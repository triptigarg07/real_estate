"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import { Property } from "@/types/prismaTypes";
import Loading from "@/components/Loading";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const Map = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const filters = useAppSelector((state) => state.global.filters);
  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);

  useEffect(() => {
    if (isLoading || isError || !properties || !mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
    }

    const center: [number, number] =
      Array.isArray(filters.coordinates) &&
      filters.coordinates.length === 2 &&
      typeof filters.coordinates[0] === "number" &&
      typeof filters.coordinates[1] === "number"
        ? [filters.coordinates[0], filters.coordinates[1]]
        : [-74.5, 40];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/triptigarg07/cmcigmuwp001801s75pke8482",
      center,
      zoom: 9,
    });

    properties.forEach((property) => {
      const marker = createPropertyMarker(property, map);
      const markerElement = marker.getElement();
      const path = markerElement.querySelector("path[fill='#3FB1CE']");
      if (path) path.setAttribute("fill", "#000000");
    });

    mapRef.current = map;

    map.on("load", () => {
      map.resize();
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [filters, isLoading, isError, properties]);

  if (isLoading) return <Loading />;
  if (isError || !properties) return <div>Failed to fetch properties</div>;

  return (
    <div className="w-full h-full relative rounded-xl">
      <div
        className="map-container rounded-xl"
        ref={mapContainerRef}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
};

const createPropertyMarker = (property: Property, map: mapboxgl.Map) => {
  const marker = new mapboxgl.Marker()
    .setLngLat([
      property.location.coordinates.longitude,
      property.location.coordinates.latitude,
    ])
    .setPopup(
      new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="
          display: flex;
          gap: 12px;
          width: 260px;
          padding: 10px;
          background: white;
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
        ">
          <img 
            src="${property.image || "/placeholder.jpg"}" 
            alt="${property.name}"
            style="
              width: 80px;
              height: 80px;
              object-fit: cover;
              border-radius: 8px;
              flex-shrink: 0;
              background-color: #f0f0f0;
            "
          />
          <div style="flex: 1;">
            <a 
              href="/search/${property.id}" 
              target="_blank"
              style="
                font-weight: 600;
                color: #111827;
                text-decoration: none;
                font-size: 15px;
                display: block;
                margin-bottom: 4px;
              "
              onmouseover="this.style.textDecoration='underline'"
              onmouseout="this.style.textDecoration='none'"
            >
              ${property.name}
            </a>
            <p style="
              margin: 0;
              color: #10b981;
              font-weight: 500;
              font-size: 14px;
            ">
              ₹${property.pricePerMonth.toLocaleString()}
              <span style="
                color: #6b7280;
                font-size: 13px;
              ">
                / month
              </span>
            </p>
          </div>
        </div>
      `)
    )
    .addTo(map);

  return marker;
};

export default Map;
