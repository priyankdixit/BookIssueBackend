import { Router } from 'express';
import { issueBook, returnBook,getBookIssuers,getTotalRentGenerated,getBooksIssuedInDateRange,getUserIssuedBooks } from '../controllers/transactionController';

const router = Router();

router.post('/issue', issueBook as any);
router.post('/return', returnBook as any);
router.get('/issuers', getBookIssuers as any);
router.get('/rent', getTotalRentGenerated as any);
router.get('/userBooks', getUserIssuedBooks as any);
router.get('/dateRange', getBooksIssuedInDateRange as any);


export default router;
