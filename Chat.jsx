import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { v4 as uuidv4 } from "uuid";
// import {
//   updateChatHistoryAction,
//   deleteChatHistoryAction,
//   clearChatHistoryAction,
// } from "../../redux/actions/chatAction";
import Layout from "../Common/Layout";
import ChatSidebar from "./ChatSidebar";
import Modal from "../Common/Modal";
import ChatMain from "./ChatMain";
import { getChats, addOrUpdateSession } from "../../utility/Utility";
import PipelineDashboard from "../Dashboard/PipelineDashboard";
const Chat = () => {
  const [userInput, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [title, setTitle] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);
  const [socketUrl, setSocketUrl] = useState(
    "ws:///supervisor"
  );
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [messageCounter, setMessageCounter] = useState(1);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isResponseComplete, setIsResponseComplete] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [activeView, setActiveView] = useState("intelliops");

  const chatSessionIdRef = useRef(uuidv4());
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    rejectUnauthorized: false,
    shouldReconnect: (closeEvent) => {
      if (closeEvent.code !== 1000) {
        return true;
      }
      return false;
    },
    retryOnError: true,
  });
  const fetchAndLogChats = async () => {
    const chats = await getChats();
  };
  useEffect(() => {
    if (lastMessage !== null && lastMessage.data) {
      if (lastMessage.data === "ping") {
        if (readyState === ReadyState.OPEN) {
          sendMessage("pong");
        }
        return; // ✅ Prevent further processing
      }

      try {
        const messageData = JSON.parse(lastMessage.data);
        if (messageData.type) {
          const newMessage = {
            chat_session_id: chatSessionIdRef.current,
            role: "assistant",
            content: messageData.Content,
            timestamp: messageData.timestamp,
            type: messageData.type,
            message_id: messageData.message_id,
          };
          setChat((prev) => [...prev, newMessage]);
          setCurrentResponse(newMessage);
          setTypingIndex(0);
          setIsTyping(false);
          addOrUpdateSession(chatSessionIdRef.current, newMessage);
        }

        if (messageData?.end === "True") {
          setIsWaitingForResponse(false);
          setIsResponseComplete(true);
          setShouldAutoScroll(false);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    }
  }, [lastMessage, dispatch]);

  const handleSend = useCallback(() => {
    if (chat.length === 0 && userInput.trim()) {
      const newChatEntry = {
        chat_session_id: chatSessionIdRef.current,
        message_title: userInput.trim(),
        message_history: [
          {
            chat_session_id: chatSessionIdRef.current,
            role: "user",
            content: userInput.trim(),
            timestamp: new Date().toISOString(),
            type: "text",
            message_id: messageCounter,
          },
        ],
      };
      setChatHistory((prev) => [...prev, newChatEntry]);
    }

    if (userInput.trim() || pendingFiles.length > 0) {
      const timestamp = new Date().toISOString();

      // 1. Add user message (text)
      if (userInput.trim()) {
        const newTextMessage = {
          chat_session_id: chatSessionIdRef.current,
          role: "user",
          content: userInput,
          timestamp,
          type: "text",
          message_id: messageCounter,
        };
        setChat((prev) => [...prev, newTextMessage]);
        addOrUpdateSession(chatSessionIdRef.current, newTextMessage);

        const message = {
          chat_session_id: chatSessionIdRef.current,
          username: "user1",
          message_title: chat.length === 0 ? userInput : title,
          query: userInput,
          timestamp,
          message_id: messageCounter,
        };
        if (readyState === ReadyState.OPEN) {
          sendMessage(JSON.stringify(message));
        }
      }

      // 2. Add file message
      if (pendingFiles.length > 0) {
        const newFileMessage = {
          chat_session_id: chatSessionIdRef.current,
          role: "user",
          content: pendingFiles,
          timestamp,
          type: "file",
          message_id: messageCounter + 1,
        };
        setChat((prev) => [...prev, newFileMessage]);
        addOrUpdateSession(chatSessionIdRef.current, newFileMessage);

        // Send file metadata to backend
        const filePayload = {
          chat_session_id: chatSessionIdRef.current,
          username: "user1",
          message_title: title,
          files: pendingFiles.map((f) => ({
            name: f.name,
            type: f.type,
            // You can add base64 or upload URL here if needed
          })),
          timestamp,
          type: "file",
          message_id: messageCounter + 1,
        };
        if (readyState === ReadyState.OPEN) {
          sendMessage(JSON.stringify(filePayload));
        }

        setPendingFiles([]); // Clear after sending
      }

      setInput("");
      setIsTyping(true);
      setIsWaitingForResponse(true);
      setIsResponseComplete(false);
      setShouldAutoScroll(true);
      setMessageCounter((prev) => prev + 2);
    }
  }, [
    userInput,
    pendingFiles,
    chat,
    sendMessage,
    readyState,
    title,
    dispatch,
    messageCounter,
  ]);

  const handleNewChat = useCallback(() => {
    const newChatSessionId = uuidv4();
    chatSessionIdRef.current = newChatSessionId;
    setChat([]);
    setTitle("");
    setCurrentResponse("");
    setIsTyping(false);
    setTypingIndex(0);
    setSelectedChatId(null);
    setEditingChatId(null);
    setEditingTitle("");
    setShowOptions(false);
    setMessageCounter(1);
    // dispatch(clearChatHistoryAction());
  }, [dispatch]);
  const handleEditChatHistoryClick = (id, title) => {
    setEditingChatId(id);
    setEditingTitle(title);
    setIsModalOpen(true);
  };
  const handleEditChatHistoryChange = (e) => {
    setEditingTitle(e.target.value);
  };
  const handleEditChatHistorySave = async () => {
    // await dispatch(updateChatHistoryAction(editingChatId, editingTitle));
    setChatHistory((prev) =>
      prev.map((chat) =>
        chat.chatSessionIdRef.current === editingChatId
          ? { ...chat, message_title: editingTitle }
          : chat
      )
    );
    setEditingChatId(null);
    setEditingTitle("");
    setIsModalOpen(false);
    setShowOptions(false);
  };
  const handleEditChatHistoryCancel = () => {
    setEditingChatId(null);
    setEditingTitle("");
    setIsModalOpen(false);
    setShowOptions(false);
  };
  const handleDeleteChatHistoryClick = async (id) => {
    // await dispatch(deleteChatHistoryAction(id));
    setChatHistory((prev) =>
      prev.filter((chat) => chat.chatSessionIdRef.current !== id)
    );
    setShowOptions(false);
  };
  const handleSelectChatHistory = (id) => {
    const selectedChat = chatHistory.find(
      (chat) => chat.chatSessionIdRef.current === id
    );
    if (selectedChat) {
      setChat(selectedChat.message_history);
      setTitle(selectedChat.message_title);
      setSelectedChatId(id);
    }
  };
  const handleLike = (index) => {
    const updatedChat = [...chat];
    updatedChat[index].liked = !updatedChat[index].liked;
    if (updatedChat[index].liked) {
      updatedChat[index].disliked = false;
    }
    setChat(updatedChat);
  };
  const handleDislike = (index) => {
    const updatedChat = [...chat];
    updatedChat[index].disliked = !updatedChat[index].disliked;
    if (updatedChat[index].disliked) {
      updatedChat[index].liked = false;
    }
    setChat(updatedChat);
  };
  const handleFileUpload = async (files) => {
    const fileArray = Array.from(files).map((file) => ({
      name: file.name,
      type: file.type,
      file,
      url: URL.createObjectURL(file),
    }));
    setPendingFiles((prev) => [...prev, ...fileArray]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };
  const handleTypingComplete = () => {
    setIsTyping(false);
  };
  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };
  return (
    <div className={`chat-container ${theme}`}>
      <Layout
        sidebar={
          <ChatSidebar
            chat={chat}
            chatHistory={chatHistory}
            handleNewChat={handleNewChat}
            handleEditChatHistoryClick={handleEditChatHistoryClick}
            handleDeleteChatHistoryClick={handleDeleteChatHistoryClick}
            handleSelectChatHistory={handleSelectChatHistory}
            editingChatId={editingChatId}
            editingTitle={editingTitle}
            handleEditChatHistoryChange={handleEditChatHistoryChange}
            showOptions={showOptions}
            setShowOptions={setShowOptions}
            isExpanded={isSidebarExpanded}
            setIsExpanded={toggleSidebar}
            activeView={activeView} // ✅ Add this
            setActiveView={setActiveView}
          />
        }
        main={
          activeView === "pipeline" ? (
            <PipelineDashboard />
          ) : (
            <ChatMain
              chat={chat}
              isTyping={isTyping}
              currentResponse={currentResponse}
              userInput={userInput}
              setInput={setInput}
              handleSend={handleSend}
              handleKeyPress={handleKeyPress}
              handleLike={handleLike}
              handleDislike={handleDislike}
              handleFileUpload={handleFileUpload}
              handleTypingComplete={handleTypingComplete}
              typingIndex={typingIndex}
              isSidebarExpanded={isSidebarExpanded}
              isWaitingForResponse={isWaitingForResponse}
              shouldAutoScroll={shouldAutoScroll}
              isResponseComplete={isResponseComplete}
              pendingFiles={pendingFiles}
              setPendingFiles={setPendingFiles}
            />
          )
        }
        isSidebarExpanded={isSidebarExpanded}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={handleEditChatHistoryCancel}
        modalTitle="Edit Chat Name"
      >
        <input
          type="text"
          value={editingTitle}
          onChange={handleEditChatHistoryChange}
          className="border rounded p-2 w-full mb-4"
        />
        <div className="flex justify-end">
          <button
            onClick={handleEditChatHistoryCancel}
            className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleEditChatHistorySave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
};
export default Chat;
