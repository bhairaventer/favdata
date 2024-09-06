const mongoose = require('mongoose');

// Assuming you have a Product model defined somewhere
const Schema = mongoose.Schema;

const purchaseSchema = new Schema(
  {
    name: [
      {
        productid: {
          type: Schema.Types.ObjectId, 
          ref: 'Products', // Refer to the Product model
          required: true,
        },
        quantity: {
          type: String,
          required: true,
        },
        amount: {
          type: String,
          required: true,
        },
        serialNumbers:{type:Object},
        rateper: {
          type: String,
          required: true,
        },
        soldQuantity: { type: Number, default: 0 }
      }
    ],
    
    billno: {
      type: Number,
      required: true,
    },
    billdate: {
      type: Date,
      required: true,
    },
    Supplier: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Purchase', purchaseSchema);
