const memberRequestSchema = require("../../models/memberRequest");
const User = require("../../models/user");

exports.createMemberRequest = async (req, res) => {
  try {
    const { name, email, phone, role, userId } = req.body;
    const existingPending = await memberRequestSchema.findOne({ email, status: "pending" });
    if (existingPending) {
      return res.status(400).json({ message: "Request already pending for this user." });
    }

    const existingRejected = await memberRequestSchema.findOne({ email, status: "rejected" });
    if (existingRejected) {
      return res.status(403).json({ message: "Request was rejected by admin. Contact admin for reconsideration." });
    }

    const request = await memberRequestSchema.create({
      userId,
      fullName: name,
      email,
      phoneNumber: phone,
      role,
    });

    res.status(201).json({
      success: true,
      message: "Member request sent successfully.",
      data: request,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating member request", error: error.message });
  }
};

exports.getAllMemberRequests = async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const filter = status === 'all' ? {} : { status };
    const requests = await memberRequestSchema.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch member requests", error: error.message });
  }
};

exports.handleMemberRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; 

  const request = await memberRequestSchema.findById(id);
    if (!request) return res.status(404).json({ message: "Request not found" });
  if (action === "approve") {
    // Approve user and delete the request
    const user = await User.findById(request.userId);
    if (user) {
      user.accepted = true;
      user.isActive = true;
      await user.save();
    }
    await memberRequestSchema.findByIdAndDelete(id);
    return res.json({ success: true, message: "Request approved and removed", data: { id } });
  } else {
    // Reject: delete the user and mark request as rejected (keep record)
    await User.findByIdAndDelete(request.userId);
    request.status = "rejected";
    await request.save();
    return res.json({ success: true, message: "Request rejected; user deleted", data: request });
  }
  } catch (error) {
    res.status(500).json({ message: "Failed to update member request", error: error.message });
  }
};
