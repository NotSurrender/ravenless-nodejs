import crypto from 'crypto';
import config from 'config';
import { pick } from 'lodash';
import { Schema, Document, Model, model } from '../libs/mongoose';

const publicFields = ['email', 'nickname'];

export interface IUserDocument extends Document {
  salt: string;
  passwordHash: string;
  checkPassword(password: string): Promise<boolean>;
  setPassword(password: string): void;
}

export interface IUserModel extends Model<IUserDocument> {
  publicFields: Array<string>;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: 'Email пользователя не должен быть пустым',
      validate: [
        {
          validator(value: string): boolean {
            return /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(value);
          },
          message: 'Некорректный email.'
        }
      ],
      unique: 'Такой email уже существует',
      trim: true
    },
    nickname: {
      type: String,
      required: 'У пользователя должно быть имя',
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    salt: {
      type: String,
      required: true
    }
  },
  {
    toObject: {
      transform(_, ret) {
        return pick(ret, [...publicFields, '_id']);
      }
    }
  }
);

const generatePassword = (salt: string, password: string): Promise<string> =>
  new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      config.get('crypto.hash.iterations'),
      config.get('crypto.hash.length'),
      'sha512',
      (err, key) => {
        if (err) return reject(err);
        resolve(key.toString('hex'));
      }
    );
  });

userSchema.methods.setPassword = async function (password) {
  if (password && password.length < 4) {
    throw new Error('Пароль должен быть минимум 4 символа');
  }

  this.salt = crypto.randomBytes(config.get('crypto.hash.length')).toString('hex');
  this.passwordHash = await generatePassword(this.salt, password);
};

userSchema.methods.checkPassword = async function (password) {
  if (!password) return false;

  const hash = await generatePassword(this.salt, password);
  return hash === this.passwordHash;
};

userSchema.statics.publicFields = publicFields;

export default model<IUserDocument, IUserModel>('User', userSchema);
