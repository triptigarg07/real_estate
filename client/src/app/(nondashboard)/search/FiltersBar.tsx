import { setFilters, setViewMode, toggleFiltersFullOpen } from "@/state";
import { useAppSelector } from "@/state/redux";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { debounce } from "lodash";
import { cleanParams, cn, formatPriceValue } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Filter, Grid, List, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PropertyTypeIcons } from "@/lib/constants";

const FiltersBar = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const filters = useAppSelector((state) => state.global.filters);
  const isFiltersFullOpen = useAppSelector(
    (state) => state.global.isFiltersFullOpen
  );

  const viewMode = useAppSelector((state) => state.global.viewMode);
  const [searchInput, setSearchInput] = useState(filters.location || "Los Angeles, CA");

  const updateURL = debounce((newFilters) => {
    const cleanFilters = cleanParams(newFilters) as Record<
      string,
      string | string[]
    >;
    const updatedSearchParams = new URLSearchParams();

    Object.entries(cleanFilters).forEach(([key, value]) => {
      updatedSearchParams.set(
        key,
        Array.isArray(value) ? value.join(",") : value.toString()
      );
    });

    router.push(`${pathname}?${updatedSearchParams.toString()}`);
  });

  const handleFilterChange = (
    key: string,
    value: any,
    isMin: boolean | null
  ) => {
    let newValue = value;

    if (key === "priceRange" || key === "squareFeet") {
      const currentArrayRange = [...filters[key]];
      if (isMin !== null) {
        const index = isMin ? 0 : 1;
        currentArrayRange[index] = value === "any" ? null : Number(value);
      }
      newValue = currentArrayRange;
    } else if (key === "coordinates") {
      newValue = value === "any" ? [0, 0] : value.map(Number);
    } else {
      newValue = value === "any" ? "any" : value;
    }

    const newFilters = { ...filters, [key]: newValue };
    dispatch(setFilters(newFilters));
    updateURL(newFilters);
  };

  const handleLocationSearch = async () => {
    try {
      const trimmedQuery = searchInput.trim();
      if (!trimmedQuery) return;

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          trimmedQuery
        )}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        }&fuzzyMatch=true`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        dispatch(
          setFilters({
            location: trimmedQuery,
            coordinates: [lng, lat],
          })
        );
        
        const newFilters = { ...filters, location: trimmedQuery, coordinates: [lng, lat] };
        updateURL(newFilters);
      }
    } catch (err) {
      console.error("Error searching location:", err);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center w-full py-5 gap-4">
      <div className="flex flex-wrap justify-start items-center gap-2 sm:gap-4 p-2 w-full lg:w-auto">
        <Button
          variant="outline"
          className={cn(
            "bg-white text-black border border-gray-400 px-4 py-2 rounded-2xl hover:bg-black hover:text-white",
            isFiltersFullOpen && "bg-black text-white"
          )}
          onClick={() => dispatch(toggleFiltersFullOpen())}
        >
          <Filter className="w-4 h-4" />
          <span>All Filters</span>
        </Button>
        <div className="flex items-center">
          <Input
            placeholder="Search location"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-32 sm:w-40 rounded-l-xl rounded-r-none border-gray-400 border-r-0"
          />
          <Button
            onClick={handleLocationSearch}
            className="rounded-r-xl rounded-l-none border-l-none border-gray-400 shadow-none border hover:bg-black hover:text-white"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-1 flex-wrap">
          <Select
            value={filters.priceRange[0]?.toString() || "any"}
            onValueChange={(value) =>
              handleFilterChange("priceRange", value, true)
            }
          >
            <SelectTrigger className="min-w-[6rem] sm:min-w-[8rem] rounded-xl border-gray-400">
              <SelectValue>
                {formatPriceValue(filters.priceRange[0], true)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem
                value="any"
                className="hover:bg-gray-100 hover:text-black cursor-pointer"
              >
                Any Min Price
              </SelectItem>
              {[500, 1000, 1500, 2000, 3000, 5000, 10000].map((price) => (
                <SelectItem
                  key={price}
                  value={price.toString()}
                  className="hover:bg-gray-100 hover:text-black cursor-pointer"
                >
                  ${price / 1000}k+
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.priceRange[1]?.toString() || "any"}
            onValueChange={(value) =>
              handleFilterChange("priceRange", value, false)
            }
          >
            <SelectTrigger className="min-w-[6rem] sm:min-w-[8rem] rounded-xl border-gray-400">
              <SelectValue>
                {formatPriceValue(filters.priceRange[1], false)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem
                value="any"
                className="hover:bg-gray-100 hover:text-black cursor-pointer"
              >
                Any Max Price
              </SelectItem>
              {[1000, 2000, 3000, 5000, 10000].map((price) => (
                <SelectItem
                  key={price}
                  value={price.toString()}
                  className="hover:bg-gray-100 hover:text-black cursor-pointer"
                >
                  &lt; ${price / 1000}k
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-1 flex-wrap">
          <Select
            value={filters.beds}
            onValueChange={(value) => handleFilterChange("beds", value, null)}
          >
            <SelectTrigger className="min-w-[6rem] sm:min-w-[8rem] rounded-xl border-gray-400">
              <SelectValue placeholder="Beds" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem
                value="any"
                className="hover:bg-gray-100 hover:text-black cursor-pointer"
              >
                Any Beds
              </SelectItem>
              <SelectItem
                value="1"
                className="hover:bg-gray-100 hover:text-black cursor-pointer"
              >
                1+ beds
              </SelectItem>
              <SelectItem
                value="2"
                className="hover:bg-gray-100 hover:text-black cursor-pointer"
              >
                2+ beds
              </SelectItem>
              <SelectItem
                value="3"
                className="hover:bg-gray-100 hover:text-black cursor-pointer"
              >
                3+ beds
              </SelectItem>
              <SelectItem
                value="4"
                className="hover:bg-gray-100 hover:text-black cursor-pointer"
              >
                4+ beds
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.baths}
            onValueChange={(value) => handleFilterChange("baths", value, null)}
          >
            <SelectTrigger className="min-w-[6rem] sm:min-w-[8rem] rounded-xl border-gray-400">
              <SelectValue placeholder="Baths" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem
                value="any"
                className="hover:bg-gray-100 hover:text-black cursor-pointer"
              >
                Any Baths
              </SelectItem>
              <SelectItem
                value="1"
                className="hover:bg-gray-100 hover:text-black cursor-pointer"
              >
                1+ baths
              </SelectItem>
              <SelectItem
                value="2"
                className="hover:bg-gray-100 hover:text-black cursor-pointer"
              >
                2+ baths
              </SelectItem>
              <SelectItem
                value="3"
                className="hover:bg-gray-100 hover:text-black cursor-pointer"
              >
                3+ baths
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select
          value={filters.propertyType || "any"}
          onValueChange={(value) =>
            handleFilterChange("propertyType", value, null)
          }
        >
          <SelectTrigger className="min-w-[6rem] sm:min-w-[8rem] rounded-xl border-gray-400">
            <SelectValue placeholder="Home Type" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem 
              value="any"
              className="hover:bg-gray-100 hover:text-black cursor-pointer"
            >
              Any Property Type
            </SelectItem>
            {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
              <SelectItem 
                key={type} 
                value={type}
                className="hover:bg-gray-100 hover:text-black cursor-pointer"
              >
                <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-2" />
                  <span>{type}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-center lg:justify-between items-center gap-4 p-2 w-full lg:w-auto">
        <div className="flex border rounded-xl">
          <Button
            variant="ghost"
            className={cn(
              "px-3 py-1 rounded-none rounded-l-xl hover:bg-gray-600 hover:text-white",
              viewMode === "list" ? "bg-black text-white" : ""
            )}
            onClick={() => dispatch(setViewMode("list"))}
          >
            <List className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "px-3 py-1 rounded-none rounded-l-xl hover:bg-gray-600 hover:text-white",
              viewMode === "grid" ? "bg-black text-white" : ""
            )}
            onClick={() => dispatch(setViewMode("grid"))}
          >
            <Grid className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
