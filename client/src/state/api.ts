import { cleanParams, createNewUserInDatabase } from "@/lib/utils";
import { Manager, Tenant, Property } from "@/types/prismaTypes";
import { FiltersState } from "@/state";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {fetchAuthSession, getCurrentUser} from "aws-amplify/auth";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async(headers) => {
      const session = await fetchAuthSession();
      const {idToken} = session.tokens ?? {};
      if(idToken) {
        headers.set("Authorization",`Bearer ${idToken}`)
      }
      return headers;
    }
  }),
  reducerPath: "api",
  tagTypes: ["Managers", "Tenants", "Properties"],
  endpoints: (build) => ({
    getAuthUser: build.query<User,void>({
      queryFn: async(_,_queryApi,_extraoptions, fetchWithBQ) => {
        try {
          const session = await fetchAuthSession();
          const {idToken} = session.tokens ?? {};
          const user = await getCurrentUser();
          const userRole = idToken?.payload["custom:role"] as string;

          const endpoint = userRole === "manager" ? `/manager/${user.userId}` : `/tenants/${user.userId}`;

          const userDetailsResponse = await fetchWithBQ(endpoint);

          if(userDetailsResponse.error) {
            if ('status' in userDetailsResponse.error && userDetailsResponse.error.status === 404) {
              if (!idToken) {
                throw new Error("No ID token available for user creation");
              }
              
              const email = (idToken.payload as any)?.email || "";
              const createResponse = await fetchWithBQ({
                url: userRole === "manager" ? "/managers" : "/tenants",
                method: "POST",
                body: {
                  cognitoId: user.userId,
                  name: user.username,
                  email: email,
                  phoneNumber: "",
                },
              });

              if (createResponse.error) {
                throw new Error("Failed to create user record");
              }

              return {
                data: {
                  cognitoInfo: {...user},
                  userInfo: createResponse.data as Tenant | Manager,
                  userRole
                }
              };
            }
            
            throw new Error("Failed to fetch user details");
          }

          return {
            data: {
              cognitoInfo: {...user},
              userInfo: userDetailsResponse.data as Tenant | Manager,
              userRole
            }
          }

        } catch(error: any) {
          return {error: {status: 'FETCH_ERROR', error: error.message || "Could not fetch user data"}}
        }
      },
    }),
 

  updateTenantSettings: build.mutation<Tenant, {cognitoId: string} & Partial<Tenant>>({
    query: ({cognitoId, ...updateTenant}) => ({
      url: `tenants/${cognitoId}`,
      method: "PUT",
      body: updateTenant,
    }),
    invalidatesTags: (result) => [{type: "Tenants", id: result?.id}],
    
  }),

    updateManagerSettings: build.mutation<Manager, {cognitoId: string} & Partial<Manager>>({
    query: ({cognitoId, ...updateManager}) => ({
      url: `managers/${cognitoId}`,
      method: "PUT",
      body: updateManager,
    }),
    invalidatesTags: (result) => [{type: "Managers", id: result?.id}],
    
  }),

  getProperties: build.query<Property[], Partial<FiltersState> & {favoriteIds?: number[]}>({
    query: (filters) => {
      const params = cleanParams({
        location: filters.location,
        priceMin: filters.priceRange?.[0],
        priceMax: filters.priceRange?.[1],
        beds: filters.beds,
        baths: filters.baths,
        propertyType: filters.propertyType,
        squareFeetMin: filters.squareFeet?.[0],
        squareFeetMax: filters.squareFeet?.[1],
        amenities: filters.amenities?.join(","),
        availableFrom : filters.availableFrom,
        favoriteIds: filters.favoriteIds?.join(","),
        latitude: filters.coordinates?.[1],
        longitude: filters.coordinates?.[0],
      });

      console.log("API Request URL:", "properties");
      console.log("API Request Params:", params);
      console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);

      return {url: "properties", params};
    },
    providesTags: (result) => result ? [
      ...result.map(({id}) => ({type: "Properties" as const, id})),
      {type: "Properties", id: "LIST"},
    ]
    : [{type: "Properties", id: "LIST"}],
  })
  }),
});

export const {
  useGetAuthUserQuery, useUpdateTenantSettingsMutation, useUpdateManagerSettingsMutation,  useGetPropertiesQuery
} = api;
