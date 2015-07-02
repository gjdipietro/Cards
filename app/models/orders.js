var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    shipping: {
        street: {
            type: String
        },
        city: { 
            type: String
        },
        state: { 
            type: String
        },
        zip: { 
            type: String
        },
        country: { 
            type: String 
        }
    },
    method: {
        number: {
            type: String
        },
        name: { 
            type: String
        },
        cvv: { 
            type: String
        },
        expiration: { 
            type: String
        },
    },
    date: { 
        type: Date, 
        default: Date.now() 
    },
    amount: {
        type: Number,
    },
    cards: {
        type: Schema.Types.ObjectId,
        ref: 'Cards'
    }
});

module.exports = mongoose.model("Orders", orderSchema);