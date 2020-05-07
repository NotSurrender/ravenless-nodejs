import mongoose from 'mongoose';
import beautifyUnique from 'mongoose-beautiful-unique-validation';

import config from 'config';

mongoose.set('debug', config.get('mongodb.debug'));
mongoose.plugin(beautifyUnique);
mongoose.connect(config.get('mongodb.uri'), {
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true
});

export default mongoose;

export * from 'mongoose';
