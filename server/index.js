import express from 'express';
import multer from 'multer';

import mongoose, { Mongoose } from 'mongoose';
import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from './validations/validation.js';

import checkAuth from './utils/checkAuth.js';

import * as UserController from './controllers/UserController.js';
import * as PostController from './controllers/PostController.js';
import handleValidationdErrors from './utils/handleValidationdErrors.js';

const app = express();

const storage = multer.diskStorage({
  destination: (_, cd) => {
    cd(null, 'uploads');
  },
  filename: (_, file, cd) => {
    cd(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.json()); // Позволяет читать json в post request

mongoose
  .connect('mongodb+srv://admin:admin@todo.abddczc.mongodb.net/blog?retryWrites=true&w=majority')
  .then(() => console.log('DB okey'))
  .catch((err) => console.log('DB err', err));

app.post('/auth/register', registerValidation, handleValidationdErrors, UserController.register);
app.post('/auth/login', loginValidation, handleValidationdErrors, UserController.login);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationdErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationdErrors, PostController.update);

app.listen(4444, (err) => {
  if (err) console.log(err);

  console.log('Server is running');
});
