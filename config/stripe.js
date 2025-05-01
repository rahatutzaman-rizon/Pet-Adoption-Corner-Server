const stripe = require("stripe")(
    process.env.STRIPE_SECRET_KEY ||
      "sk_test_51Klod6Hm471kJsphHC9404YI2Hc35Lm1glEThlrgK2dlNyEfCxt0njVK9bhskSvJmGo8DLyVoTNBYjqWyeSTy0iu00BKTjH4nG",
  )
  
  module.exports = stripe
  