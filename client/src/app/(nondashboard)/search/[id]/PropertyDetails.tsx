import Loading from "@/components/Loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AmenityIcons, HighlightIcons } from "@/lib/constants";
import { formatEnumString } from "@/lib/utils";
import { useGetPropertyQuery } from "@/state/api";
import { HelpCircle } from "lucide-react";
import React from "react";

const PropertyDetails = ({ propertyId }: PropertyDetailsProps) => {
  const {
    data: property,
    isError,
    isLoading,
  } = useGetPropertyQuery(propertyId);

  if (isLoading) return <Loading />;
  if (isError || !property) {
    return <>Property not found</>;
  }

  return (
    <div className="mb-6">
      <div>
        <h2 className="text-xl font-semibold my-3">Property Amenities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {property.amenities.map((amenity: AmenityEnum) => {
            const Icon = AmenityIcons[amenity as AmenityEnum] || HelpCircle;
            return (
              <div
                key={amenity}
                className="flex flex-col items-center border rounded-xl py-8 px-4"
              >
                <Icon className="w-8 h-8 mb-2 text-gray-700" />
                <span className="text-sm text-center text-gray-700">
                  {formatEnumString(amenity)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-12 mb-16">
        <h3 className="text-xl font-semibold text-black dark:text-white">
          Highlights
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-4 w-full">
          {property.highlights.map((highlight: HighlightEnum) => {
            const Icon =
              HighlightIcons[highlight as HighlightEnum] || HelpCircle;
            return (
              <div
                key={highlight}
                className="flex flex-col items-center border rounded-xl py-8 px-4"
              >
                <Icon className="w-8 h-8 mb-2 text-white dark:text-black" />
                <span className="text-sm text-center text-white dark:text-black">
                  {formatEnumString(highlight)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-white dark:text-black mb-5">
          Fees and Policies
        </h3>
        <p className="text-sm text-white dark:text-black mt-2">
          The fees below are based on community-supplied data and may exclude
          additional fees and utilities.
        </p>
        <Tabs defaultValue="required-fees" className="mt-8">
          <TabsList className="grid w-full grid-cols-3 gap-2">
            <TabsTrigger
              value="required-fees"
              className="bg-gray-100 hover:bg-gray-200 rounded-md p-2 text-center cursor-pointer transition-colors"
            >
              Required Fees
            </TabsTrigger>
            <TabsTrigger
              value="pets"
              className="bg-gray-100 hover:bg-gray-200 rounded-md p-2 text-center cursor-pointer transition-colors"
            >
              Pets
            </TabsTrigger>
            <TabsTrigger
              value="parking"
              className="bg-gray-100 hover:bg-gray-200 rounded-md p-2 text-center cursor-pointer transition-colors"
            >
              Parking
            </TabsTrigger>
          </TabsList>
          <TabsContent value="required-fees" className="w-1/3">
            <p className="font-semibold mt-5 mb-2">One time move in fees</p>
            <hr />
            <div className="flex justify-between py-2 bg-white/50">
              <span className="text-black font-medium">Application Fee</span>
              <span className="text-black">${property.applicationFee}</span>
            </div>
            <hr />
            <div className="flex justify-between py-2 bg-white/50">
              <span className="text-black font-medium">Security Deposit</span>
              <span className="text-black">${property.securityDeposit}</span>
            </div>
            <hr />
          </TabsContent>
          <TabsContent value="pets">
            <p className="font-semibold mt-5 mb-2">
              Pets are {property.isPetsAllowed ? "allowed" : "not allowed"}
            </p>
          </TabsContent>
          <TabsContent value="parking">
            <p className="font-semibold mt-5 mb-2">
              Parking is{" "}
              {property.isParkingIncluded ? "included" : "not included"}
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PropertyDetails;
