import { model, Schema, PaginateModel } from "mongoose";
import paginator from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import { IFavourite } from "../interfaces/favourites";

const favoriteSchema = new Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  imageUrl: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true
});


favoriteSchema.index({ name: 1, createdAt: -1 });

favoriteSchema.index({ name: 'text' });

favoriteSchema.index({ pokemonId: 1 }, { sparse: true });

favoriteSchema.pre('save', function(next) {
  if (this.name) {
    this.name = this.name.toLowerCase().trim();
  }
  next();
});

favoriteSchema.plugin(paginator);
favoriteSchema.plugin(mongooseAggregatePaginate);

const Favorite = model<IFavourite, PaginateModel<IFavourite>>('Favorite', favoriteSchema, 'favorites');

export default Favorite;