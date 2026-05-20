exports.sendSocketError = (socket, message, code, ack) => {
  const payload = {
    status: "error",
    code: code || "SERVER_ERROR",
    message,
  };

  if (typeof ack === "function") {
    return ack(payload);
  }

  socket.emit("socket_error", payload);
};

exports.sendSocketSuccess = (socket, data, ack) => {
  const payload = {
    status: "success",
    data,
  };

  if (typeof ack === "function") {
    return ack(payload);
  }

  socket.emit("socket_success", payload);
};
