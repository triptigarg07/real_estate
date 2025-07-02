import { cleanParams, createNewUserInDatabase, withToast } from "@/lib/utils";
import { Manager, Tenant, Property, Lease, Payment, Application } from "@/types/prismaTypes";
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
  tagTypes: ["Managers", "Tenants", "Properties", "PropertyDetails", "Leases", "Payments", "Applications"],
  endpoints: (build) => ({
    getAuthUser: build.query<User,void>({
      queryFn: async(_,_queryApi,_extraoptions, fetchWithBQ) => {
        try {
          const session = await fetchAuthSession();
          const {idToken} = session.tokens ?? {};
          const user = await getCurrentUser();
          const userRole = idToken?.payload["custom:role"] as string;

          const endpoint = userRole === "manager" ? `/managers/${user.userId}` : `/tenants/${user.userId}`;

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
     async onQueryStarted(_, {queryFulfilled}) {
      await withToast(queryFulfilled, {
        success: "Settings updated successfully.",
        error: "Failed to update settings."
      });
    },
    
  }),

    updateManagerSettings: build.mutation<Manager, {cognitoId: string} & Partial<Manager>>({
    query: ({cognitoId, ...updateManager}) => ({
      url: `managers/${cognitoId}`,
      method: "PUT",
      body: updateManager,
    }),
    invalidatesTags: (result) => [{type: "Managers", id: result?.id}],
    async onQueryStarted(_, {queryFulfilled}) {
      await withToast(queryFulfilled, {
        success: "Settigs updated successfully.",
        error: "Failed to update settings."
      });
    },
    
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

     
      return {url: "properties", params};
    },
    providesTags: (result) => result ? [
      ...result.map(({id}) => ({type: "Properties" as const, id})),
      {type: "Properties", id: "LIST"},
    ]
    : [{type: "Properties", id: "LIST"}],
    async onQueryStarted(_, {queryFulfilled}) {
      await withToast(queryFulfilled, {
        error: "Failed to fetch properties."
      });
    }
  }),

  getProperty: build.query<Property, number>({
    query: (id) => `properties/${id}`,
    providesTags: (result,error,id) => [{type: "PropertyDetails", id}],
     async onQueryStarted(_, {queryFulfilled}) {
      await withToast(queryFulfilled, {
        error: "Failed to load property details."
      });
    },
  }), 

  getTenant: build.query<Tenant, string>({
    query: (cognitoId) => `tenants/${cognitoId}`,
    providesTags: (result) => [{type: "Tenants", id: result?.id}],
     async onQueryStarted(_, {queryFulfilled}) {
      await withToast(queryFulfilled, {
        error: "Failed to load tenant profile."
      });
    },
  }),

  getCurrentResidences: build.query<Property[], string>({
    query: (cognitoId) => `tenants/${cognitoId}/current-residences`,
    providesTags: (result) => result ? [
      ...result.map(({id}) => ({type: "Properties" as const, id})),
      {type: "Properties", id: "LIST"},
    ]
    : [{type: "Properties", id: "LIST"}],
     async onQueryStarted(_, {queryFulfilled}) {
      await withToast(queryFulfilled, {
        error: "Failed to fetch current residences."
      });
    },
  }),

  addFavoriteProperty: build.mutation<
  Tenant,
  {cognitoId: string; propertyId: number}>({
    query: ({ cognitoId, propertyId}) => ({
      url: `tenants/${cognitoId}/favorites/${propertyId}`,
      method: "POST"
    }),
    invalidatesTags: (result) => [
      {type: "Tenants", id: result?.id},
      {type: "Properties", id:"LIST"},
    ],
    async onQueryStarted(_, {queryFulfilled}) {
      await withToast(queryFulfilled, {
        success: "Added to favorites.",
        error: "Failed to add to favorties."
      });
    },
  }),

  removeFavoriteProperty: build.mutation<
  Tenant,
  {cognitoId: string; propertyId: number}>({
    query: ({ cognitoId, propertyId}) => ({
      url: `tenants/${cognitoId}/favorites/${propertyId}`,
      method: "DELETE"
    }),
    invalidatesTags: (result) => [
      {type: "Tenants", id: result?.id},
      {type: "Properties", id:"LIST"},
    ],
    async onQueryStarted(_, {queryFulfilled}) {
      await withToast(queryFulfilled, {
        success: "Removed from favorites.",
        error: "Failed to remove from favorties."
      });
    },
  }),

  getLeases: build.query<Lease[], number>({
    query: () => "leases",
    providesTags:["Leases"],
    async onQueryStarted(_, {queryFulfilled}) {
      await withToast(queryFulfilled, {
        error: "Failed to fetch leases."
      });
    },
  }),

  getPropertyLeases: build.query<Lease[], number>({
    query: (propertyId) => `properties/${propertyId}/leases`,
    providesTags:["Leases"],
    async onQueryStarted(_, {queryFulfilled}) {
      await withToast(queryFulfilled, {
        error: "Failed to fetch property leases."
      });
    },
  }),

  getPayments: build.query<Payment[], number>({
    query: (leaseId) => `leases/${leaseId}/payments`,
    providesTags:["Payments"],
    async onQueryStarted(_, {queryFulfilled}) {
      await withToast(queryFulfilled, {
        error: "Failed to fetch payment info."
      });
    },
  }),

  getManagerProperties: build.query<Property[], string>({
    query: (cognitoId) => `managers/${cognitoId}/properties`,
    providesTags: (result) => result ? [
      ...result.map(({id}) => ({type: "Properties" as const, id})),
      {type: "Properties", id: "LIST"},
    ]
    : [{type: "Properties", id: "LIST"}],
    async onQueryStarted(_, {queryFulfilled}) {
      await withToast(queryFulfilled, {
        error: "Failed to load manager profile."
      });
    },
  }),

  createProperty: build.mutation<Property, FormData>({
      query: (newProperty) => ({
        url: `properties`,
        method: "POST",
        body: newProperty,
      }),
      invalidatesTags: (result) => [
        { type: "Properties", id: "LIST" },
        { type: "Managers", id: result?.manager?.id },
      ],
      async onQueryStarted(_, {queryFulfilled}) {
      await withToast(queryFulfilled, {
        success: "Property created successfully.",
        error: "Failed to create property."
      });
    },
     
    }),

    // application endpoints

       getApplications: build.query<
      Application[],
      { userId?: string; userType?: string }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.userId) {
          queryParams.append("userId", params.userId.toString());
        }
        if (params.userType) {
          queryParams.append("userType", params.userType);
        }

        return `applications?${queryParams.toString()}`;
      },
      providesTags: ["Applications"],
      async onQueryStarted(_, {queryFulfilled}) {
      await withToast(queryFulfilled, {
        error: "Failed to fetch applications."
      });
    },
     
    }),

      updateApplicationStatus: build.mutation<
      Application & { lease?: Lease },
      { id: number; status: string }
    >({
      query: ({ id, status }) => ({
        url: `applications/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Applications", "Leases"],
      async onQueryStarted(_, {queryFulfilled}) {
      await withToast(queryFulfilled, {
        success: "Application status updated successfully .",
        error: "Failed to update application status."
      });
    },
      
    }),

    createApplication: build.mutation<Application, Partial<Application>>({
      query: (body) => ({
        url: `applications`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: (result) => ["Applications"],
      async onQueryStarted(_, {queryFulfilled}) {
      await withToast(queryFulfilled, {
        success: "Application created successfully.",
        error: "Failed to create applications."
      });
    },
     
    }),


  }),
});

export const {
  useGetAuthUserQuery, useUpdateTenantSettingsMutation, useUpdateManagerSettingsMutation,  useGetPropertiesQuery, useAddFavoritePropertyMutation, useRemoveFavoritePropertyMutation, useGetTenantQuery, useGetPropertyQuery, useGetCurrentResidencesQuery, useGetLeasesQuery, useGetPaymentsQuery, useGetManagerPropertiesQuery, useGetPropertyLeasesQuery, useCreatePropertyMutation, useGetApplicationsQuery, useUpdateApplicationStatusMutation, useCreateApplicationMutation,
} = api;
