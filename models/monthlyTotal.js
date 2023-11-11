const mongoose = require('mongoose');

const { Schema } = mongoose;

const MonthlyTotalsSchema = new Schema({
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  totalOrderPrice: {
    type: Number,
    required: true,
  },
});

const MonthlyTotals = mongoose.model('MonthlyTotals', MonthlyTotalsSchema);

module.exports = MonthlyTotals;
