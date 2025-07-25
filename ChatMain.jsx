import React, { useState, useEffect, useRef } from "react";
import ChatMessages from "./ChatMessageNew";
import ChatInput from "./ChatInput";
import Icon from "../Common/Icon";
import chatbotimg from "../../assets/images/chatbotimg.jpg";
import { Box, Grid, TextField } from "@mui/material";
import Header from "../Common/Header";
import TextInput from "../Common/TextInput";
import { useSelector } from "react-redux";
import AdminHome from "./RoleViewHome/AdminHome";
import SupportHome from "./RoleViewHome/SupportHome";
import UserHome from "./RoleViewHome/UserHome";
import DeveloperHome from "./RoleViewHome/DeveloperHome";
import WelcomeSection from "./WelcomeSection";
import { formatRole } from "../../utility/htmlUtils";
import("../../../src/styles/global.css");
const ChatMain = ({
  chat,
  isTyping,
  currentResponse,
  userInput,
  setInput,
  handleSend,
  handleKeyPress,
  handleLike,
  handleDislike,
  handleFileUpload,
  handleTypingComplete,
  typingIndex,
  isSidebarExpanded,
  isWaitingForResponse,
  logs,
  shouldAutoScroll,
  isResponseComplete,
  pendingFiles,
  setPendingFiles,
}) => {
  const chatContainerRef = useRef(null);
  const [isGlobalConfigDone, setIsGlobalConfigDone] = useState(true);
  const [selectedProject, setSelectedProject] = useState("");
  const userDetails = useSelector((state) => state.user?.userDetails);
  const userRole = userDetails?.role;
  const userName = userDetails?.username;
  const fullName = userDetails?.firstName + " " + userDetails?.lastName;
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = require("../../assets/images/welcome_bg.png");
    img.onload = () => setImageLoaded(true);
  }, []);

  useEffect(() => {
    if (selectedProject) {
      setIsGlobalConfigDone(true);
    } else {
      setIsGlobalConfigDone(true);
    }
  }, [selectedProject]);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  const callbackfunc = () => {
    setSelectedProject(
      JSON.parse(sessionStorage.getDecryptedItem("selectedProject"))
    );
  };
  return (
    <div className="flex flex-col h-full">
      <div className="top-header-container">
        <Header callbackfunc={callbackfunc} />
        <Box display={"flex"} width={"100%"}>
          <div className="welcome-header w-[85%]">
            {imageLoaded && (
              <WelcomeSection
                userName={fullName}
                role={formatRole(userDetails?.role)}
              />
            )}
          </div>
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            sx={{
              pt: 0,
              // width: "100%",
              height: "auto",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <TextField
              name="selectedProject"
              value={selectedProject?.value}
              placeholder="Select Project"
              disabled
              // variant="outlined"
              fullWidth
              InputProps={{
                sx: {
                  backgroundColor: "#f5f5f5",
                  border: "none",
                  borderRadius: "0px",
                  height: "46px",
                  fontSize: "0.9rem",
                  color: "#333",
                  "&:hover": {
                    backgroundColor: "#eaeaea",
                  },
                },
              }}
            />
          </Grid>
        </Box>
      </div>
      {isGlobalConfigDone ? (
        <>
          {chat?.length > 0 ? (
            <div className="flex-1 relative">
              <div
                className="absolute inset-0 overflow-y-auto px-4"
                ref={chatContainerRef}
              >
                <ChatMessages
                  chat={chat}
                  isTyping={isTyping}
                  currentResponse={currentResponse}
                  handleLike={handleLike}
                  handleDislike={handleDislike}
                  handleTypingComplete={handleTypingComplete}
                  typingIndex={typingIndex}
                  chatContainerRef={chatContainerRef}
                  logs={logs}
                  isSidebarExpanded={isSidebarExpanded}
                  isWaitingForResponse={isWaitingForResponse}
                  shouldAutoScroll={shouldAutoScroll}
                  isResponseComplete={isResponseComplete}
                />
              </div>
            </div>
          ) : (
            <>
              {userRole === "support" && (
                <DeveloperHome userName={userName} setInput={setInput} />
              )}
              {userRole === "admin" && <AdminHome userName={userName} />}
              {/* {userRole === "support" && <SupportHome userName={userName} />} */}
              {userRole === "user" && <UserHome setInput={setInput} />}
            </>
          )}

          <ChatInput
            userInput={userInput}
            setInput={setInput}
            handleSend={handleSend}
            handleKeyPress={handleKeyPress}
            handleFileUpload={handleFileUpload}
            isTyping={isTyping}
            pendingFiles={pendingFiles}
            setPendingFiles={setPendingFiles}
          />
        </>
      ) : (
        <div className="flex-grow flex flex-col justify-center items-center p-4">
          <div className="text-4xl font-bold mb-8 flex items-center">
            <img
              className="m-1"
              style={{ width: "40px", height: "40px" }}
              src={chatbotimg}
              alt="Chatbot"
            />
            <Icon name="chaticon" className="mt-3" />
          </div>
          <p>Please select an project to start chatting.</p>
        </div>
      )}
    </div>
  );
};
export default ChatMain;
