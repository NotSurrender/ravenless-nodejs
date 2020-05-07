import { Schema, model } from '../libs/mongoose';

const refreshTokenSchema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true
  }
});

refreshTokenSchema.methods;

export default model('Token', refreshTokenSchema);
