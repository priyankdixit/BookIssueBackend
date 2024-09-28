import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  bookId: string;
  userId: string;
  issueDate: Date;
  returnDate?: Date;
  rentGenerated?: number;
}

const TransactionSchema: Schema = new Schema({
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  issueDate: { type: Date, required: true },
  returnDate: { type: Date },
  rentGenerated: { type: Number },
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
