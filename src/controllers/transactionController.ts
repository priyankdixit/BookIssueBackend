import { Request, Response } from 'express';
import Transaction,{ITransaction} from '../models/Transaction';
import Book from '../models/Book';
import User,{IUser} from '../models/User';

// Issue a book
export const issueBook = async (req: Request, res: Response): Promise<Response | undefined> => {
    const { bookName, userName, issueDate } = req.body;
    try {
      const book = await Book.findOne({ name: { $regex: new RegExp(bookName, 'i') } });
      
      const user = await User.findOne({ name: { $regex:String(userName) as string, $options: 'i' } });

  
      if (!book ) {
        return res.status(404).json({ message: 'Book  not found' });
      }

      if (!user) {
        return res.status(404).json({ message: 'User  not found' });
      }
      const userId = user._id;
  
      const transaction = new Transaction({
        bookId: book._id,
        userId,
        issueDate,
      });
      await transaction.save();
      
      return res.status(200).json({ message: 'Book issued successfully' });
    } catch (error) {
      const err = error as Error;
      return res.status(400).json({ message: err.message });
    }
  };

// Return a book
export const returnBook = async (req: Request, res: Response) => {
  const { bookName, userName, returnDate } = req.body;
  try {
    const book = await Book.findOne({ name: bookName });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const user = await User.findOne({ name: { $regex:String(userName) as string, $options: 'i' } });
    if (!user) return res.status(404).json({ message: 'Book not found' });


    const transaction = await Transaction.findOne({ bookId: book._id, userId:user._id, returnDate: { $exists: false } });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    const daysRented = Math.ceil((new Date(returnDate).getTime() - new Date(transaction.issueDate).getTime()) / (1000 * 3600 * 24));
    const rentGenerated = daysRented * book.rentPerDay;

    transaction.returnDate = returnDate;
    transaction.rentGenerated = rentGenerated;

    await transaction.save();
    res.status(200).json({ message: `Book returned. Total rent: ${rentGenerated}` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all users who have issued a specific book
export const getBookIssuers = async (req: Request, res: Response): Promise<Response | undefined> => {
  const { bookName } = req.query;

  try {
    const book = await Book.findOne({ name: { $regex: new RegExp(bookName as string, 'i') } });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Get all transactions for the specific book
    const transactions = await Transaction.find({ bookId: book._id });

    // Get user IDs from the transactions
    const userIds = transactions.map(tx => tx.userId);

    // Find all users who have issued this book
    const users: IUser[] = await User.find({ _id: { $in: userIds } });

    // Determine the current issuer from the last transaction
    const currentIssuer = transactions.length > 0 
      ? users.find(user => (user._id as any).equals(transactions[transactions.length - 1].userId)) 
      : null;

    return res.status(200).json({
      totalCount: transactions.length,
      currentIssuer: currentIssuer ? currentIssuer.name : null,
      issuedUsers: users.map(user => user.name),
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};


// Get total rent generated by a specific book
export const getTotalRentGenerated = async (req: Request, res: Response): Promise<Response | undefined> => {
  const { bookName } = req.query;

  try {
    const book = await Book.findOne({ name: { $regex: new RegExp(bookName as string, 'i') } });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const transactions = await Transaction.find({ bookId: book._id });

    // Step 3: Calculate total rent using the rentGenerated field from the transactions
    const totalRent = transactions.reduce((acc, tx) => acc + (tx.rentGenerated || 0), 0); 

    return res.status(200).json({ totalRent });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};

// Get list of books issued to a specific user

export const getUserIssuedBooks = async (req: Request, res: Response): Promise<Response | undefined> => {
  const { username } = req.query;

  try {
    // Find the user by username
    const user = await User.findOne({ name: { $regex: new RegExp(username as string, 'i') } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find transactions by userId
    const transactions: ITransaction[] = await Transaction.find({ userId: user._id });

    // Use Promise.all to fetch book names in parallel
    const issuedBooks = await Promise.all(
      transactions.map(async (tx) => {
        const book = await Book.findById(tx.bookId); // Fetch book by bookId
        return {
          bookName: book?.name || 'Unknown Book', // Handle case where book is not found
          issueDate: tx.issueDate,
          returnDate: tx.returnDate,
        };
      })
    );

    return res.status(200).json({
      username,
      issuedBooks,
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};




// Get list of books issued within a specific date range


export const getBooksIssuedInDateRange = async (req: Request, res: Response): Promise<Response | undefined> => {
  const { startDate, endDate } = req.query;

  try {
    // Fetch transactions within the specified date range
    const transactions = await Transaction.find({
      issueDate: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      },
    }).populate('userId'); // Populate userId only

    // Create an array to hold the results
    const results = await Promise.all(transactions.map(async tx => {
      // Fetch the book using the bookId
      const book = await Book.findById(tx.bookId);
      const user=await User.findById(tx.userId);
      
      return {
        bookName: book?.name || 'Unknown Book', // Use optional chaining
        issuedTo: user?.name || 'Unknown User', // Use optional chaining
        issueDate: tx.issueDate,
      };
    }));

    return res.status(200).json(results);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};


