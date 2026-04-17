import { RealEstate } from "./real-estate.model";

export interface Favorite {
  id:            string;
  userId:        string;
  realEstateId:  string;
  realEstate:   RealEstate;
}