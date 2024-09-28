import { Request, Response, } from 'express';
import Book from '../models/Book';
import User from '../models/User';

// Search by book name or term
export const getBooksByName = async (req: Request, res: Response) => {
  const { name } = req.query;
  try {
    const books = await Book.find({ name: { $regex: name as string, $options: 'i' } });
    res.status(200).json(books);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Search by rent range
export const getBooksByRentRange = async (req: Request, res: Response) => {
  const { minRent, maxRent } = req.query;
  try {
    const minRentValue = minRent ? +minRent : 0; // Default to 0 if minRent is not provided
    const maxRentValue = maxRent ? +maxRent : Infinity; // Default to Infinity if maxRent is not provided
    const books = await Book.find({ rentPerDay: { $gte: +minRentValue, $lte: +maxRentValue } });
    res.status(200).json(books);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Search by category, term, and rent range
export const getBooksByCategoryAndRent = async (req: Request, res: Response) => {
    const { category, term, minRent, maxRent } = req.query;
    try {
      // Set default values for minRent and maxRent if they are undefined
      const minRentValue = minRent ? +minRent : 0; // Default to 0 if minRent is not provided
      const maxRentValue = maxRent ? +maxRent : Infinity; // Default to Infinity if maxRent is not provided
  
      const books = await Book.find({
        category: category as string,
        name: { $regex: term as string, $options: 'i' },
        rentPerDay: { $gte: minRentValue, $lte: maxRentValue },
      });
  
      res.status(200).json(books);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  };

  export const getAllUsers = async (req: Request, res: Response) => {
    try {
      // Fetch all users from the User collection
      const users = await User.find({}, 'name email'); // Only select name and email for response
  
      // Return the list of users
      return res.status(200).json(users) as any;
    
    } catch (error) {
      // Handle any errors
      return res.status(400).json({ message: (error as Error).message });
    }
  };


  export const getAllBooks = async (req: Request, res: Response) => {
    try {
      // Fetch all books from the Book collection
      const books = await Book.find({}, 'name category rentPerDay'); // Only select necessary fields
  
      // Return the list of books
      return res.status(200).json(books) as any;
    } catch (error) {
      // Handle any errors
      return res.status(400).json({ message: (error as Error).message });
    }
  };
  
