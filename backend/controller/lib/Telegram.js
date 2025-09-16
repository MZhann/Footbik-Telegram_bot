const {axiosInstance} = require("./axios")

function sendMessage(messageObj, messageText) {
  return axiosInstance.get("sendMessage", {
    chat_id: messageObj.chat.id,
    text: messageText,
  });
}

function handleMessage(messageObj){
  const messageText = messageObj.text || "";

  if(messageText.charAt(0) === "/"){
    const command = messageText.substr(1);
    switch(command){
      case "start": 
        //send the welcome message to the user
        return sendMessage(messageObj, "Hi! I am footbik bot")
      default:
        return sendMessage(messageObj, "I dont know this command")
    }
  }else{
    //we can send the message back to user
    return sendMessage(messageObj, messageText); 
  }
}

module.exports = { handleMessage };