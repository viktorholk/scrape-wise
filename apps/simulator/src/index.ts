import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient, Recipe } from '@packages/database';

dotenv.config();

const app: Application = express();
const prisma = new PrismaClient();

const port = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/simulator', (req: Request, res: Response) => {
  res.redirect('/simulator/recipes');
});

app.get('/simulator/recipes', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const recipesPerPage = 3;
  const skip = (page - 1) * recipesPerPage;

  try {
    const recipes = await prisma.recipe.findMany({
      skip: skip,
      take: recipesPerPage,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalRecipes = await prisma.recipe.count();
    const totalPages = Math.ceil(totalRecipes / recipesPerPage);

    res.render('recipes', {
      recipes,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error('Failed to fetch recipes:', error);
    res.status(500).send('Error fetching recipes');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});