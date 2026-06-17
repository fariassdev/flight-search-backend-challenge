import { z } from "zod";

export const CoordinatesSchema = z.object({
  latitude:  z.number()
    .min(-90, { message: 'Latitude must be between -90 and 90' })
    .max(90, { message: 'Latitude must be between -90 and 90' }),
  longitude:  z.number()
    .min(-180, { message: 'Longitude must be between -180 and 180' })
    .max(180, { message: 'Longitude must be between -180 and 180' }),
});

export type Coordinates = z.infer<typeof CoordinatesSchema>;
