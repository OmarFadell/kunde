// auditMessageTemplate.js
module.exports = function createAuditMessage({ action, actor, entity, status = {} }) {
    return {
      timestamp: new Date().toISOString(),
      action,        // e.g., "CREATE_CUSTOMER"
      actor,         // e.g., { id: "user123", role: "admin" }
      entity,        // e.g., { type: "customer", id: "cus456" }
      status,      // optional extra info (payload, IP, etc.)
    };
  };
  