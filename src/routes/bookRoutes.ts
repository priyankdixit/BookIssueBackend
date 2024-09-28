import { Router } from 'express';
import { getBooksByName, getBooksByRentRange, getBooksByCategoryAndRent ,getAllBooks,getAllUsers} from '../controllers/bookController';

const router = Router();

router.get('/search/name', getBooksByName);
router.get('/search/rent', getBooksByRentRange);
router.get('/search/category-rent', getBooksByCategoryAndRent);
router.get('/allUsers',getAllUsers);
router.get('/allBooks',getAllBooks);

export default router;
