const express = require("express");
const router = express.Router();
const {
  createMemberRequest,
  getAllMemberRequests,
  handleMemberRequest,
} = require("../controllers/Head_Controls/requestManager");

// create member request (triggered after signup)
router.post("/", createMemberRequest);

// get all requests (admin dashboard)
router.get("/", getAllMemberRequests);

// approve or reject
router.put("/:id", handleMemberRequest);

module.exports = router;
