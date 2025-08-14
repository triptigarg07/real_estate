"use client";

import { NAVBAR_HEIGHT } from "@/lib/constants";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { initialState, setFilters } from "@/state";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import FiltersBar from "./FiltersBar";
import FiltersFull from "./FiltersFull";
import { cleanParams } from "@/lib/utils";
import Map from "./Map";
import Listings from "./Listings";

const SearchPage = () => {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.global.filters);
  const isFiltersFullOpen = useAppSelector(
    (state) => state.global.isFiltersFullOpen
  );

  useEffect(() => {
    const urlFilters = Array.from(searchParams.entries()).reduce(
      (acc: any, [key, value]) => {
        if (key === "priceRange" || key === "squareFeet") {
          acc[key] = value.split(",").map((v) => (v === "" ? null : Number(v)));
        } else if (key === "coordinates") {
          acc[key] = value.split(",").map(Number);
        } else if (key === "amenities") {
          acc[key] = value ? value.split(",") : [];
        } else {
          acc[key] = value === "any" || value === "" ? "any" : value;
        }
        return acc;
      },
      {}
    );

    if (Object.keys(urlFilters).length > 0) {
      const cleanedFilters = cleanParams(urlFilters);
      dispatch(setFilters(cleanedFilters));
    } else if (filters.location === "" || (filters.coordinates[0] === 0 && filters.coordinates[1] === 0)) {
      // Set default Los Angeles location if no URL params and no location set
      dispatch(setFilters(initialState.filters));
    }
  }, [searchParams, dispatch]);
  return (
    <div
      className="w-full mx-auto px-2 sm:px-5 flex flex-col"
      style={{
        height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
      }}
    >
      <FiltersBar />
      <div className="flex flex-col lg:flex-row justify-between flex-1 overflow-hidden gap-3 mb-5">
        <div
          className={`h-full overflow-auto transition-all duration-300 ease-in-out ${
            isFiltersFullOpen
              ? "w-full lg:w-3/12 opacity-100 visible"
              : "w-0 opacity-0 invisible"
          }`}
        >
          <FiltersFull />
        </div>
        <div className="flex flex-col lg:flex-row flex-1 gap-3">
          <div className="h-64 lg:h-full lg:flex-1">
            <Map />
          </div>
          <div className="h-96 lg:h-full lg:basis-4/12 overflow-y-auto">
            <Listings />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
