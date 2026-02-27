const cors = require("cors");

app.use(cors({
  origin: "https://lkacademy.work",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

