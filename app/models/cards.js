var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var cardSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    title: {
        type: String, 
        default: ""
    },
    description: {
        type: String, 
        default: ""
    },
    image: {
        type: String, 
        default: ""
    },
    approved: {
        type: Boolean, 
        default: false
    },
    attr: {
        price: {
            type: Number,
        },
        favorites: {
            type: Number,
            default: "0"
        }
    },
    date: {
        created: { 
            type: Date, 
            default: Date.now() 
        },
        approved: { 
            type: Date 
        },
    }
});

module.exports = mongoose.model("Card", cardSchema);