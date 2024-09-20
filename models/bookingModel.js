const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must have Tour name '],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must have a User name '],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have Price '],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/,function(){
    this.populate("user").populate({
        path: "tour",
        select: "name"
    })
})

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
