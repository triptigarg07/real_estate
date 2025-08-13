import {Request,Response} from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";
import { S3Client } from "@aws-sdk/client-s3";
import { Location } from "@prisma/client";
import { Upload } from "@aws-sdk/lib-storage";
import axios from "axios";

const prisma = new PrismaClient();



const s3Client = new S3Client({
    region: process.env.AWS_REGION,
})

export const getProperties = async(req: Request, res:Response): Promise<void> => {
    try{
        const {
            favoriteIds,
            priceMin, 
            priceMax,
            beds,
            baths,
            propertyType,
            squareFeetMin,
            squareFeetMax,
            amenities,
            availableFrom,
            latitude,
            longitude
        } = req.query;

        let whereConditions: Prisma.Sql[] = [];

        if(favoriteIds) {
            const favoriteIdsArray = (favoriteIds as string).split(",").map(Number); 
            whereConditions.push(
                Prisma.sql`p.id IN (${Prisma.join(favoriteIdsArray)})`
            );
        }

        if (priceMin) {
            whereConditions.push(
                Prisma.sql`p."pricePerMonth" >= ${Number(priceMin)}`
            );
        }

        if (priceMax) {
            whereConditions.push(
                Prisma.sql`p."pricePerMonth" <= ${Number(priceMax)}`
            );
        }

        if (beds && beds !== "any") {
            whereConditions.push(
                Prisma.sql`p.beds >= ${Number(beds)}`
            );
        }

        if (baths && baths !== "any") {
            whereConditions.push(
                Prisma.sql`p.baths >= ${Number(baths)}`
            );
        }

        if (squareFeetMin) {
            whereConditions.push(
                Prisma.sql`p."squareFeet" >= ${Number(squareFeetMin)}`
            );
        }

        if (squareFeetMax) {
            whereConditions.push(
                Prisma.sql`p."squareFeet" <= ${Number(squareFeetMax)}`
            );
        }

        if (propertyType && propertyType !== "any") {
            whereConditions.push(
                Prisma.sql`p."propertyType" = ${propertyType} :: "PropertyType"`
            );
        }

        if (amenities && amenities !== "any") {
            const amenitiesArray = (amenities as string).split(",")
            whereConditions.push(
                Prisma.sql`p.amenities && ${amenitiesArray}::text[]`
            );
        }

        if(availableFrom && availableFrom !== "any" ) {
            const availableFromDate = typeof availableFrom === "string" ? availableFrom : null;
            if(availableFromDate) {
                const date = new Date(availableFromDate);
                if(!isNaN(date.getTime())) {
                    whereConditions.push(
                        Prisma.sql`NOT EXISTS (
                            SELECT 1 FROM "Lease" lease
                            WHERE lease."propertyId" = p.id
                            AND lease."endDate" > ${date.toISOString()}
                        )`
                    );
                }
            }
        }

        if (latitude && longitude) {
            const lat = parseFloat(latitude as string);
            const lng = parseFloat(longitude as string);
            const radiusInMeters = 50000; // 50km radius

            whereConditions.push(
                Prisma.sql`ST_DWithin(
                    l.coordinates,
                    ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
                    ${radiusInMeters}
                )`
            );
        }

        const completeQuery = Prisma.sql`
        SELECT
        p.*,
        json_build_object(
            'id', l.id,
            'address', l.address,
            'city', l.city,
            'state', l.state,
            'country', l.country,
            'postalCode', l."postalCode",
            'coordinates', json_build_object(
                'longitude', ST_X(l."coordinates"::geometry),
                'latitude', ST_Y(l."coordinates"::geometry)
            )
        ) as location
        FROM "Property" p
        JOIN "Location" l ON p."locationId" = l.id
        ${
            whereConditions.length > 0
            ? Prisma.sql`WHERE ${Prisma.join(whereConditions, " AND ")}`
            : Prisma.empty
        }
        ORDER BY p."postedDate" DESC
        `;

        const properties = await prisma.$queryRaw(completeQuery);

        res.json(properties);

    } catch (error: any) {
        res
        .status(500)
        .json({message: `Error retrieving properties: ${error.message}`});
    }
};

export const getProperty = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const {id} = req.params;
        const property = await prisma.property.findUnique({
            where: {id:Number(id)},
            include: {
                location: true,
            },
        });

        if(property) {
            const coordinates: {coordinates: string}[] = 
            await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;

            const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
            const longitude = geoJSON.coordinates[0];
            const latitude = geoJSON.coordinates[1];

            const propertyWithCoordinates = {
                ...property,
                location: {
                    ...property.location,
                    coordinates: {
                        longitude,
                        latitude
                    }
                }
            }
            res.json(propertyWithCoordinates);
        }

    } catch (err: any) {
        res
        .status(500)
        .json({message: `Error retrieving property: ${err.message}`});
    }
};



export const createProperty = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const files = req.files as Express.Multer.File[];
        const {
            address,
            city,
            state,
            country,
            postalCode,
            managerCognitoId,
            ...propertyData
        } = req.body;

        const photoUrls = await Promise.all(
            files.map(async (file) => {
                const uploadParams = {
                    Bucket: process.env.S3_BUCKET_NAME!,
                    Key: `properties/${Date.now()} - ${file.originalname}`,
                    Body: file.buffer,
                    ContentType: file.mimetype
                };

                const uploadResult = await new Upload({
                    client: s3Client,
                    params: uploadParams
                }).done();

                return uploadResult.Location;
            })
        );

        const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
            {
                street: address,
                city,
                country,
                postalcode: postalCode,
                format: "json",
                limit: "1"
            }
        ).toString()}`;

        const geocodingResponse = await axios.get(geocodingUrl, {
            headers: {
                "User-Agent": "RealEstateApp (justsomedummyemail@gmail.com"
            }
        });
        const [longitude, latitude] = geocodingResponse.data[0]?.lon && geocodingResponse.data[0]?.lat
        ? [
            parseFloat(geocodingResponse.data[0]?.lon),
            parseFloat(geocodingResponse.data[0]?.lat)
        ]
        : [0,0];

        const [location] = await prisma.$queryRaw<Location[]>`
        INSERT INTO "Location"(address, city, state, country, "postalCode", coordinates)
        VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
        RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates;
        `;

        const newProperty = await prisma.property.create({
            data: {
                ...propertyData,
                photoUrls,
                locationId: location.id,
                managerCognitoId,
                amenities: typeof propertyData.amenities === "string" ? propertyData.amenities.split(",") : [],
                highlights: typeof propertyData.highlights === "string" ? propertyData.highlights.split(",") : [],
                isPetsAllowed: propertyData.isPetsAllowed === "true",
                isParkingIncluded: propertyData.isParkingIncluded === "true",
                pricePerMonth: parseFloat(propertyData.pricePerMonth),
                securityDeposit: parseFloat(propertyData.securityDeposit),
                applicationFee: parseFloat(propertyData.applicationFee),
                beds: parseInt(propertyData.beds),
                baths: parseFloat(propertyData.baths),
                squareFeet: parseInt(propertyData.squareFeet),
            },
            include: {
                location: true,
                manager: true,
            },
        });

        res.status(201).json(newProperty);

    } catch (err: any) {
  console.error("CREATE PROPERTY ERROR:", err);
  res.status(500).json({message: `Error creating property: ${err.message}`});
}
};
