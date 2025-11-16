import { model, Schema, PaginateModel } from "mongoose";
import paginator from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import { IFavourite } from "../interfaces/favourites";

const favoriteSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
  }
}, {
  timestamps: true
});

favoriteSchema.plugin(paginator);
favoriteSchema.plugin(mongooseAggregatePaginate);

const Favorite = model<IFavourite, PaginateModel<IFavourite>>('Favorite', favoriteSchema, 'favorites');

export default Favorite;